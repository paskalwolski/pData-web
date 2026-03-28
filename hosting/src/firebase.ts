import { initializeApp } from "firebase/app";
import {
    getFirestore,
    doc,
    getDoc,
} from "firebase/firestore";
import { getDownloadURL, getStorage, ref} from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDnFq6i1fT8dfPCNNO6HD9Fo05RtZDBQmk",
    authDomain: "tidy-jetty-437707-n7.firebaseapp.com",
    projectId: "tidy-jetty-437707-n7",
    storageBucket: "tidy-jetty-437707-n7.firebasestorage.app",
    messagingSenderId: "888243745906",
    appId: "1:888243745906:web:085e1c0b74f595ba4c7eeb",
};

const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);

export const storage = getStorage();

export const getTrackData = async (trackName: string) => {
    console.log("Getting track", trackName)
    const trackData = await getDoc(doc(db, "tracks", trackName));
    if (trackData.exists()){
        const data = trackData.data();
        if ('url' in data){
            const imageRef = ref(storage, data.url);
            const url = await getDownloadURL(imageRef)
            data.url = url;
        }
        return data;
    } else {
        return null;
    }
}
