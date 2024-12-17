import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { GoogleAuthProvider } from 'firebase/auth';

interface FirebaseExports {
  auth: Auth;
  db: Firestore;
  googleProvider: GoogleAuthProvider;
}

let firebaseExports: FirebaseExports;

if (process.env.REACT_APP_USE_EMULATORS === 'true') {
  firebaseExports = require('./firebase.test');
} else {
  firebaseExports = require('./firebase');
}

const { auth, db, googleProvider } = firebaseExports;
export { auth, db, googleProvider };