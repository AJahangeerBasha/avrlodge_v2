import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Firebase config (from your environment variables)
const firebaseConfig = {
  apiKey: "AIzaSyDZxKLNEHICeyOoIwiJdAVf6ULMbW-Kq_c",
  authDomain: "avrlodgev2.firebaseapp.com",
  projectId: "avrlodgev2",
  storageBucket: "avrlodgev2.firebasestorage.app",
  messagingSenderId: "423109120986",
  appId: "1:423109120986:web:69500d1e043f9cc170e6e3",
  measurementId: "G-HSKHTM1097"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Your user ID
const userId = "yYGgGtjR6YQS7LfEfQLR9zvUqDh2";

// Room data to insert
const roomsToAdd = [
  {
    roomNumber: "109",
    roomTypeId: "60230608-4023-4aa4-80df-0b486eacbfe7",
    status: "available",
    isActive: true,
    floorNumber: 1, // Assuming floor 1, you can adjust if needed
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: userId,
    updatedBy: userId
  },
  {
    roomNumber: "110", 
    roomTypeId: "b48297cf-35d9-4a7c-97dc-1138ae5ebbe7",
    status: "available",
    isActive: true,
    floorNumber: 1, // Assuming floor 1, you can adjust if needed
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: userId,
    updatedBy: userId
  }
];

async function addRoomsToFirestore() {
  try {
    console.log('Starting to add rooms to Firestore...');
    
    const roomsCollection = collection(db, 'rooms');
    
    for (const roomData of roomsToAdd) {
      console.log(`Adding room ${roomData.roomNumber}...`);
      
      const docRef = await addDoc(roomsCollection, roomData);
      
      console.log(`✅ Room ${roomData.roomNumber} added successfully with ID: ${docRef.id}`);
      console.log(`   - Room Type ID: ${roomData.roomTypeId}`);
      console.log(`   - Status: ${roomData.status}`);
      console.log(`   - Floor: ${roomData.floorNumber}`);
      console.log('');
    }
    
    console.log('🎉 All rooms have been added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding rooms:', error);
  }
}

// Run the script
addRoomsToFirestore().then(() => {
  console.log('Script completed.');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});