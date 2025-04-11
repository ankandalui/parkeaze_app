// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAxQCp83uUp9HGl0XezV4KSynuzaDP-x8g",
  authDomain: "parking-ba468.firebaseapp.com",
  projectId: "parking-ba468",
  storageBucket: "parking-ba468.firebasestorage.app",
  messagingSenderId: "969164155593",
  appId: "1:969164155593:web:f0a9783ed55db86288bb18",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// auth
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

//db
export const firestore = getFirestore(app);
