
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyByNONVUc8GTaEO7hGvgHvWgPYEOH2JKLI",
  authDomain: "self-mentor-48cab.firebaseapp.com",
  projectId: "self-mentor-48cab",
  storageBucket: "self-mentor-48cab.firebasestorage.app",
  messagingSenderId: "986723544185",
  appId: "1:986723544185:web:0a175e1aba35697e27b8a8",
  measurementId: "G-STELF493GJ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
