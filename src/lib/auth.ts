import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
  UserCredential,
  sendEmailVerification,
  onAuthStateChanged,
  NextOrObserver,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  linkWithCredential,
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

// Facebook Authentication
const facebookProvider = new FacebookAuthProvider();
facebookProvider.setCustomParameters({
  display: 'popup'
});

export const signInWithFacebook = async (): Promise<UserCredential> => {
  const result = await signInWithPopup(auth, facebookProvider);

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

// Phone Authentication
let recaptchaVerifier: RecaptchaVerifier | null = null;

export const initializeRecaptcha = (elementId: string): RecaptchaVerifier => {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
  }

  recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved, allow signInWithPhoneNumber
      console.log('reCAPTCHA verified');
    },
    'expired-callback': () => {
      // Response expired. Ask user to solve reCAPTCHA again.
      console.log('reCAPTCHA expired');
    }
  });

  return recaptchaVerifier;
};

export const sendSMSVerificationCode = async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => {
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    return confirmationResult;
  } catch (error: any) {
    console.error('Error sending SMS:', error);

    // Provide user-friendly error messages
    let errorMessage = 'Failed to send verification code';

    if (error.code === 'auth/operation-not-allowed') {
      errorMessage = 'Phone authentication is not enabled. Please contact support.';
    } else if (error.code === 'auth/invalid-phone-number') {
      errorMessage = 'Invalid phone number format. Please include country code (e.g., +91 for India).';
    } else if (error.code === 'auth/quota-exceeded') {
      errorMessage = 'SMS quota exceeded. Please try again later.';
    } else if (error.code === 'auth/captcha-check-failed') {
      errorMessage = 'Security verification failed. Please try again.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many attempts. Please wait before trying again.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

export const verifyPhoneNumber = async (confirmationResult: any, verificationCode: string): Promise<UserCredential> => {
  try {
    const result = await confirmationResult.confirm(verificationCode);

    // Create user document in Firestore if it doesn't exist
    if (result.user) {
      const { getDocument } = await import('./firestore');
      const existingUser = await getDocument('users', result.user.uid);
      if (!existingUser) {
        await createUserDocument(result.user);
      }
    }

    return result;
  } catch (error: any) {
    console.error('Error verifying code:', error);

    // Provide user-friendly error messages
    let errorMessage = 'Invalid verification code';

    if (error.code === 'auth/invalid-verification-code') {
      errorMessage = 'Invalid verification code. Please check and try again.';
    } else if (error.code === 'auth/code-expired') {
      errorMessage = 'Verification code has expired. Please request a new code.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed attempts. Please try again later.';
    } else if (error.code === 'auth/session-expired') {
      errorMessage = 'Session expired. Please request a new verification code.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

export const linkPhoneNumber = async (phoneNumber: string, verificationCode: string): Promise<UserCredential> => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('No user currently logged in');
    }

    const credential = PhoneAuthProvider.credential(phoneNumber, verificationCode);
    const result = await linkWithCredential(currentUser, credential);

    return result;
  } catch (error: any) {
    console.error('Error linking phone number:', error);
    throw new Error(error.message || 'Failed to link phone number');
  }
};

export const clearRecaptcha = (): void => {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
};

// Phone number formatting utility
export const formatPhoneNumber = (phoneNumber: string, countryCode: string = '+91'): string => {
  // Remove all non-digit characters
  const cleanNumber = phoneNumber.replace(/\D/g, '');

  // Add country code if not present
  if (!phoneNumber.startsWith('+')) {
    return `${countryCode}${cleanNumber}`;
  }

  return `+${cleanNumber}`;
};