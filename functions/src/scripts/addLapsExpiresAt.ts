import {initializeApp, applicationDefault} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';

initializeApp({credential: applicationDefault()});
const db = getFirestore();

async function run() {
  const batch = db.batch();

  const laps = await db.collection('test_laps').get();
  laps.docs.forEach(l => batch.update(l.ref, {expiresAt: null}));

  await batch.commit();

  console.log(`Set 'expiresAt' field for ${laps.docs.length} test laps`);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
