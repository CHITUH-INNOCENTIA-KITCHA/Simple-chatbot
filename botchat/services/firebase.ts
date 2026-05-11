import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Helper function to create user document
export const createUserDocument = async (
  uid: string,
  data: {
    email: string;
    displayName: string;
    avatarUrl?: string | null;
  }
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      uid,
      email: data.email,
      displayName: data.displayName,
      avatarUrl: data.avatarUrl || null,
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error creating user document:', error);
    throw error;
  }
};

// Helper function to get user document
export const getUserDocument = async (uid: string): Promise<any> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting user document:', error);
    throw error;
  }
};

// Helper function to update user document
export const updateUserDocument = async (
  uid: string,
  data: Partial<{
    displayName: string;
    avatarUrl: string | null;
  }>
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, data);
  } catch (error) {
    console.error('Error updating user document:', error);
    throw error;
  }
};

export { app, auth, db };
