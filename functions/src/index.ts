import {onRequest} from 'firebase-functions/v2/https';
import {onSchedule} from 'firebase-functions/v2/scheduler';

// The Firebase Admin SDK to access Firestore.
import {initializeApp as initializeApp} from 'firebase-admin/app';
import {FieldValue, getFirestore} from 'firebase-admin/firestore';
import {getStorage} from 'firebase-admin/storage';
import {
  CloseSessionPayload,
  FastestLapRef,
  LapPayload,
  TelemetryDataSet,
} from './types';

const EXPIRY_HOURS = 24;

// Collection Definition
const LAPS = 'test_laps';
const SESSIONS = 'test_sessions';

const adminApp = initializeApp();
const firestore = getFirestore();
const storage = getStorage(adminApp);

export const checkTrackData = onRequest(async (request, response) => {
  const body = await request.body;
  const trackSnapshot = await firestore
    .collection('tracks')
    .doc(body.trackName)
    .get();
  // If the doc has no data, it does not exist
  if (!trackSnapshot.exists) {
    console.log('No Track Data Found');
    response.send({exists: false});
    return;
  }
  const trackData = trackSnapshot.data() ?? {};

  // Check for required values
  ['trackName', 'xOffset', 'yOffset', 'width', 'height', 'url', 'margin'].map(
    v => {
      if (!(v in trackData)) {
        console.log('Track Missing Key', v);
        response.send({exists: false});
        return;
      }
    },
  );
  response.send({trackName: body.trackName, exists: true});
});

export const handleTrackData = onRequest(async (request, response) => {
  const body = await request.body;

  const {image, ...trackData} = body;
  const trackDoc = firestore.collection('tracks').doc(trackData.trackName);
  const imageBuffer = Buffer.from(image, 'base64');
  const bucket = storage.bucket();

  const file = bucket.file(`tracks/${trackData.trackName}.png`);
  await file.save(imageBuffer);
  await trackDoc.set({...trackData, url: file.publicUrl()});
  response.send();
});

export const handleSessionSubmit = onRequest(async (request, response) => {
  // Handle the auth beforehand
  const body = await request.body;

  console.log('Track:', body.track);
  const trackDoc = firestore.collection('tracks').doc(body.track);
  await trackDoc.set({name: body.track}, {merge: true});
  console.log('Track ID', trackDoc.id);

  console.log('Car:', body.car);
  const carDoc = firestore.collection('cars').doc(body.car);
  await carDoc.set({name: body.car}, {merge: true});
  console.log('Car ID', carDoc.id);

  console.log('Driver:', body.driver);
  const driverDoc = firestore.collection('drivers').doc(body.driver);
  await driverDoc.set({name: body.driver}, {merge: true});
  console.log('Driver ID', driverDoc.id);

  const sessionResult = await firestore.collection('sessions').add({
    sessionType: body.sessionType,
    sessionTime: new Date(body.sessionTime),
    lapCount: body.lapCount,
    fastestLap: body.fastestLap,
    fastestLapTime: body.fastestLapTime,
    driver: driverDoc.id,
    car: carDoc.id,
    track: trackDoc.id,
  });

  console.log(`Sent Lap Data (${body.laps.length})`);

  const lapCollection = firestore.collection('laps');
  const lapBatch = firestore.batch();

  body.laps.map((lapData: object) => {
    const currentLapRef = lapCollection.doc();
    lapBatch.set(currentLapRef, {
      session: sessionResult.id,
      ...lapData,
    });
  });

  await lapBatch.commit();

  response.send({
    track: body.track,
    car: body.car,
    sessionId: sessionResult.id,
  });
  console.log('All Done!');
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
  const {driver, car, track, sessionTime, sessionType, trackSession} =
    sessionData;

  const {lapData, ...lapDetails} = lapFields;

  const canBeFastestLap = lapDetails.isValid && !lapDetails.isPit;

  // Handle session ID
  const receivedSessionId = lapPayload.sessionId;
  // TODO: Add flag to ignore session creation
  // Get the sessionRef if it exists or not
  const sessionRef = receivedSessionId
    ? firestore.collection(SESSIONS).doc(receivedSessionId)
    : firestore.collection(SESSIONS).doc();

  // Prepare refs for read/write
  const lapRef = firestore.collection(LAPS).doc();

  const driverRef = firestore.collection('drivers').doc(driver);
  const bestLapsRef = driverRef.collection(track).doc(car);

  const expiresAt = new Date(Date.now() + EXPIRY_HOURS * 60 * 60 * 1000);

  // Prepare for lap write and Fastest Lap Update
  await firestore.runTransaction(async transaction => {
    // Get the Lap Snapshot + Data
    const bestLapSnapshot = await transaction.get(bestLapsRef);

    // Always store lap data + telemetry
    transaction.set(lapRef, {
      ...lapDetails,
      sessionData,
      sessionId: sessionRef.id,
    });
    (Object.entries(lapData) as [string, TelemetryDataSet][]).map(
      ([telemetryKey, telemetryData]) =>
        transaction.set(lapRef.collection('telemetry').doc(telemetryKey), {
          data: telemetryData,
        }),
    );

    const laps: FastestLapRef[] = bestLapSnapshot.exists
      ? (bestLapSnapshot.data()?.laps ?? [])
      : [];

    // Ensure we have a driverRef
    transaction.set(driverRef, {name: driver}, {merge: true});
    if (canBeFastestLap) {
      // Not at 3 laps yet
      if (laps.length < 3) {
        const updatedLaps = [
          ...laps,
          {
            lapId: lapRef.id,
            lapTime: lapPayload.lapTime,
          },
        ].sort((a, b) => parseFloat(a.lapTime) - parseFloat(b.lapTime));
        // Store best lap with unset expiresAt
        transaction.set(bestLapsRef, {laps: updatedLaps});
      } else {
        // Check to replace slowest best-3 lap
        const slowest = laps.reduce((prev, curr) =>
          parseFloat(curr.lapTime) > parseFloat(prev.lapTime) ? curr : prev,
        );

        if (parseFloat(lapPayload.lapTime) < parseFloat(slowest.lapTime)) {
          const updatedLaps = laps
            .filter(l => l.lapId !== slowest.lapId)
            .concat({lapId: lapRef.id, lapTime: lapPayload.lapTime})
            .sort((a, b) => parseFloat(a.lapTime) - parseFloat(b.lapTime));

          const knockedOutRef = firestore.collection(LAPS).doc(slowest.lapId);
          transaction.update(knockedOutRef, {
            expiresAt,
          });
          transaction.set(bestLapsRef, {laps: updatedLaps});
        } else {
          // New lap doesn't make it - set it to expire
          transaction.set(lapRef, {expiresAt}, {merge: true});
        }
      }
    } else {
      // Expire an unsuitable lap
      transaction.set(lapRef, {expiresAt}, {merge: true});
    }

    // Handle session Update
    if (!receivedSessionId) {
      // First lap of a new session
      transaction.set(sessionRef, {
        driver,
        car,
        track,
        sessionTime,
        sessionType,
        expiresAt: trackSession ? undefined : expiresAt,
        // TODO: Improve data in Session eg. fastest lap
      });
    }
  });

  response.send({lapId: lapRef.id, sessionId: sessionRef.id});
  return;
});

