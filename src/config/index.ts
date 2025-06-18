import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import {
    connectFirestoreEmulator,
    doc,
    getDoc,
    getFirestore,
    setDoc,
} from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { logger } from '../utils/logger';

interface Config {
  apiUrl: string;
  useEmulator: boolean;
}

const config: Config = {
  // API URL: if explicit env var provided, use it. Otherwise, default to the
  // local emulator only in development; in a production build fall back to the
  // same origin (empty string) so relative fetches hit your deployed backend.
  apiUrl:
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV ? 'http://localhost:8000' : ''),
  // Enable emulators only when explicitly requested via env flag.
  // This avoids unintentional activation in production builds.
  useEmulator: import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true',
};

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-wordwise',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef',
};

logger.debug('Firebase Config', {
  projectId: firebaseConfig.projectId,
  useEmulator: config.useEmulator,
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Functions and get a reference to the service
export const functions = getFunctions(app);

// Connect to emulators if in development mode
if (config.useEmulator) {
  logger.firebase.emulator('Running in Firebase Emulator mode');

  try {
    // Connect to Auth emulator
    connectAuthEmulator(auth, 'http://127.0.0.1:9099');
    logger.firebase.emulator('Connected to Auth emulator on port 9099');

    // Connect to Firestore emulator
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    logger.firebase.emulator('Connected to Firestore emulator on port 8080');

    // Connect to Functions emulator
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
    logger.firebase.emulator('Connected to Functions emulator on port 5001');

    // Test Firestore connection after a short delay
    setTimeout(async () => {
      try {
        logger.firebase.test('Testing Firestore emulator connection...');
        const testDocRef = doc(db, 'test', 'connection-test');
        await setDoc(testDocRef, {
          timestamp: new Date(),
          message: 'Emulator connection test successful',
        });

        const testDoc = await getDoc(testDocRef);
        if (testDoc.exists()) {
          logger.firebase.test(
            'Firestore emulator test successful',
            testDoc.data()
          );
        } else {
          logger.error('Firestore emulator test failed - document not found');
        }
      } catch (error) {
        logger.error('Firestore emulator test failed', error);
      }
    }, 1000);
  } catch (error) {
    logger.error('Error connecting to emulators', error);
  }
} else {
  logger.info('Running in production Firebase mode');
}

export default config;
