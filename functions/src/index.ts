import {HttpsError, onCall, onRequest} from 'firebase-functions/v2/https';
import {onSchedule} from 'firebase-functions/v2/scheduler';

// The Firebase Admin SDK to access Firestore.
import {initializeApp as initializeApp} from 'firebase-admin/app';
import {
  DocumentReference,
  FieldValue,
  getFirestore,
} from 'firebase-admin/firestore';
import {getStorage} from 'firebase-admin/storage';
import {
  AggregateSessionPayload,
  CloseSessionPayload,
  LapPayload,
  SaveSessionPayload,
  SessionData,
  SessionDetail,
  SessionLapDetail,
  TelemetryDataSet,
  TrackPayload,
} from './types';
import {
  onDocumentUpdated,
  onDocumentWritten,
} from 'firebase-functions/firestore';

import {
  isNamedMetaCollection,
  resolveMetaName,
  upsertMetaNameMap,
} from './metaCollection';
import {handleFastestLap} from './bestAttempts';
import {computeSessionAggregate} from './aggregateTelemetry';
import {isConstantSeries} from './helpers';

// Collection Definition
const LAPS = 'test_laps';
const SESSIONS = 'test_sessions';

const adminApp = initializeApp();
const firestore = getFirestore();
firestore.settings({ignoreUndefinedProperties: true});

const storage = getStorage(adminApp);

export const checkTrackData = onRequest(async (request, response) => {
  const body = await request.body;
  const trackId = body?.trackId;
  if (!trackId) {
    response.status(400).send();
    return;
  }
  const trackSnapshot = await firestore.collection('tracks').doc(trackId).get();
  // If the doc has no data, it does not exist
  if (!trackSnapshot.exists) {
    console.log('No Track Data Found');
    response.status(204).send();
    return;
  }

  const trackData = trackSnapshot.data();
  response.send({exists: true, trackData});
});

export const handleTrackData = onRequest(async (request, response) => {
  const body = (await request.body) as TrackPayload;

  const {trackId, trackData: trackBundle} = body;
  const {
    trackData,
    mapData: {image, ...mapData},
    sectionData,
  } = trackBundle;
  const trackDoc = firestore.collection('tracks').doc(trackId);
  const imageBuffer = Buffer.from(image, 'base64');
  const bucket = storage.bucket();

  const file = bucket.file(`tracks/${trackId}.png`);
  await file.save(imageBuffer, {metadata: {contentType: 'image/png'}});
  const processedMapData = {...mapData, url: file.publicUrl()};

  const trackDocUpdate = trackDoc.set({
    trackData,
    mapData: processedMapData,
    sectionData,
  });

  await trackDocUpdate;
  response.send();
});

