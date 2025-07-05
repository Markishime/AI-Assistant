import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore  } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB8ji2rBzaRS0-2oOgpwOvAlTjUaYbE1IU",
  authDomain: "agriai-bfb9e.firebaseapp.com",
  projectId: "agriai-bfb9e",
  storageBucket: "agriai-bfb9e.firebasestorage.app",
  messagingSenderId: "801770241446",
  appId: "1:801770241446:web:0c3db60e8c5fd005fb6367",
  measurementId: "G-KQFT22KD7R"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

