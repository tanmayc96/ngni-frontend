import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAbDoQIRHmsghpPM8-iSBB2G9IN3apomUU",
  authDomain: "switon-sandbox-00-322112.firebaseapp.com",
  projectId: "switon-sandbox-00-322112",
  storageBucket: "switon-sandbox-00-322112.firebasestorage.app",
  messagingSenderId: "882302757206",
  appId: "1:882302757206:web:05053e4aca92c1ba414ef7",
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
}

const db = getFirestore(app, process.env.NEXT_PUBLIC_FIRESTORE_ID);

export { db };