export const handleLap = onRequest(async (request, response) => {
  // Handle empty payload, to manage session opening request
  const payload = await request.body;
  if (!payload?.sessionData) {
    response.status(202).send();
    return;
  }
  const lapPayload: LapPayload = payload as LapPayload;
  const {sessionData, ...lapFields} = lapPayload;

  const {driver, car, track, sessionType} = sessionData;

  const {lapData, ...lapDetails} = lapFields;

  const isValidLap = lapDetails.isValid && !lapDetails.isPit;

  // Handle session ID
  const receivedSessionId = lapPayload.sessionId;
  // TODO: Add flag to ignore session creation
  // Get the sessionRef if it exists or not
  const sessionRef = receivedSessionId
    ? (firestore
        .collection(SESSIONS)
        .doc(receivedSessionId) as DocumentReference<SessionDetail>)
    : undefined;

  const lapRef = isValidLap ? firestore.collection(LAPS).doc() : undefined;
  const driverRef = firestore.collection('drivers').doc(driver);

  const now = Date.now();

  const lapTimestamp = new Date(now);
  const lapDocumentData = {
    lapTimestamp,
    ...lapDetails,
    sessionData,
    sessionId: sessionRef?.id,
    expiresAt: null,
  };

  if (lapRef) {
    // Store lap data + telemetry for valid laps
    await firestore.runTransaction(async transaction => {
      transaction.set(lapRef, lapDocumentData);
      (Object.entries(lapData) as [string, TelemetryDataSet][])
        .filter(([, telemetryData]) => !isConstantSeries(telemetryData))
        .map(([telemetryKey, telemetryData]) =>
          transaction.set(lapRef.collection('telemetry').doc(telemetryKey), {
            data: telemetryData,
          }),
        );

      // Update the driver meta collection for best laps
      const bestAttemptsRef = driverRef.collection(track).doc(car);

      await handleFastestLap(
        firestore,
        transaction,
        bestAttemptsRef,
        lapRef,
        lapDetails.lapTime,
      );
    });
  }

  if (sessionRef) {
    // Add the lap meta to the session
    const batch = firestore.batch();
    const sessionDoc = (await sessionRef.get()).data();
    const currentSessionLaps = sessionDoc?.lapData ?? [];
    const newLapDetail: SessionLapDetail = {
      id: lapRef?.id,
      isPit: lapDocumentData.isPit,
      isValid: lapDocumentData.isValid,
      lapTime: lapDocumentData.lapTime,
      lapNumber: lapDocumentData.lapNumber,
    };
    batch.update(sessionRef, {
      lapData: [...currentSessionLaps, newLapDetail],
    });

    if (lapRef && sessionType !== 'HOTLAP') {
      const now = Date.now();
      const expiresAt = new Date(now + 24 * 60 * 60 * 1000);

      batch.update(sessionRef, {
        expiresAt,
      });
    }
    await batch.commit();
  }

  response.send({lapId: lapRef?.id, sessionId: sessionRef?.id});
  return;
});

export const createSession = onRequest(async (request, response) => {
  const createSessionBody = (await request.body) as SessionData;

  const detailBatch = firestore.batch();

  const EARLY_EXPIRY_MINUTES = 15;
  const earlyExpiresAt = new Date(
    Date.now() + 1000 * 60 * EARLY_EXPIRY_MINUTES,
  );

  const trackRef = firestore.collection('tracks').doc(createSessionBody.track);
  detailBatch.set(trackRef, {}, {merge: true});

  const carRef = firestore.collection('cars').doc(createSessionBody.car);
  detailBatch.set(carRef, {}, {merge: true});

  const driverRef = firestore
    .collection('drivers')
    .doc(createSessionBody.driver);
  detailBatch.set(driverRef, {}, {merge: true});

  const sessionRef = firestore.collection(SESSIONS).doc();
  detailBatch.set(sessionRef, {
    sessionId: sessionRef.id,
    expiresAt: earlyExpiresAt,
    lapData: [],
    ...createSessionBody,
  });

  await detailBatch.commit();

  response.send({sessionId: sessionRef.id});
});

export const closeSession = onRequest(async (request, response) => {
  const closeSessionBody = (await request.body) as CloseSessionPayload;
  if (!closeSessionBody.sessionId) {
    response.status(400).send('No session ID provided');
    return;
  }

  const sessionRef = firestore
    .collection(SESSIONS)
    .doc(closeSessionBody.sessionId);

  const sessionLapRefs = await firestore
    .collection(LAPS)
    .where('sessionId', '==', sessionRef.id)
    .orderBy('lapTime')
    .get();
  const validLaps = sessionLapRefs.docs.length;
  if (validLaps === 0) {
    // If we have no stored valid laps, drop the session immediately
    await sessionRef.delete();
  } else {
    const bestLap = sessionLapRefs.docs[0];

    await sessionRef.update({
      ...closeSessionBody,
      bestLapTime: bestLap.data().lapTime,
      validLaps,
      aggregateStatus: 'ready',
    });
  }

  response.send({sessionId: sessionRef.id});
});

