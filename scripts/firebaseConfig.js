"use strict";
/**
 * Firebase configuration for Node.js scripts
 * Uses dotenv to load environment variables from .env file
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
var app_1 = require("firebase/app");
var firestore_1 = require("firebase/firestore");
var dotenv = require("dotenv");
// Load environment variables from .env file
dotenv.config();
// Firebase configuration using process.env instead of import.meta.env
var firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
    measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};
// Validate required environment variables
var requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
];
var missingVars = requiredVars.filter(function (varName) { return !process.env[varName]; });
if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(function (varName) {
        console.error("   - ".concat(varName));
    });
    console.error('Please check your .env file in the project root.');
    process.exit(1);
}
// Initialize Firebase
var app = (0, app_1.initializeApp)(firebaseConfig);
// Initialize Firestore
exports.db = (0, firestore_1.getFirestore)(app);
// Log successful initialization
console.log('🔥 Firebase initialized for script execution');
console.log("\uD83D\uDCCA Project ID: ".concat(firebaseConfig.projectId));
