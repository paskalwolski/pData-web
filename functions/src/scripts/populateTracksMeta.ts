import {initializeApp, applicationDefault} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';

initializeApp({credential: applicationDefault()});
const db = getFirestore();

async function run() {
  const snapshot = await db.collection('tracks').get();
  const results: Array<{id: string; name: string}> = [];

  for (const doc of snapshot.docs) {
    const name: string = doc.data()?.trackData?.trackName ?? doc.id;
    await db
      .collection('meta')
      .doc('tracks')
      .set({nameMap: {[doc.id]: name}}, {merge: true});
    results.push({id: doc.id, name: name});
  }

  console.log(`Populated ${results.length} tracks:`);
  results.forEach(r => console.log(`  ${r.id} → ${r.name}`));
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
