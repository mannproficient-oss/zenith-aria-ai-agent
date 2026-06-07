 import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDTo9vSDODbscNwf4i49OuLa65wsgpmOSA",
  authDomain: "zenith-aria.firebaseapp.com",
  projectId: "zenith-aria",
  storageBucket: "zenith-aria.firebasestorage.app",
  messagingSenderId: "994425446321",
  appId: "1:994425446321:web:87f8d874be4b11f80f2790",
  measurementId: "G-9HYQHHGMEK"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();