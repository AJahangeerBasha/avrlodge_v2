import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
  UserCredential,
  sendEmailVerification,
  onAuthStateChanged,
  NextOrObserver,
} from 'firebase/auth';
import { auth } from './firebase';
import { setDocument } from './firestore';

export const createUser = async (email: string, password: string): Promise<UserCredential> => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

export const signInUser = async (email: string, password: string): Promise<UserCredential> => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const signOutUser = async (): Promise<void> => {
  return await signOut(auth);
};

export const resetPassword = async (email: string): Promise<void> => {
  return await sendPasswordResetEmail(auth, email);
};

export const updateUserProfile = async (user: User, profile: { displayName?: string; photoURL?: string }): Promise<void> => {
  return await updateProfile(user, profile);
};

export const sendVerificationEmail = async (user: User): Promise<void> => {
  return await sendEmailVerification(user);
};

export const onAuthStateChange = (callback: NextOrObserver<User>): (() => void) => {
  return onAuthStateChanged(auth, callback);
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Google Authentication
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const signInWithGoogle = async (): Promise<UserCredential> => {
  const result = await signInWithPopup(auth, googleProvider);

  // Create user document in Firestore ONLY if it doesn't exist
  if (result.user) {
    const { getDocument } = await import('./firestore');
    const existingUser = await getDocument('users', result.user.uid);
    if (!existingUser) {
      await createUserDocument(result.user);
    }
  }

  return result;
};

// Create user document with role (safe - preserves existing data)
export const createUserDocument = async (user: User, additionalData: any = {}): Promise<void> => {
  const { uid, displayName, email, photoURL } = user;

  // Import doc, setDoc and getDoc
  const { doc, setDoc, getDoc } = await import('firebase/firestore');
  const { db } = await import('./firebase');

  try {
    const docRef = doc(db, 'users', uid);
    const existingDoc = await getDoc(docRef);

    if (existingDoc.exists()) {
      // User document exists - only update profile fields, preserve role
      const updateData = {
        displayName: displayName || existingDoc.data().displayName || '',
        email: email || existingDoc.data().email || '',
        photoURL: photoURL || existingDoc.data().photoURL || '',
        updatedAt: new Date().toISOString(),
        // Don't include role - preserve existing role
      };
      await setDoc(docRef, updateData, { merge: true });
    } else {
      // New user - create with default role
      const userData = {
        displayName: displayName || '',
        email: email || '',
        photoURL: photoURL || '',
        role: 'guest', // Default role for new users only
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...additionalData,
      };
      await setDoc(docRef, userData);
    }
  } catch (error) {
    console.error('Error creating user document:', error);
  }
};

// These functions are removed as we're using Firestore-based roles instead of Custom Claims