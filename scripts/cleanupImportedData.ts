import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  writeBatch
} from 'firebase/firestore';

// Firebase config
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

const USER_ID = 'yYGgGtjR6YQS7LfEfQLR9zvUqDh2';

async function deleteCollection(collectionName: string, batchSize: number = 100) {
  const collectionRef = collection(db, collectionName);
  const q = query(collectionRef, where('createdBy', '==', USER_ID));

  const snapshot = await getDocs(q);
  console.log(`📋 Found ${snapshot.size} documents in ${collectionName} to delete`);

  if (snapshot.size === 0) return 0;

  // Delete in batches
  let deletedCount = 0;
  const batches: any[] = [];
  let currentBatch = writeBatch(db);
  let batchCount = 0;

  snapshot.docs.forEach((document) => {
    currentBatch.delete(document.ref);
    batchCount++;

    if (batchCount === batchSize) {
      batches.push(currentBatch);
      currentBatch = writeBatch(db);
      batchCount = 0;
    }
  });

  // Add remaining batch
  if (batchCount > 0) {
    batches.push(currentBatch);
  }

  // Commit all batches
  for (let i = 0; i < batches.length; i++) {
    await batches[i].commit();
    deletedCount += batchSize;
    console.log(`  ✅ Batch ${i + 1}/${batches.length} deleted`);
  }

  return snapshot.size;
}

async function main() {
  console.log('=== CLEANUP IMPORTED DATA ===\n');
  console.log(`User ID: ${USER_ID}\n`);

  console.log('⚠️  WARNING: This will delete all data created by this user!');
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

  await new Promise(resolve => setTimeout(resolve, 5000));

  // Delete in order (to avoid foreign key issues)
  console.log('🗑️  Deleting collections...\n');

  const paymentsDeleted = await deleteCollection('payments');
  const reservationRoomsDeleted = await deleteCollection('reservationRooms');
  const reservationsDeleted = await deleteCollection('reservations');
  const guestsDeleted = await deleteCollection('guests');

  console.log('\n=== CLEANUP SUMMARY ===');
  console.log(`💰 Payments deleted: ${paymentsDeleted}`);
  console.log(`🛏️  ReservationRooms deleted: ${reservationRoomsDeleted}`);
  console.log(`📋 Reservations deleted: ${reservationsDeleted}`);
  console.log(`👤 Guests deleted: ${guestsDeleted}`);

  console.log('\n✅ Cleanup complete!');
  process.exit(0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