export const saveSession = onCall<SaveSessionPayload>(async request => {
  const saveSessionBody = request.data;
  if (!saveSessionBody?.id) {
    throw new HttpsError('invalid-argument', 'No session ID provided');
  }
  const batch = firestore.batch();
  const sessionRef = firestore
    .collection(SESSIONS)
    .doc(saveSessionBody.id) as DocumentReference<SessionDetail>;
  const sessionSnap = await sessionRef.get();

  if (!sessionSnap.exists) {
    throw new HttpsError('not-found', 'No matching session found');
  }

  const sessionData = sessionSnap.data();

  const currentAggregateStatus = sessionData?.aggregateStatus;
  // Only pass from 'ready' to 'pending'
  const aggregateStatus =
    currentAggregateStatus === 'ready' ? 'pending' : currentAggregateStatus;

  const lapDocs = await firestore
    .collection(LAPS)
    .where('sessionId', '==', saveSessionBody.id)
    .orderBy('lapTime')
    .get();

  // Without keepAllLaps, only the fastest valid lap survives; the rest stay expirable
  const keptLapIds = new Set(
    saveSessionBody.keepAllLaps
      ? lapDocs.docs.map(l => l.id)
      : lapDocs.docs
          .filter(l => l.get('isValid') && !l.get('isPit'))
          .slice(0, 1)
          .map(l => l.id),
  );

  lapDocs.docs
    .filter(l => keptLapIds.has(l.id))
    .forEach(l => batch.update(l.ref, {expiresAt: null}));

  batch.update(sessionRef, {expiresAt: null, aggregateStatus});

  await batch.commit();
});

export const triggerSessionAggregate = onCall<AggregateSessionPayload>(
  async request => {
    const triggerSessionAggregateBody = request.data;

    if (!triggerSessionAggregateBody?.sessionId) {
      throw new HttpsError('invalid-argument', 'No session ID provided');
    }

    const sessionRef = firestore
      .collection(SESSIONS)
      .doc(
        triggerSessionAggregateBody.sessionId,
      ) as DocumentReference<SessionDetail>;
    const sessionSnap = await sessionRef.get();
    if (!sessionSnap.exists) {
      throw new HttpsError('not-found', 'No matching session found');
    }
    const sessionData = sessionSnap.data();
    if (sessionData?.aggregateStatus === 'unavailable') {
      throw new HttpsError(
        'failed-precondition',
        'Session lap data has been partially cleaned up and can no longer be aggregated',
      );
    }
    if (sessionData?.aggregateStatus !== 'ready') {
      throw new HttpsError(
        'failed-precondition',
        'Session data is not ready for processing',
      );
    }
    await sessionRef.update({aggregateStatus: 'pending'});
  },
);

