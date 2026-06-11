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

const upsertMetaNameMap = async (
  firestore: FirebaseFirestore.Firestore,
  collection: string,
  id: string,
  value: string,
) => {
  const collectionRef = firestore.collection('meta').doc(collection);
  const currentNameMap = await collectionRef
    .get()
    .then(d => (d.exists ? d.data()?.['nameMap'] : {}));
  return collectionRef.set(
    {nameMap: {...currentNameMap, [id]: value}},
    {merge: true},
  );
};

export {updateCollectionMeta, upsertMetaNameMap};
