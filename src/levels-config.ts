// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDP6-eWeGHgpJTb6fYxCN6AIl4NRBgwjwA",
  authDomain: "sanskrit-dialouge-game.firebaseapp.com",
  projectId: "sanskrit-dialouge-game",
  storageBucket: "sanskrit-dialouge-game.firebasestorage.app",
  messagingSenderId: "952211129859",
  appId: "1:952211129859:web:e2f4a30b14f6eecd743036",
  measurementId: "G-38DSTKLN7M"
};

const appName = "levels-data";
const app = getApps().some((registeredApp) => registeredApp.name === appName)
  ? getApp(appName)
  : initializeApp(firebaseConfig, appName);

export const levelsDb = getFirestore(app);