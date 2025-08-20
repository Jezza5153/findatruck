import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAnalytics, type Analytics } from 'firebase/analytics';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const rawApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const rawAuthDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const rawProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const rawStorageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const rawMessagingSenderId =
  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const rawAppId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
const rawMeasurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID; // Optional

console.log(
  '================================================================================'
);
console.log(
  'Firebase Initialization Debug - Check these values in your .env.local file!'
);
console.log('Reading environment variables for Firebase config:');
console.log(
  '--------------------------------------------------------------------------------'
);
console.log(
  `- NEXT_PUBLIC_FIREBASE_API_KEY: ${rawApiKey ? `SET (ends with ...${rawApiKey.slice(-5)})` : 'NOT SET or EMPTY'}`
);
console.log(
  `- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${rawAuthDomain || 'NOT SET or EMPTY'}`
);
console.log(
  `- NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${rawProjectId || 'NOT SET or EMPTY'}`
);
console.log(
  `- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${rawStorageBucket || 'NOT SET or EMPTY'}`
);
console.log(
  `- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${rawMessagingSenderId || 'NOT SET or EMPTY'}`
);
console.log(`- NEXT_PUBLIC_FIREBASE_APP_ID: ${rawAppId || 'NOT SET or EMPTY'}`);
console.log(
  `- NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: ${rawMeasurementId || 'NOT SET or EMPTY (Optional)'}`
);
console.log(
  '================================================================================'
);

const firebaseConfig = {
  apiKey: rawApiKey,
  authDomain: rawAuthDomain,
  projectId: rawProjectId,
  storageBucket: rawStorageBucket,
  messagingSenderId: rawMessagingSenderId,
  appId: rawAppId,
  measurementId: rawMeasurementId, // Will be undefined if not set, which is fine
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let analytics: Analytics | null = null; // Analytics is optional and client-side only

const requiredConfigs = [
  { name: 'NEXT_PUBLIC_FIREBASE_API_KEY', value: firebaseConfig.apiKey },
  {
    name: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    value: firebaseConfig.authDomain,
  },
  { name: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', value: firebaseConfig.projectId },
  {
    name: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    value: firebaseConfig.storageBucket,
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    value: firebaseConfig.messagingSenderId,
  },
  { name: 'NEXT_PUBLIC_FIREBASE_APP_ID', value: firebaseConfig.appId },
];

const missingOrPlaceholderConfigs = requiredConfigs.filter(
  (config) =>
    !config.value || config.value.includes('YOUR_') || config.value.length < 5
);

if (missingOrPlaceholderConfigs.length > 0) {
  console.error(
    `!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
CRITICAL Firebase Configuration Error:
The following required Firebase environment variable(s) are missing,
still contain placeholders (like "YOUR_..._HERE"), or are too short
in your .env.local file:
${missingOrPlaceholderConfigs.map((c) => `  - ${c.name} (Current value: '${c.value || 'NOT SET or EMPTY'}')`).join('\n')}

Please verify these in '.env.local' located in the project ROOT directory.
You MUST RESTART your Next.js development server after any changes to .env.local.
Firebase will NOT initialize correctly without these valid configurations.
This will likely lead to "auth/invalid-api-key" or similar errors.
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`
  );
  // To prevent the app from crashing entirely but still indicate a major issue,
  // we can throw an error here or try to proceed with potentially undefined services.
  // For now, we'll let it try to initialize, and errors will occur when services are used.
}

if (getApps().length === 0) {
  try {
    app = initializeApp(firebaseConfig);
    console.log(
      'Firebase app initialized successfully via initializeApp(). Project ID:',
      firebaseConfig.projectId
    );
  } catch (e: any) {
    console.error('CRITICAL: Firebase initializeApp FAILED. Error:', e.message);
    console.error(
      'This usually means a value in your Firebase config (e.g., projectId, authDomain) is malformed, your API key is invalid for this project, or the Firebase services (Auth, Firestore) are not enabled or correctly set up in your Firebase project console for this project ID.'
    );
    // @ts-ignore - app might not be initialized, leading to errors later
    app = null;
  }
} else {
  app = getApps()[0];
  console.log(
    'Firebase app already initialized (getApps().length > 0). Using existing app for Project ID:',
    app.options.projectId
  );
}

// Initialize other Firebase services only if 'app' was successfully initialized.
// Check if app has options, a simple check for successful basic initialization.
if (app && app.options && app.options.apiKey) {
  try {
    auth = getAuth(app);
    console.log('Firebase Auth initialized.');
  } catch (e: any) {
    console.error('Failed to initialize Firebase Auth:', e.message);
    // @ts-ignore
    auth = null;
  }

  try {
    db = getFirestore(app);
    console.log('Firebase Firestore initialized.');
  } catch (e: any) {
    console.error('Failed to initialize Firebase Firestore:', e.message);
    // @ts-ignore
    db = null;
  }

  try {
    storage = getStorage(app);
    console.log('Firebase Storage initialized.');
  } catch (e: any) {
    console.error('Failed to initialize Firebase Storage:', e.message);
    // @ts-ignore
    storage = null;
  }

  if (
    typeof window !== 'undefined' &&
    firebaseConfig.measurementId &&
    firebaseConfig.measurementId.startsWith('G-')
  ) {
    try {
      analytics = getAnalytics(app);
      console.log('Firebase Analytics initialized.');
    } catch (e: any) {
      console.warn('Firebase Analytics initialization failed:', e.message);
      analytics = null;
    }
  } else if (
    typeof window !== 'undefined' &&
    firebaseConfig.measurementId &&
    !firebaseConfig.measurementId.startsWith('G-')
  ) {
    console.warn(
      `Firebase Measurement ID ('${firebaseConfig.measurementId}') seems invalid (must start with 'G-'). Analytics not initialized.`
    );
  }
} else {
  console.error(
    'Firebase app object is null or invalid after initialization attempt. Services (Auth, Firestore, Storage) will NOT be initialized correctly.'
  );
  // @ts-ignore - Assign null to services if app init failed to prevent undefined errors
  auth = null;
  db = null;
  storage = null;
}

export { app, auth, db, storage, analytics, firebaseConfig };
