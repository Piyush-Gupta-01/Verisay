import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAT98uHagRb9xPk1zBtQYnqSk-_3jsLHvI",
  authDomain: "projectverisay.firebaseapp.com",
  projectId: "projectverisay",
  storageBucket: "projectverisay.appspot.com",
  messagingSenderId: "727190467719",
  appId: "1:727190467719:web:a0454905dd4a5c4e443422",
  measurementId: "G-F09T60WGP6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
