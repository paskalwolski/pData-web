import {
  AggregateChannelDoc,
  AggregateStatus,
  SessionDetail,
  TelemetryChannelDoc,
  TelemetryDataSet,
} from './types';

const LAPS = 'test_laps';
const GAS_CHANNEL = 'gas';
const FULL_THROTTLE_CHECK_DISTANCE = 50;
const FULL_THROTTLE = 1;

const hasThrottleBackoff = (gas: TelemetryDataSet): boolean => {
  const window = gas.slice(0, FULL_THROTTLE_CHECK_DISTANCE);
  const firstFullIndex = window.findIndex(
    v => v !== null && v >= FULL_THROTTLE,
  );
  if (firstFullIndex === -1) {
    return true;
  }
  return !window
    .slice(firstFullIndex)
    .every(v => v !== null && v >= FULL_THROTTLE);
};

interface AggregateResult {
  status: AggregateStatus;
  alreadyProcessing?: boolean;
}

const computeSessionAggregate = async (
  firestore: FirebaseFirestore.Firestore,
  sessionRef: FirebaseFirestore.DocumentReference<SessionDetail>,
): Promise<AggregateResult> => {
  // Atomically claim the job: only one invocation may move pending -> processing.
  const claim = await firestore.runTransaction(async tx => {
    const status = (await tx.get(sessionRef)).data()?.aggregateStatus;
    if (status !== 'pending') {
      return {claimed: false, status};
    }
    tx.update(sessionRef, {aggregateStatus: 'processing'});
    return {claimed: true, status: 'processing' as const};
  });

  if (!claim.claimed) {
    return {status: claim.status ?? 'not_ready', alreadyProcessing: true};
  }

  try {
    const lapSnapshot = await firestore
      .collection(LAPS)
      .where('sessionId', '==', sessionRef.id)
      .where('lapNumber', '!=', 1)
      .get();

    if (lapSnapshot.empty) {
      await sessionRef.update({aggregateStatus: 'completed'});
      return {status: 'completed'};
    }

    // One query per lap (not per channel) -- fetches all of that lap's channel docs at once.
    const perLapTelemetry = await Promise.all(
      lapSnapshot.docs.map(lapDoc => lapDoc.ref.collection('telemetry').get()),
    );

    const includedLapTelemetry = perLapTelemetry.filter((snapshot, i) => {
      if (lapSnapshot.docs[i].data().lapNumber !== 2) {
        return true;
      }
      const gas = snapshot.docs.find(d => d.id === GAS_CHANNEL)?.data() as
        | TelemetryChannelDoc
        | undefined;

      return gas === undefined || !hasThrottleBackoff(gas.data);
    });

    const channelArrays = new Map<string, TelemetryDataSet[]>();
    for (const snapshot of includedLapTelemetry) {
      for (const channelDoc of snapshot.docs) {
        const arrays = channelArrays.get(channelDoc.id) ?? [];
        arrays.push((channelDoc.data() as TelemetryChannelDoc).data);
        channelArrays.set(channelDoc.id, arrays);
      }
    }

    const batch = firestore.batch();
    const aggregateCollection = sessionRef.collection('aggregateTelemetry');

    for (const [channel, arrays] of channelArrays) {
      const length = Math.min(...arrays.map(a => a.length));
      const min: TelemetryDataSet = new Array(length);
      const max: TelemetryDataSet = new Array(length);
      const mean: TelemetryDataSet = new Array(length);

      for (let i = 0; i < length; i++) {
        const defined = arrays
          .map(a => a[i])
          .filter((v): v is number => v !== null);

        if (defined.length === 0) {
          min[i] = null;
          max[i] = null;
          mean[i] = null;
        } else {
          min[i] = Math.min(...defined);
          max[i] = Math.max(...defined);
          mean[i] = defined.reduce((a, b) => a + b, 0) / defined.length;
        }
      }

      const doc: AggregateChannelDoc = {min, max, mean};
      batch.set(aggregateCollection.doc(channel), doc);
    }

    batch.update(sessionRef, {aggregateStatus: 'completed'});
    await batch.commit();
    return {status: 'completed'};
  } catch (err) {
    console.error(
      `computeSessionAggregate failed for session ${sessionRef.id}`,
      err,
    );
    await sessionRef.update({aggregateStatus: 'failed'}).catch(() => undefined);
    return {status: 'failed'};
  }
};

export {computeSessionAggregate};
