// /lib/firebase.ts

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // <-- ADD THIS

const firebaseConfig = {
  apiKey: "AIzaSyDrNEnoe6Ql661WwforKkhq6Iai_13NoLI",
  authDomain: "findatruck-58538.firebaseapp.com",
  projectId: "findatruck-58538",
  storageBucket: "findatruck-58538.firebasestorage.app", // <--- Your custom bucket
  messagingSenderId: "555774884004",
  appId: "1:555774884004:web:638b0d4f140a8e882ace31",
  measurementId: "G-H0C04GHKQK"
};

let app: FirebaseApp;
let analytics: Analytics | null = null;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // <-- ADD THIS

if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, auth, db, storage, analytics, firebaseConfig }; // <-- EXPORT STORAGE
