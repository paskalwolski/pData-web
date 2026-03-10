import {onRequest} from "firebase-functions/v2/https";

// Type completion
// import functions = require("firebase-functions");
// import admin = require("firebase-admin");

// The Firebase Admin SDK to access Firestore.
import {initializeApp as initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
import {getStorage} from "firebase-admin/storage";
import {FastestLapRef, LapPayload, SessionPayload} from "./types";

const adminApp = initializeApp();
const firestore = getFirestore();
const storage = getStorage(adminApp);

export const checkTrackData = onRequest(async (request, response) => {
  const body = await request.body;
  const trackSnapshot = await firestore
    .collection("tracks")
    .doc(body.trackName)
    .get();
  // If the doc has no data, it does not exist
  if (!trackSnapshot.exists) {
    console.log("No Track Data Found");
    response.send({exists: false});
    return;
  }
  const trackData = trackSnapshot.data() ?? {};

  // Check for required values
  ["trackName", "xOffset", "yOffset", "width", "height", "url", "margin"]
    .map((v) => {
      if (!(v in trackData)) {
        console.log("Track Missing Key", v);
        response.send({exists: false});
        return;
      }
    });
  response.send({trackName: body.trackName, exists: true});
});

export const handleTrackData = onRequest(async (request, response) => {
  const body = await request.body;

  const {image, ...trackData} = body;
  const trackDoc = firestore.collection("tracks").doc(trackData.trackName);
  const imageBuffer = Buffer.from(image, "base64");
  const bucket = storage.bucket();

  const file = bucket.file(`tracks/${trackData.trackName}.png`);
  await file.save(imageBuffer);
  await trackDoc.set({...trackData, url: file.publicUrl()});
  response.send();
});

export const handleSessionSubmit = onRequest(async (request, response) => {
  // Handle the auth beforehand
  const body = await request.body;

  console.log("Track:", body.track);
  const trackDoc = firestore.collection("tracks").doc(body.track);
  await trackDoc.set({name: body.track}, {merge: true});
  console.log("Track ID", trackDoc.id);

  console.log("Car:", body.car);
  const carDoc = firestore.collection("cars").doc(body.car);
  await carDoc.set({name: body.car}, {merge: true});
  console.log("Car ID", carDoc.id);

  console.log("Driver:", body.driver);
  const driverDoc = firestore.collection("drivers").doc(body.driver);
  await driverDoc.set({name: body.driver}, {merge: true});
  console.log("Driver ID", driverDoc.id);

  const sessionResult = await firestore.collection("sessions").add({
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

  const lapCollection = firestore.collection("laps");
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
  console.log("All Done!");
});

export const handleLap = onRequest(async (request, response) => {
  const lapPayload: LapPayload = await request.body;

  if (!lapPayload.sessionId) {
    response.send({dropped: true, reason: "no session id provided"});
    return;
  }

  const sessionRef = firestore.collection("test_sessions")
    .doc(lapPayload.sessionId);
  const lapRef = firestore.collection("test_laps").doc();

  await firestore.runTransaction(async (transaction) => {
    const sessionSnap = await transaction.get(sessionRef);

    if (!sessionSnap.exists) {
      response.send({dropped: true, reason: "session not found"});
      return;
    }

    const session = sessionSnap.data() ?? {};
    // Default limit of 3 laps per session
    const keepAllLaps: boolean = session.keepAllLaps ?? false;
    const fastestLaps: FastestLapRef[] = session.fastestLaps ?? [];

    if (keepAllLaps) {
      transaction.create(lapRef, lapPayload);
      response.send({lapId: lapRef.id});
      return;
    }

    // Limited mode — maintain up to 3 fastest laps
    if (fastestLaps.length < 3) {
      transaction.create(lapRef, lapPayload);
      transaction.update(sessionRef, {
        fastestLaps: [
          ...fastestLaps,
          {lapId: lapRef.id, lapTime: lapPayload.lapTime},
        ].sort((a, b) => parseFloat(a.lapTime) - parseFloat(b.lapTime)),
      });
      response.send({sessionId: sessionRef.id, lapId: lapRef.id});
      return;
    }

    const slowest = fastestLaps.reduce((prev, curr) =>
      parseFloat(curr.lapTime) > parseFloat(prev.lapTime) ? curr : prev
    );

    if (parseFloat(lapPayload.lapTime) >= parseFloat(slowest.lapTime)) {
      response.send({
        sessionId: sessionRef.id,
        dropped: true,
        reason: "not faster than current top 3",
      });
      return;
    }

    // New lap beats the slowest — replace it
    const updatedFastestLaps = fastestLaps
      .filter((l) => l.lapId !== slowest.lapId)
      .concat({lapId: lapRef.id, lapTime: lapPayload.lapTime})
      .sort((a, b) => parseFloat(a.lapTime) - parseFloat(b.lapTime));

    transaction.create(lapRef, lapPayload);
    transaction.delete(firestore.collection("test_laps").doc(slowest.lapId));
    transaction.update(sessionRef, {fastestLaps: updatedFastestLaps});
    response.send({lapId: lapRef.id, sessionId: sessionRef.id});
  });
});


export const createSession = onRequest(async (request, response) => {
  const sessionPayload: SessionPayload = await request.body;
  const sessionRef = firestore.collection("test_sessions").doc();
  await sessionRef.set({
    sessionType: sessionPayload.sessionType,
    sessionTime: new Date(sessionPayload.sessionTime),
    driver: sessionPayload.driver,
    car: sessionPayload.car,
    track: sessionPayload.track,
  });
  response.send({sessionId: sessionRef.id});
});
