import {onRequest} from 'firebase-functions/v2/https';
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
  CloseSessionPayload,
  LapPayload,
  SaveSessionPayload,
  SessionData,
  SessionDetail,
  SessionLapDetail,
  TelemetryDataSet,
  TrackPayload,
} from './types';
import {onDocumentWritten} from 'firebase-functions/firestore';
import {
  isNamedMetaCollection,
  resolveMetaName,
  upsertMetaNameMap,
} from './metaCollection';
import {handleFastestLap} from './bestAttempts';

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
      (Object.entries(lapData) as [string, TelemetryDataSet][]).map(
        ([telemetryKey, telemetryData]) =>
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

    await sessionRef.update(sessionRef, {
      ...closeSessionBody,
      bestLapTime: bestLap.data().lapTime,
      validLaps,
    });
  }

  response.send({sessionId: sessionRef.id});
});

export const saveSession = onRequest(async (request, response) => {
  const saveSessionBody = (await request.body) as SaveSessionPayload;
  if (!saveSessionBody.id) {
    response.status(400).send('No session ID provided');
    return;
  }
  const batch = firestore.batch();
  const sessionRef = firestore.collection(SESSIONS).doc(saveSessionBody.id);
  batch.update(sessionRef, {expiresAt: null});
  const lapDocs = await firestore
    .collection(LAPS)
    .where('sessionId', '==', saveSessionBody.id)
    .get();

  lapDocs.docs.forEach(l => batch.update(l.ref, {expiresAt: null}));

  await batch.commit();
});

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
    const lapBatches = expiredLapSnapshot.docs.slice(0, 100).map(async lap => {
      const lapBatch = firestore.batch();
      const linkedTelemetryDocs = await lap.ref
        .collection('telemetry')
        .listDocuments();
      linkedTelemetryDocs.forEach(t => lapBatch.delete(t));
      lapBatch.delete(lap.ref);
      return lapBatch.commit();
    });
    await Promise.all(lapBatches);
    console.log(`Deleted ${lapBatches.length} expired test_laps and telemetry`);
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
