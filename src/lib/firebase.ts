import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Validate required environment variables
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN', 
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

for (const envVar of requiredEnvVars) {
  if (!import.meta.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
  }
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Initialize Firestore with better error handling and offline support
let db;
try {
  db = initializeFirestore(app, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED,
    ignoreUndefinedProperties: true,
  });
} catch (error) {
  // Fallback to default initialization if the above fails
  console.warn('Failed to initialize Firestore with custom settings, using defaults:', error);
  db = getFirestore(app);
}

export { db };

export const storage = getStorage(app);

// Enhanced debugging information
if (import.meta.env.DEV) {
  // console.log('🔥 Firebase initialized in development mode');
  // console.log('📊 Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID);
  // console.log('🔐 Auth Domain:', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
  // console.log('🗄️ Storage Bucket:', import.meta.env.VITE_FIREBASE_STORAGE_BUCKET);

  // Connect to Firebase Storage emulator in development
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    try {
      // Only connect to emulator if not already connected
      // const storageEmulatorHost = 'localhost:9199';
      // console.log('🔧 Connecting to Storage emulator at:', storageEmulatorHost);

      // This will only work if the emulator is running
      const { connectStorageEmulator } = await import('firebase/storage');
      connectStorageEmulator(storage, 'localhost', 9199);
      // console.log('✅ Connected to Firebase Storage emulator');
    } catch (error) {
      console.warn('⚠️ Storage emulator not running, using production storage:', error);
    }
  }
}

let analytics: ReturnType<typeof getAnalytics> | null = null;

isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

export { analytics };
export default app;