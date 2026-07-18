// Firebase connection for Last Cast.
// This file just connects to your real Firebase project — it doesn't do
// anything on its own yet. Other files will import `auth` and `db` from
// here to actually read/write real data.

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC_iAf3II8Tk-bcdGf2SB7OdE8VEmy1gc0",
  authDomain: "last-cast-30764.firebaseapp.com",
  projectId: "last-cast-30764",
  storageBucket: "last-cast-30764.firebasestorage.app",
  messagingSenderId: "875315367207",
  appId: "1:875315367207:web:1ee5c904bada853f7ead02",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);
