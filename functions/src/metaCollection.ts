import {Timestamp} from 'firebase-admin/firestore';

const updateCollectionMeta = async (
  firestore: FirebaseFirestore.Firestore,
  collectionNames: string[],
) => {
  if (collectionNames.length === 0) {
    return;
  }
  const timestamp = Timestamp.now();
  const collectionRef = firestore.collection('meta').doc('lastUpdatedAt');
  await collectionRef.update(
    Object.fromEntries(collectionNames.map(c => [c, timestamp])),
  );
};

export {updateCollectionMeta};
