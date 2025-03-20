import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";  // Import Firebase Storage

const firebaseConfig = {
  apiKey: "AIzaSyAOCqTujUiBZwajIJR1pRtTQU9clEUBsmc",
  authDomain: "addnewssrh.firebaseapp.com",
  projectId: "addnewssrh",
  storageBucket: "addnewssrh.appspot.com",  // ✅ Make sure this is correct
  messagingSenderId: "321868693262",
  appId: "1:321868693262:web:09df52f3f299a03784e15f",
  measurementId: "G-P1DJYLYNFL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);  // ✅ Initialize Firebase Storage
