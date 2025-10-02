// Users Firestore Operations
// Handles CRUD operations for user management

import {
  collection,
  doc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from './firebase'
import { User } from './types/auth'

const COLLECTION_NAME = 'users'

// Helper function to convert Firestore timestamp to ISO string
const timestampToString = (timestamp: any): string => {
  if (timestamp?.toDate) {
    return timestamp.toDate().toISOString()
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString()
  }
  return timestamp || new Date().toISOString()
}

// Convert Firestore document to User type
const convertUserData = (doc: any): User => {
  const data = doc.data()
  return {
    uid: doc.id,
    displayName: data.displayName || '',
    email: data.email || '',
    photoURL: data.photoURL || '',
    role: data.role || 'guest',
    emailVerified: data.emailVerified || false,
    createdAt: timestampToString(data.createdAt),
    updatedAt: timestampToString(data.updatedAt)
  }
}

// Get all users
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc')
    )

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => convertUserData(doc))
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

// Get users by role
export const getUsersByRole = async (role: 'guest' | 'manager' | 'admin' | 'agent'): Promise<User[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('role', '==', role),
      orderBy('createdAt', 'desc')
    )

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => convertUserData(doc))
  } catch (error) {
    console.error('Error fetching users by role:', error)
    throw error
  }
}

// Update user role
export const updateUserRole = async (
  userId: string,
  newRole: 'guest' | 'manager' | 'admin' | 'agent',
  updatedBy: string
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, userId)
    await updateDoc(docRef, {
      role: newRole,
      updatedAt: serverTimestamp(),
      updatedBy: updatedBy
    })
  } catch (error) {
    console.error('Error updating user role:', error)
    throw error
  }
}

// Update user profile
export const updateUserProfile = async (
  userId: string,
  data: {
    displayName?: string
    email?: string
    photoURL?: string
    emailVerified?: boolean
  },
  updatedBy: string
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, userId)
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
      updatedBy: updatedBy
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}

// Delete user (admin only)
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, userId)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}

// Get user statistics
export const getUserStats = async () => {
  try {
    const users = await getAllUsers()

    return {
      totalUsers: users.length,
      guestUsers: users.filter(user => user.role === 'guest').length,
      managerUsers: users.filter(user => user.role === 'manager').length,
      adminUsers: users.filter(user => user.role === 'admin').length,
      agentUsers: users.filter(user => user.role === 'agent').length,
      verifiedUsers: users.filter(user => user.emailVerified).length,
      unverifiedUsers: users.filter(user => !user.emailVerified).length
    }
  } catch (error) {
    console.error('Error getting user stats:', error)
    throw error
  }
}