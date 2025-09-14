/**
 * Firebase configuration for Node.js scripts
 * Uses dotenv to load environment variables from .env file
 */

import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import * as dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

// Firebase configuration using process.env instead of import.meta.env
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
}

// Validate required environment variables
const requiredVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN', 
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
]

const missingVars = requiredVars.filter(varName => !process.env[varName])

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:')
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`)
  })
  console.error('Please check your .env file in the project root.')
  process.exit(1)
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firestore
export const db = getFirestore(app)

// Log successful initialization
console.log('🔥 Firebase initialized for script execution')
console.log(`📊 Project ID: ${firebaseConfig.projectId}`)