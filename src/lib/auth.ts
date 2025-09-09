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
  
  // Create user document in Firestore if it doesn't exist
  if (result.user) {
    await createUserDocument(result.user);
  }
  
  return result;
};

// Create user document with role
export const createUserDocument = async (user: User, additionalData: any = {}): Promise<void> => {
  const { uid, displayName, email, photoURL } = user;
  
  const userData = {
    displayName: displayName || '',
    email: email || '',
    photoURL: photoURL || '',
    role: 'guest', // Default role
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...additionalData,
  };

  try {
    await setDocument('users', uid, userData);
  } catch (error) {
    console.error('Error creating user document:', error);
  }
};

// These functions are removed as we're using Firestore-based roles instead of Custom Claims