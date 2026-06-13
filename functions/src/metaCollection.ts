import {DocumentReference} from 'firebase-admin/firestore';

export const NAMED_META_COLLECTIONS = ['tracks', 'drivers', 'cars'] as const;
export type NamedMetaCollection = (typeof NAMED_META_COLLECTIONS)[number];
interface MetaCollection {
  nameMap: Record<string, string>;
}

const isNamedMetaCollection = (v: string): v is NamedMetaCollection =>
  NAMED_META_COLLECTIONS.includes(v as NamedMetaCollection);

const resolveMetaName = (
  collectionName: NamedMetaCollection,
  data: FirebaseFirestore.DocumentData,
): string | undefined => {
  switch (collectionName) {
    case 'tracks':
      return data?.trackData?.trackName;

    default:
      return undefined;
  }
};

const upsertMetaNameMap = async (
  firestore: FirebaseFirestore.Firestore,
  collection: string,
  id: string,
  value: string,
) => {
  const collectionRef = firestore
    .collection('meta')
    .doc(collection) as DocumentReference<MetaCollection>;
  return collectionRef.set({nameMap: {[id]: value}}, {merge: true});
};

export {isNamedMetaCollection, resolveMetaName, upsertMetaNameMap};
