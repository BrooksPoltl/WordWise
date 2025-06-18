import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Polyfill for TextEncoder/TextDecoder
if (typeof global.TextEncoder === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  const util = require('util');
  global.TextEncoder = util.TextEncoder;
  global.TextDecoder = util.TextDecoder;
}

// Mock the config module
jest.mock('./config', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: jest.fn(),
  },
  db: {
    collection: jest.fn(),
    doc: jest.fn(),
  },
  default: {
    apiUrl: 'http://localhost:8000',
    useEmulator: true,
  },
}));

// Mock the logger module
jest.mock('./utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
    firebase: {
      auth: jest.fn(),
      firestore: jest.fn(),
      emulator: jest.fn(),
      test: jest.fn(),
    },
    group: {
      start: jest.fn(),
      end: jest.fn(),
      log: jest.fn(),
    },
  },
  default: {
    debug: jest.fn(),
    info: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock Firebase to avoid initialization errors in tests
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  connectAuthEmulator: jest.fn(),
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  connectFirestoreEmulator: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: jest.fn(),
}));

// Mock window.matchMedia for components that use responsive design
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
}); 