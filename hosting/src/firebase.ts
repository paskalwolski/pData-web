import { initializeApp } from "firebase/app";
import {
    getFirestore,
} from "firebase/firestore";
import { getStorage} from "firebase/storage";

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


