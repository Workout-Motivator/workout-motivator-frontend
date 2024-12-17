import { initializeApp, FirebaseOptions, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  connectAuthEmulator,
  Auth 
} from "firebase/auth";
import { 
  getFirestore, 
  connectFirestoreEmulator,
  Firestore 
} from "firebase/firestore";

const firebaseTestConfig: FirebaseOptions = {
  apiKey: "fake-api-key",
  authDomain: "localhost", 
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: "fake-storage-bucket",
  messagingSenderId: "fake-messaging-sender-id",
  appId: "fake-app-id"
};

// Initialize Firebase only if it hasn't been initialized yet
const app = getApps().length === 0 ? initializeApp(firebaseTestConfig) : getApp();

export const auth: Auth = getAuth(app);
connectAuthEmulator(auth, "http://localhost:9099");

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const db: Firestore = getFirestore(app);
connectFirestoreEmulator(db, "localhost", 8080);