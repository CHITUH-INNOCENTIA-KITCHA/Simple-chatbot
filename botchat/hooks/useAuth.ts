import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, getUserDocument } from '../services/firebase';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { user, isLoading, setUser, setLoading, clearUser } = useAuthStore();

  useEffect(() => {
    setLoading(true);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch user document from Firestore
          const userDoc = await getUserDocument(firebaseUser.uid);

          if (userDoc) {
            setUser(userDoc);
          } else {
            // If document doesn't exist, create a minimal user object
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'User',
              avatarUrl: firebaseUser.photoURL || null,
              createdAt: new Date(),
            });
          }
        } catch (error) {
          console.error('Error fetching user document:', error);
          clearUser();
        }
      } else {
        clearUser();
      }
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  return { user, isLoading };
};
