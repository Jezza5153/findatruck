
// /lib/firebase.ts

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

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

// Enhanced, more visible logging in the server console
console.log("\n\n");
console.log("================================================================================");
console.log("Firebase Initialization Debug - Check these values in your .env.local file!");
console.log("================================================================================");
console.log(`Attempting to initialize Firebase with config read from environment:`);
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
console.log(`  Value: ${rawMeasurementId || 'NOT_SET or EMPTY (Optional)'}`);
console.log("================================================================================\n");


if (!rawApiKey || rawApiKey === 'YOUR_ACTUAL_FIREBASE_API_KEY_HERE' || rawApiKey === 'YOUR_FIREBASE_API_KEY_HERE') {
  console.error(
`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
CRITICAL Firebase API Key Error:
NEXT_PUBLIC_FIREBASE_API_KEY is missing, undefined, or still a placeholder.
Actual value received by 'firebase.ts': '${rawApiKey}'

Troubleshooting Steps:
1. Ensure '.env.local' file exists in the project ROOT directory (not in 'src/').
2. Ensure '.env.local' contains the line: NEXT_PUBLIC_FIREBASE_API_KEY=your_real_api_key_from_firebase_console
3. Ensure you have RESTARTED your Next.js development server (e.g., 'npm run dev') after creating or modifying '.env.local'.
Firebase will NOT initialize correctly without a valid API key.
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`
  );
}


let app: FirebaseApp;
let analytics: Analytics | null = null;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

if (typeof window !== 'undefined') {
  if (firebaseConfig.measurementId && firebaseConfig.measurementId !== 'YOUR_FIREBASE_MEASUREMENT_ID_HERE' && firebaseConfig.measurementId !== 'YOUR_ACTUAL_FIREBASE_MEASUREMENT_ID_HERE' && firebaseConfig.measurementId.startsWith('G-')) {
    try {
      analytics = getAnalytics(app);
    } catch (e) {
      console.warn("Firebase Analytics initialization failed, even with a measurement ID. Error:", e);
    }
  } else if (firebaseConfig.measurementId && firebaseConfig.measurementId !== 'YOUR_FIREBASE_MEASUREMENT_ID_HERE' && firebaseConfig.measurementId !== 'YOUR_ACTUAL_FIREBASE_MEASUREMENT_ID_HERE' && !firebaseConfig.measurementId.startsWith('G-')) {
    console.warn(`Firebase Measurement ID (NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) has a value ('${firebaseConfig.measurementId}') but seems invalid (must start with 'G-'). Analytics not initialized.`);
  } else if (!firebaseConfig.measurementId || firebaseConfig.measurementId === 'YOUR_FIREBASE_MEASUREMENT_ID_HERE' || firebaseConfig.measurementId === 'YOUR_ACTUAL_FIREBASE_MEASUREMENT_ID_HERE') {
    // This case handles undefined, null, empty string, or placeholder values for measurementId
    // console.log("Firebase Measurement ID not provided or is a placeholder. Analytics not initialized.");
  }
}

export { app, auth, db, storage, analytics, firebaseConfig };
