import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: 'AIzaSyCsBZPgmY6bNruJ_xGPDXJMTg30BL96AI8',
  authDomain: 'trusty-27033.firebaseapp.com',
  projectId: 'trusty-27033',
  storageBucket: 'trusty-27033.firebasestorage.app',
  messagingSenderId: '739109420279',
  appId: '1:739109420279:web:41ed2f66b509adf63e67f2',
  measurementId: 'G-91CRH4DKG0'
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
