import {Timestamp} from 'firebase-admin/firestore';

const updateCollectionMeta = async (
  firestore: FirebaseFirestore.Firestore,
  collectionNames: string[],
) => {
  if (collectionNames.length === 0) {
    return;
  }
  const timestamp = Timestamp.now();
  const batch = firestore.batch();
  collectionNames.forEach(cName => {
    const colRef = firestore.collection('meta').doc(cName);
    batch.set(colRef, {lastUpdated: timestamp}, {merge: true});
  });
  await batch.commit();
};

export {updateCollectionMeta};
