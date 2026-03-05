import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCAnzmw0KzQ-FqePHxTjoPibiKPd4gRDIE",
  authDomain: "mindful-gambling-c1504.firebaseapp.com",
  projectId: "mindful-gambling-c1504",
  storageBucket: "mindful-gambling-c1504.firebasestorage.app",
  messagingSenderId: "292004695524",
  appId: "1:292004695524:web:73ee8159d3d4d7fcb68bf1",
  measurementId: "G-YF4HYB1PDN",
};

const app = initializeApp(firebaseConfig);

export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
