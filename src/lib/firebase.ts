
// /lib/firebase.ts

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";
import { getAuth, type Auth } from "firebase/auth"; // Import Auth type
import { getFirestore, type Firestore } from "firebase/firestore"; // Import Firestore type
import { getStorage, type Storage } from "firebase/storage"; // Import Storage type

// Explicitly read environment variables
const rawApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const rawAuthDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const rawProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const rawStorageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const rawMessagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const rawAppId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
const rawMeasurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

const firebaseConfig = {
  apiKey: rawApiKey,
  authDomain: rawAuthDomain,
  projectId: rawProjectId,
  storageBucket: rawStorageBucket,
  messagingSenderId: rawMessagingSenderId,
  appId: rawAppId,
  measurementId: rawMeasurementId,
};

// Enhanced, more visible logging
console.log("\n\n");
console.log("================================================================================");
console.log("Firebase Initialization Debug - Check these values in your .env.local file!");
console.log("Attempting to initialize Firebase with config read from environment:");
console.log("--------------------------------------------------------------------------------");
console.log(`- NEXT_PUBLIC_FIREBASE_API_KEY_isSet: ${!!rawApiKey}`);
console.log(`  Value (first 5 | last 5 chars): ${rawApiKey ? `${rawApiKey.substring(0, 5)}... | ...${rawApiKey.substring(rawApiKey.length - 5)}` : 'NOT_SET or EMPTY'}`);
console.log(`- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_isSet: ${!!rawAuthDomain}`);
console.log(`  Value: ${rawAuthDomain || 'NOT_SET or EMPTY'}`);
console.log(`- NEXT_PUBLIC_FIREBASE_PROJECT_ID_isSet: ${!!rawProjectId}`);
console.log(`  Value: ${rawProjectId || 'NOT_SET or EMPTY'}`);
console.log(`- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_isSet: ${!!rawStorageBucket}`);
console.log(`  Value: ${rawStorageBucket || 'NOT_SET or EMPTY'}`);
console.log(`- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_isSet: ${!!rawMessagingSenderId}`);
console.log(`  Value: ${rawMessagingSenderId || 'NOT_SET or EMPTY'}`);
console.log(`- NEXT_PUBLIC_FIREBASE_APP_ID_isSet: ${!!rawAppId}`);
console.log(`  Value: ${rawAppId || 'NOT_SET or EMPTY'}`);
console.log(`- NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID_isSet: ${!!rawMeasurementId}`);
console.log(`  Value: ${rawMeasurementId || 'NOT_SET or EMPTY (Optional for Analytics)'}`);
console.log("================================================================================\n");


let app: FirebaseApp | null = null; // Initialize as null
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: Storage | null = null;
let analytics: Analytics | null = null;

const requiredConfigDetails = [
    { name: "NEXT_PUBLIC_FIREBASE_API_KEY", value: rawApiKey },
    { name: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", value: rawAuthDomain },
    { name: "NEXT_PUBLIC_FIREBASE_PROJECT_ID", value: rawProjectId },
    { name: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", value: rawStorageBucket },
    { name: "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID", value: rawMessagingSenderId },
    { name: "NEXT_PUBLIC_FIREBASE_APP_ID", value: rawAppId }
];

const missingOrPlaceholderConfigs = requiredConfigDetails.filter(
    config => !config.value || config.value.includes("YOUR_") || config.value.length <= 5
);

if (missingOrPlaceholderConfigs.length > 0) {
    console.error(
`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
CRITICAL Firebase Configuration Error:
The following required Firebase environment variable(s) are missing,
still a placeholder, or too short in your .env.local file:
${missingOrPlaceholderConfigs.map(c => `  - ${c.name} (Value: ${c.value || 'NOT_SET'})`).join('\n')}

Please verify these in '.env.local' located in the project ROOT directory.
Ensure you have RESTARTED your Next.js development server after any changes.
Firebase will NOT initialize correctly without these valid configurations.
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`
    );
} else {
    if (getApps().length === 0) {
        try {
            console.log("Attempting initializeApp with:", firebaseConfig);
            app = initializeApp(firebaseConfig);
            console.log("Firebase app initialized successfully via initializeApp().");
        } catch (e: any) {
            console.error("CRITICAL: Firebase initializeApp FAILED. Error:", e.message, e.stack);
            console.error("This usually means a value in your Firebase config (e.g., projectId, authDomain) is malformed or invalid, OR the Firebase services (Auth, Firestore) are not enabled or correctly set up in your Firebase project console for this project ID.");
            app = null; // Ensure app is null if initializeApp fails
        }
    } else {
        app = getApps()[0];
        console.log("Firebase app already initialized (getApps().length > 0).");
    }

    if (app) {
        console.log("Firebase app object seems valid, attempting to initialize services...");
        try {
            auth = getAuth(app);
            console.log("Firebase Auth initialized.");
        } catch (e: any) {
            console.error("Failed to initialize Firebase Auth. Error:", e.message);
        }
        try {
            db = getFirestore(app);
            console.log("Firebase Firestore initialized.");
        } catch (e: any) {
            console.error("Failed to initialize Firebase Firestore. Error:", e.message);
        }
        try {
            storage = getStorage(app);
            console.log("Firebase Storage initialized.");
        } catch (e: any) {
            console.error("Failed to initialize Firebase Storage. Error:", e.message);
        }

        if (typeof window !== 'undefined' && firebaseConfig.measurementId && firebaseConfig.measurementId.startsWith('G-')) {
            try {
                analytics = getAnalytics(app);
                console.log("Firebase Analytics initialized.");
            } catch (e: any) {
                console.warn("Firebase Analytics initialization failed. Error:", e.message);
            }
        } else if (typeof window !== 'undefined' && firebaseConfig.measurementId && !firebaseConfig.measurementId.startsWith('G-')) {
            console.warn(`Firebase Measurement ID (NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) has a value ('${firebaseConfig.measurementId}') but seems invalid (must start with 'G-'). Analytics not initialized.`);
        }
    } else {
        console.error("Firebase app object is null after initialization attempt. Services (Auth, Firestore, Storage) will not be initialized.");
    }
}

export { app, auth, db, storage, analytics, firebaseConfig };

