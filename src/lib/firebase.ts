// /lib/firebase.ts

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Enhanced warning for missing API key
if (!firebaseConfig.apiKey) {
  console.warn(
`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
Firebase API Key is missing or undefined. 
Ensure NEXT_PUBLIC_FIREBASE_API_KEY is set in your .env.local file.
This file should be in the ROOT of your project.
Example .env.local content:
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
# ... and other Firebase config variables

After adding or modifying .env.local, you MUST restart your Next.js development server.
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`
  );
} else if (process.env.NODE_ENV === 'development' && firebaseConfig.apiKey === 'YOUR_FIREBASE_API_KEY_HERE') {
  console.warn(
`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
Firebase API Key is set to the placeholder 'YOUR_FIREBASE_API_KEY_HERE'.
Please replace it with your actual Firebase API key in .env.local.
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
  if (firebaseConfig.measurementId){
    // Check if measurementId is not the placeholder
    if (firebaseConfig.measurementId !== 'YOUR_FIREBASE_MEASUREMENT_ID_HERE' && firebaseConfig.measurementId.startsWith('G-')) {
      analytics = getAnalytics(app);
    } else if (firebaseConfig.measurementId) {
      console.warn("Firebase Measurement ID might be a placeholder or invalid. Analytics not initialized.");
    }
  }
}

export { app, auth, db, storage, analytics, firebaseConfig };
