import { initializeApp, getApps, getApp } from "firebase/app";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
} from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAUAbsYrgGpVfsw6SM8mf_U8mJDIqSkY38",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "ice-academic-portal.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "ice-academic-portal",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "ice-academic-portal.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "96615133476",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:96615133476:web:2ff6a508ab08df699243b1",
};

// Initialize Firebase (singleton pattern for Next.js SSR / Fast Refresh)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Helper: Sign in with Google Popup
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        const idToken = await user.getIdToken();
        return { success: true, user, idToken };
    } catch (error) {
        console.error("Firebase Google Auth Error:", error);
        return { success: false, message: error.message };
    }
};

// Helper: Sign in with Email/Password
export const signInWithFirebaseEmail = async (email, password) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const user = result.user;
        const idToken = await user.getIdToken();
        return { success: true, user, idToken };
    } catch (error) {
        console.error("Firebase Email Auth Error:", error);
        return { success: false, message: error.message };
    }
};

// Helper: Register with Email/Password
export const registerWithFirebaseEmail = async (email, password) => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;
        const idToken = await user.getIdToken();
        return { success: true, user, idToken };
    } catch (error) {
        console.error("Firebase Register Error:", error);
        return { success: false, message: error.message };
    }
};

// Helper: Sign out
export const logOutFirebase = async () => {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

export { app, auth, googleProvider, onAuthStateChanged };
export default app;
