import {FastestLapRef} from './types';

const EXPIRY_HOURS = 24;

const handleFastestLap = async (
  firestore: FirebaseFirestore.Firestore,
  transaction: FirebaseFirestore.Transaction,
  fastestLapsRef: FirebaseFirestore.DocumentReference,
  lapRef: FirebaseFirestore.DocumentReference,
  lapTime: string,
) => {
  const now = Date.now();
  const expiresAt = new Date(now + EXPIRY_HOURS * 60 * 60 * 1000);

  const fastestLaps = await fastestLapsRef.get();

  const laps: FastestLapRef[] = fastestLaps.exists
    ? (fastestLaps.data()?.laps ?? [])
    : [];

  // Not at 3 laps yet
  if (laps.length < 3) {
    const updatedLaps = [
      ...laps,
      {
        lapId: lapRef.id,
        lapTime: lapTime,
      },
    ].sort((a, b) => parseFloat(a.lapTime) - parseFloat(b.lapTime));
    // Store best lap with unset expiresAt
    transaction.update(fastestLapsRef, {laps: updatedLaps});
  } else {
    // Check to replace slowest best-3 lap
    const slowest = laps.reduce((prev, curr) =>
      parseFloat(curr.lapTime) > parseFloat(prev.lapTime) ? curr : prev,
    );

    if (parseFloat(lapTime) < parseFloat(slowest.lapTime)) {
      const updatedLaps = laps
        .filter(l => l.lapId !== slowest.lapId)
        .concat({lapId: lapRef.id, lapTime: lapTime})
        .sort((a, b) => parseFloat(a.lapTime) - parseFloat(b.lapTime));

      const knockedOutRef = firestore
        .collection('test_laps')
        .doc(slowest.lapId);
      transaction.update(knockedOutRef, {
        expiresAt,
      });
      transaction.update(fastestLapsRef, {laps: updatedLaps});
    } else {
      // New lap doesn't make it - set it to expire
      transaction.update(lapRef, {expiresAt});
    }
  }
};

export {handleFastestLap};