// TODO: Allow specifying a specific user, and triggering with a request
// TODO: Rename for clarity
export const deleteExpiredTestLaps = onSchedule('every 6 hours', async () => {
  const now = new Date();
  // Delete expired Sessions
  const expiredSessionSnapshot = await firestore
    .collection(SESSIONS)
    .where('expiresAt', '<=', now)
    .orderBy('expiresAt', 'asc')
    .get();

  if (expiredSessionSnapshot.empty) {
    console.log('No expired test_sessions to delete');
  } else {
    console.log(`Found ${expiredSessionSnapshot.docs.length} expired sessions`);

    const sessionBatches = expiredSessionSnapshot.docs
      .slice(0, 100)
      .map(async sessionDoc => {
        const sessionBatch = firestore.batch();
        const linkedLapDocs = await firestore
          .collection(LAPS)
          .where('sessionId', '==', sessionDoc.id)
          .get();
        linkedLapDocs.docs.forEach(l =>
          sessionBatch.update(l.ref, {sessionId: FieldValue.delete()}),
        );
        sessionBatch.delete(sessionDoc.ref);
        return sessionBatch.commit();
      });
    await Promise.all(sessionBatches);
    console.log(`Deleted ${sessionBatches.length} session documents`);
  }

  // Delete expired laps
  const expiredLapSnapshot = await firestore
    .collection(LAPS)
    .where('expiresAt', '<=', now)
    .orderBy('expiresAt', 'asc')
    .get();

  if (expiredLapSnapshot.empty) {
    console.log('No expired test_laps to delete.');
  } else {
    console.log(`Found ${expiredLapSnapshot.docs.length} expired laps.`);

    const expiredLaps = expiredLapSnapshot.docs.slice(0, 100);

    // Flag targeted sessions as unavailable before deleting any laps, so an
    // aggregate can't be started against partial lap data
    const targetedSessionIds = new Set(
      expiredLaps
        .map(lap => lap.get('sessionId') as string | undefined)
        .filter(id => !!id) as string[],
    );
    // Sessions mid-aggregation keep their laps until a later cleanup run
    const blockedSessionIds = new Set(
      (
        await Promise.all(
          [...targetedSessionIds].map(sessionId =>
            firestore.runTransaction(async tx => {
              const sessionRef = firestore
                .collection(SESSIONS)
                .doc(sessionId) as DocumentReference<SessionDetail>;
              const sessionSnap = await tx.get(sessionRef);
              const aggregateStatus = sessionSnap.data()?.aggregateStatus;
              if (
                aggregateStatus === 'pending' ||
                aggregateStatus === 'processing'
              ) {
                return sessionId;
              }
              if (sessionSnap.exists && aggregateStatus !== 'completed') {
                tx.update(sessionRef, {aggregateStatus: 'unavailable'});
              }
              return undefined;
            }),
          ),
        )
      ).filter(id => !!id),
    );

    const lapsToDelete = expiredLaps.filter(
      lap => !blockedSessionIds.has(lap.get('sessionId')),
    );
    if (blockedSessionIds.size) {
      console.log(
        `Skipping ${expiredLaps.length - lapsToDelete.length} laps from ${blockedSessionIds.size} sessions mid-aggregation`,
      );
    }

    const lapsBySessionId = new Map<string, typeof lapsToDelete>();
    lapsToDelete.forEach(lap => {
      const sessionId = (lap.get('sessionId') as string | undefined) ?? '';
      lapsBySessionId.set(sessionId, [
        ...(lapsBySessionId.get(sessionId) ?? []),
        lap,
      ]);
    });

    const lapBatches = [...lapsBySessionId.entries()].map(
      async ([sessionId, laps]) => {
        const lapBatch = firestore.batch();
        await Promise.all(
          laps.map(async lap => {
            const linkedTelemetryDocs = await lap.ref
              .collection('telemetry')
              .listDocuments();
            linkedTelemetryDocs.forEach(t => lapBatch.delete(t));
            lapBatch.delete(lap.ref);
          }),
        );

        if (sessionId) {
          const sessionRef = firestore
            .collection(SESSIONS)
            .doc(sessionId) as DocumentReference<SessionDetail>;
          const sessionSnap = await sessionRef.get();
          const currentLapData = sessionSnap.data()?.lapData ?? [];
          const deletedLapIds = new Set(laps.map(l => l.id));
          lapBatch.update(sessionRef, {
            lapData: currentLapData.map(l =>
              deletedLapIds.has(l.id!) ? {...l, dropped: true} : l,
            ),
          });
        }

        return lapBatch.commit();
      },
    );
    await Promise.all(lapBatches);
    console.log(
      `Deleted ${lapsToDelete.length} expired test_laps and telemetry`,
    );
  }
});

export const syncMetaName = onDocumentWritten(
  '{collection}/{id}',
  async event => {
    const {collection, id} = event.params;
    if (!isNamedMetaCollection(collection)) {
      return;
    }

    const data = event.data?.after.data();
    if (!data) {
      // TODO: Handle doc delete
      return;
    }

    const metaName = resolveMetaName(collection, data);
    await upsertMetaNameMap(firestore, collection, id, metaName ?? id);
  },
);

export const calculateSessionAggregate = onDocumentUpdated(
  {
    document: `${SESSIONS}/{sessionId}`,
    memory: '1GiB',
  },
  async event => {
    const before = event.data?.before.data() as SessionDetail | undefined;
    const after = event.data?.after.data() as SessionDetail | undefined;

    // Only proceed on the transition INTO 'pending' -- this is what stops
    // this trigger's own subsequent writes (processing/completed/failed)
    // from re-triggering itself, and ignores unrelated session-doc writes.
    if (
      !after ||
      before?.aggregateStatus !== 'ready' ||
      after.aggregateStatus !== 'pending'
    ) {
      return;
    }

    const sessionRef = firestore
      .collection(SESSIONS)
      .doc(event.params.sessionId) as DocumentReference<SessionDetail>;
    await computeSessionAggregate(firestore, sessionRef);
  },
);
