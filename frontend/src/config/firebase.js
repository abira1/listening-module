// Firebase configuration
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAFc-_sb0Se-2-RsXGJXQbOfbafqwA85pA",
  authDomain: "ielts-listening-module.firebaseapp.com",
  projectId: "ielts-listening-module",
  storageBucket: "ielts-listening-module.firebasestorage.app",
  messagingSenderId: "282015901061",
  appId: "1:282015901061:web:a594fa8c1f9dce9e4410ec",
  measurementId: "G-JLYG9VTDFL",
  databaseURL: "https://ielts-listening-module-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const googleProvider = new GoogleAuthProvider();
let analytics = null;

// Initialize analytics only in production
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Analytics initialization failed:', error);
  }
}

export { app, auth, database, googleProvider, analytics };