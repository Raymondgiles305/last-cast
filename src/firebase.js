// Firebase connection for Last Cast.
// This file just connects to your real Firebase project — it doesn't do
// anything on its own yet. Other files will import `auth`, `db`, and
// `storage` from here to actually read/write real data and files.

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC_iAf3II8Tk-bcdGf2SB7OdE8VEmy1gc0",
  authDomain: "last-cast-30764.firebaseapp.com",
  projectId: "last-cast-30764",
  storageBucket: "last-cast-30764.firebasestorage.app",
  messagingSenderId: "875315367207",
  appId: "1:875315367207:web:1ee5c904bada853f7ead02",
};

const app = initializeApp(firebaseConfig);

// Real authentication (sign up / log in)
export const auth = getAuth(app);

// Real database (captains, listings, bookings)
export const db = getFirestore(app);

// Real file storage (profile photos, and eventually license/trip photos)
export const storage = getStorage(app);
