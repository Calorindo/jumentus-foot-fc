import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC8zBXBmNUvGglcg6YLxodKrsA1LTXO970",
  authDomain: "jumentusdb.firebaseapp.com",
  databaseURL: "https://jumentusdb-default-rtdb.firebaseio.com",
  projectId: "jumentusdb",
  storageBucket: "jumentusdb.firebasestorage.app",
  messagingSenderId: "430579427740",
  appId: "1:430579427740:web:7d30bf9454986763420059",
  measurementId: "G-38CJ4YQ1WK"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);
