import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, Timestamp, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:000000000000:web:0000000000000000000000',
};

// Check if Firebase is properly configured
const isFirebaseConfigured = (): boolean => {
  return !!(
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY &&
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID
  );
};

// Initialize Firebase only once
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn('Firebase initialization error:', error);
  // Create placeholder - app will show appropriate error UI
  app = null as unknown as FirebaseApp;
  auth = null as unknown as Auth;
  db = null as unknown as Firestore;
}

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

export { app, auth, db, isFirebaseConfigured };
