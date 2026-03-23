import {onRequest} from 'firebase-functions/v2/https';
import {onSchedule} from 'firebase-functions/v2/scheduler';

// The Firebase Admin SDK to access Firestore.
import {initializeApp as initializeApp} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
import {getStorage} from 'firebase-admin/storage';
import {FastestLapRef, LapPayload} from './types';

const EXPIRY_HOURS = 24;

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
  const {sessionData} = lapPayload;
  const {driver, car, track, sessionTime, sessionType, trackSession} =
    sessionData;

  const baseLapFields = {
    lapNumber: lapPayload.lapNumber,
    lapTime: lapPayload.lapTime,
    isValid: lapPayload.isValid,
    isPit: lapPayload.isPit,
    driver,
    car,
    track,
    sessionTime,
    sessionType,
  };

  if (!trackSession || sessionType !== 'RACE') {
    // State A — top-3 tracking non-session laps, and non-RACE session laps
    const expiresAt = new Date(Date.now() + EXPIRY_HOURS * 60 * 60 * 1000);
    const lapRef = firestore.collection('test_laps').doc();
    await lapRef.set({...baseLapFields, expiresAt});

    const dataRef = lapRef.collection('data').doc('telemetry');
    await dataRef.set(lapPayload.lapData);

    const driverRef = firestore.collection('drivers').doc(driver);
    const bestLapsRef = driverRef.collection(track).doc(car);

    await firestore.runTransaction(async transaction => {
      const carSnap = await transaction.get(bestLapsRef);
      const laps: FastestLapRef[] = carSnap.exists
        ? (carSnap.data()?.laps ?? [])
        : [];

      transaction.set(driverRef, {name: driver}, {merge: true});

      // Not at 3 laps yet
      if (laps.length < 3) {
        const updatedLaps = [
          ...laps,
          {
            lapId: lapRef.id,
            lapTime: lapPayload.lapTime,
          },
        ].sort((a, b) => parseFloat(a.lapTime) - parseFloat(b.lapTime));
        transaction.update(lapRef, {expiresAt: null});
        transaction.set(bestLapsRef, {laps: updatedLaps});
        return;
      }

      // Check to replace slowest best-3 lap
      const slowest = laps.reduce((prev, curr) =>
        parseFloat(curr.lapTime) > parseFloat(prev.lapTime) ? curr : prev,
      );

      if (parseFloat(lapPayload.lapTime) < parseFloat(slowest.lapTime)) {
        const updatedLaps = laps
          .filter(l => l.lapId !== slowest.lapId)
          .concat({lapId: lapRef.id, lapTime: lapPayload.lapTime})
          .sort((a, b) => parseFloat(a.lapTime) - parseFloat(b.lapTime));

        const knockedOutRef = firestore
          .collection('test_laps')
          .doc(slowest.lapId);
        const knockedOutExpiresAt = new Date(
          Date.now() + EXPIRY_HOURS * 60 * 60 * 1000,
        );
        transaction.update(knockedOutRef, {expiresAt: knockedOutExpiresAt});
        transaction.update(lapRef, {expiresAt: null});
        transaction.set(bestLapsRef, {laps: updatedLaps});
      }
      // else: does not qualify — expiresAt stays as written
    });

    response.send({lapId: lapRef.id});
    return;
  }

  // State B — RACE session lap
  // TODO: Ensure these laps are also treated as potential best-3 laps
  // and not deleted when the session is cleared
  const lapRef = firestore.collection('test_laps').doc();

  // Sesssion already created
  if (lapPayload.sessionId) {
    await lapRef.set({...baseLapFields, sessionId: lapPayload.sessionId});
    response.send({lapId: lapRef.id, sessionId: lapPayload.sessionId});
    return;
  }

  // First lap of a new session — create session inline
  const sessionRef = firestore.collection('test_sessions').doc();
  await sessionRef.set({
    driver,
    car,
    track,
    sessionTime,
    sessionType,
    trackSession: true,
  });
  await lapRef.set({...baseLapFields, sessionId: sessionRef.id});
  response.send({lapId: lapRef.id, sessionId: sessionRef.id});
});

// TODO: Allow specifying a specific user, and triggering with a request
export const deleteExpiredTestLaps = onSchedule('every 6 hours', async () => {
  const now = new Date();
  const expiredSnapshot = await firestore
    .collection('test_laps')
    .where('expiresAt', '<=', now)
    .get();

  if (expiredSnapshot.empty) {
    console.log('No expired test_laps to delete.');
    return;
  }

  const batch = firestore.batch();
  expiredSnapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();

  console.log(`Deleted ${expiredSnapshot.size} expired test_laps.`);
});
