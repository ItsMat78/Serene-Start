// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA2aYPJj1DcEMS2DUZerb_XpSzbd6tSJp4",
  authDomain: "serene-start-e9428.firebaseapp.com",
  projectId: "serene-start-e9428",
  storageBucket: "serene-start-e9428.firebasestorage.app",
  messagingSenderId: "183464615440",
  appId: "1:183464615440:web:a8a87101215197c4843495",
  measurementId: "G-EEDE8BZVXL"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
let analytics;
if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
}

export { app, auth, db, analytics };