export const closeSession = onRequest(async (request, response) => {
  const closeSessionRequest = (await request.body) as CloseSessionPayload;
  if (!closeSessionRequest.sessionId) {
    response.status(400).send('No session ID provided');
    return;
  }
  const sessionRef = firestore
    .collection(SESSIONS)
    .doc(closeSessionRequest.sessionId);
  try {
    await sessionRef.update({lapCount: closeSessionRequest.lapCount});
  } catch {
    response
      .status(404)
      .send(`No session found for ${closeSessionRequest.sessionId}`);
    return;
  }
  response.send({sessionId: sessionRef.id});
});

// TODO: Allow specifying a specific user, and triggering with a request
// TODO: Rename for clarity
export const deleteExpiredTestLaps = onSchedule('every 6 hours', async () => {
  const now = new Date();
  // Delete expired Sessions
  const expiredSessionSnapshot = await firestore
    .collection(SESSIONS)
    .where('expiresAt', '<=', now)
    .get();

  if (expiredSessionSnapshot.empty) {
    console.log('No expired test_sessions to delete');
  } else {
    const batch = firestore.batch();
    const lapBatches = expiredSessionSnapshot.docs.map(async session => {
      const removedSessionLaps = await firestore
        .collection(LAPS)
        .where('sessionId', '==', session.id)
        .get();
      removedSessionLaps.docs.forEach(lap =>
        batch.update(lap.ref, {sessionId: FieldValue.delete()}),
      );
      batch.delete(session.ref);
    });
    await Promise.all(lapBatches).then(() => batch.commit());
    console.log(
      `Deleted ${expiredSessionSnapshot.size} expired test_sessions.`,
    );
  }

  // Delete expired laps
  const expiredSnapshot = await firestore
    .collection(LAPS)
    .where('expiresAt', '<=', now)
    .get();

  if (expiredSnapshot.empty) {
    console.log('No expired test_laps to delete.');
  } else {
    const batch = firestore.batch();
    expiredSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref.collection('data').doc('telemetry'));
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log(`Deleted ${expiredSnapshot.size} expired test_laps.`);
  }
});
