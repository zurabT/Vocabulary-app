// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// Your Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
let app;
let db;
let firebaseInitialized = false;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  firebaseInitialized = true;
  console.log("✅ Firebase initialized successfully");
  console.log("📁 Firestore database ready");
} catch (error) {
  console.error("❌ Firebase initialization error:", error);
  console.log("⚠️ Using offline mode - emergency data only");
}

// Export everything needed
export { db, collection, getDocs, firebaseInitialized };