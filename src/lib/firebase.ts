import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";

// Firebase web config is publishable — safe in client code.
const firebaseConfig = {
  apiKey: "AIzaSyA4JHO9O20qmCnD6-XeRvwYZm4G1wnxEns",
  authDomain: "my-plan-capstone-project.firebaseapp.com",
  projectId: "my-plan-capstone-project",
  storageBucket: "my-plan-capstone-project.firebasestorage.app",
  messagingSenderId: "857805171911",
  appId: "1:857805171911:web:598e2c137e563eaf05e2e2",
};

export const app: FirebaseApp = getApps()[0] ?? initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
function makeDb(): Firestore {
  // Offline cache only in the browser; the server keeps the default in-memory client.
  if (typeof window === "undefined") return getFirestore(app);
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    });
  } catch {
    return getFirestore(app); // already initialised (hot reload)
  }
}
export const db: Firestore = makeDb();
export const googleProvider = new GoogleAuthProvider();
