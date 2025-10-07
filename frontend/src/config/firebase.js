// Firebase configuration
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC-pcKBkfMJLN_caBH1I_y75no8sQpPZq4",
  authDomain: "ssiltes-mock.firebaseapp.com",
  projectId: "ssiltes-mock",
  storageBucket: "ssiltes-mock.firebasestorage.app",
  messagingSenderId: "759861182123",
  appId: "1:759861182123:web:10d21fae787a8cb8a141ee",
  measurementId: "G-REH10C72P0",
  databaseURL: "https://ssiltes-mock-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
let analytics = null;

// Initialize analytics only in production
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Analytics initialization failed:', error);
  }
}

export { app, database, analytics };