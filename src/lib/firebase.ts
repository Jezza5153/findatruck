
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // Import getAuth

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// IMPORTANT: For a production application, you should store these values in environment variables.
// See: https://firebase.google.com/docs/web/learn-more#config-object
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

const auth = getAuth(app); // Initialize Firebase Auth

// Ensure Firebase Analytics is initialized only on the client side
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, auth, analytics, firebaseConfig }; // Export auth
