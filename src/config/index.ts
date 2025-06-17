import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, doc, setDoc, getDoc } from 'firebase/firestore';

interface Config {
  apiUrl: string;
  useEmulator: boolean;
}

const config: Config = {
  // Default to localhost for development, can be overridden with VITE_API_URL environment variable
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  useEmulator: import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true' || import.meta.env.DEV,
};

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-wordwise",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef",
};

console.log('🔧 Firebase Config:', {
  projectId: firebaseConfig.projectId,
  useEmulator: config.useEmulator
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Connect to emulators if in development mode
if (config.useEmulator) {
  console.log('🔧 Running in Firebase Emulator mode');
  
  try {
    // Connect to Auth emulator
    connectAuthEmulator(auth, 'http://127.0.0.1:9099');
    console.log('✅ Connected to Auth emulator on port 9099');
    
    // Connect to Firestore emulator
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    console.log('✅ Connected to Firestore emulator on port 8080');
    
    // Test Firestore connection after a short delay
    setTimeout(async () => {
      try {
        console.log('🧪 Testing Firestore emulator connection...');
        const testDocRef = doc(db, 'test', 'connection-test');
        await setDoc(testDocRef, { 
          timestamp: new Date(),
          message: 'Emulator connection test successful'
        });
        
        const testDoc = await getDoc(testDocRef);
        if (testDoc.exists()) {
          console.log('✅ Firestore emulator test successful:', testDoc.data());
        } else {
          console.error('❌ Firestore emulator test failed - document not found');
        }
      } catch (error) {
        console.error('❌ Firestore emulator test failed:', error);
      }
    }, 1000);
    
  } catch (error) {
    console.error('❌ Error connecting to emulators:', error);
  }
} else {
  console.log('🚀 Running in production Firebase mode');
}

export default config; 