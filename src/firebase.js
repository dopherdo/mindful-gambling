import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyCAnzmw0KzQ-FqePHxTjoPibiKPd4gRDIE",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "mindful-gambling-c1504.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "mindful-gambling-c1504",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "mindful-gambling-c1504.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "292004695524",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:292004695524:web:73ee8159d3d4d7fcb68bf1",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-YF4HYB1PDN",
};

const app = initializeApp(firebaseConfig);

export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
