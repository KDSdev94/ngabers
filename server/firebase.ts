import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

let app;

if (getApps().length === 0) {
    // Check if running on Vercel with service account credentials
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
        try {
            const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
            app = initializeApp({
                credential: cert(serviceAccount)
            });
            console.log("[Firebase] Initialized with service account from environment variable");
        } catch (error) {
            console.error("[Firebase] Error parsing service account JSON:", error);
            throw error;
        }
    } else {
        // Use Application Default Credentials for local development
        app = initializeApp();
        console.log("[Firebase] Initialized with Application Default Credentials");
    }
} else {
    app = getApp();
}

export const db = getFirestore(app);
export const auth = getAuth(app);
