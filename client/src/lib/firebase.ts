import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBNXcsqGAXCFi33Qhj4Ckkiq96lYRJ_ehs",
    authDomain: "stream-zone-1c765.firebaseapp.com",
    projectId: "stream-zone-1c765",
    storageBucket: "stream-zone-1c765.firebasestorage.app",
    messagingSenderId: "962843146561",
    appId: "1:962843146561:web:a6cbbcc9fdd65fcd8989c0",
    measurementId: "G-EEF70T2M1E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics conditionally (only in browser and if supported)
export const analytics = typeof window !== "undefined"
    ? isSupported().then((yes: boolean) => yes ? getAnalytics(app) : null)
    : null;

export const db = getFirestore(app);
export default app;
