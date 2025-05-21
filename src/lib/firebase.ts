
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Import Firestore

// Your web app's Firebase configuration
// IMPORTANT: For a production application, you should store these values in environment variables.
const firebaseConfig = {
  apiKey: "AIzaSyDrNEnoe6Ql661WwforKkhq6Iai_13NoLI",
  authDomain: "findatruck-58538.firebaseapp.com",
  projectId: "findatruck-58538",
  storageBucket: "findatruck-58538.firebasestorage.app",
  messagingSenderId: "555774884004",
  appId: "1:555774884004:web:638b0d4f140a8e882ace31",
  measurementId: "G-H0C04GHKQK"
};

// Initialize Firebase
let app: FirebaseApp;
let analytics: Analytics | null = null;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore

// Ensure Firebase Analytics is initialized only on the client side
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, auth, db, analytics, firebaseConfig }; // Export db
