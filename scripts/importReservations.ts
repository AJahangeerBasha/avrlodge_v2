import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  Timestamp,
  query,
  where,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

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

// Admin user ID
const ADMIN_USER_ID = 'yYGgGtjR6YQS7LfEfQLR9zvUqDh2';

interface Payment {
  amount: number;
  method: 'cash' | 'bashaQR' | 'jubairQR';
}

interface MergedReservation {
  checkInDate: string;
  checkOutDate: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  rooms: string[];
  payments: Payment[];
  status: string;
  notes: string;
  rawRecords: string[];
}

// Generate reference number in format MMYYYY-XXX
async function generateReferenceNumber(checkInDate: string): Promise<string> {
  const date = new Date(checkInDate);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const monthYear = `${month}${year}`;

  // Query existing reservations for this month
  const reservationsRef = collection(db, 'reservations');
  const q = query(
    reservationsRef,
    where('referenceNumber', '>=', `${monthYear}-000`),
    where('referenceNumber', '<=', `${monthYear}-999`),
    orderBy('referenceNumber', 'desc'),
    limit(1)
  );

  const snapshot = await getDocs(q);

  let nextNumber = 1;
  if (!snapshot.empty) {
    const lastRef = snapshot.docs[0].data().referenceNumber;
    const lastNumber = parseInt(lastRef.split('-')[1]);
    nextNumber = lastNumber + 1;
  }

  const referenceNumber = `${monthYear}-${nextNumber.toString().padStart(3, '0')}`;
  return referenceNumber;
}

// Generate receipt number in format PAY-MMYYYY-XXXXX
async function generateReceiptNumber(date: string): Promise<string> {
  const dateObj = new Date(date);
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  const monthYear = `${month}${year}`;

  // Query existing payments for this month
  const paymentsRef = collection(db, 'payments');
  const q = query(
    paymentsRef,
    where('receiptNumber', '>=', `PAY-${monthYear}-00000`),
    where('receiptNumber', '<=', `PAY-${monthYear}-99999`),
    orderBy('receiptNumber', 'desc'),
    limit(1)
  );

  const snapshot = await getDocs(q);

  let nextNumber = 1;
  if (!snapshot.empty) {
    const lastReceipt = snapshot.docs[0].data().receiptNumber;
    const lastNumber = parseInt(lastReceipt.split('-')[2]);
    nextNumber = lastNumber + 1;
  }

  const receiptNumber = `PAY-${monthYear}-${nextNumber.toString().padStart(5, '0')}`;
  return receiptNumber;
}

// Convert date string to Firestore Timestamp
function toTimestamp(dateStr: string): Timestamp {
  const date = new Date(dateStr);
  return Timestamp.fromDate(date);
}

// Map payment method to match Firebase schema
function mapPaymentMethod(method: string): string {
  const methodMap: { [key: string]: string } = {
    'cash': 'Cash',
    'bashaQR': 'Basha QR',
    'jubairQR': 'Jubair QR'
  };
  return methodMap[method] || 'Cash';
}

// Insert a single reservation into Firebase
async function insertReservation(reservation: MergedReservation, index: number): Promise<string | null> {
  try {
    console.log(`\n[${index}] Processing: ${reservation.guestName} - Rooms: [${reservation.rooms.join(', ')}]`);

    // Skip if invalid
    if (!reservation.guestName || reservation.guestName === 'Unknown' || !reservation.guestPhone) {
      console.log(`  ⚠️  Skipping - Missing guest name or phone`);
      return null;
    }

    // Generate reference number
    const referenceNumber = await generateReferenceNumber(reservation.checkInDate);
    console.log(`  Reference: ${referenceNumber}`);

    // Calculate total amount
    const totalAmount = reservation.payments.reduce((sum, p) => sum + p.amount, 0);

    // Create reservation document
    const reservationData = {
      referenceNumber,
      checkInDate: toTimestamp(reservation.checkInDate),
      checkOutDate: toTimestamp(reservation.checkOutDate),
      guestName: reservation.guestName,
      guestEmail: reservation.guestEmail || '',
      guestPhone: reservation.guestPhone,
      guestAddress: '',
      numberOfGuests: 0, // Not available in source data
      rooms: reservation.rooms,
      status: 'checked_out', // Set to checked_out as requested
      totalAmount,
      paidAmount: totalAmount,
      balanceAmount: 0,
      specialRequests: reservation.notes || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: ADMIN_USER_ID,
      updatedBy: ADMIN_USER_ID,
      deletedAt: null,
      deletedBy: null
    };

    // Insert reservation
    const reservationRef = await addDoc(collection(db, 'reservations'), reservationData);
    console.log(`  ✅ Reservation created: ${reservationRef.id}`);

    // Insert payments
    if (reservation.payments.length > 0) {
      for (let i = 0; i < reservation.payments.length; i++) {
        const payment = reservation.payments[i];
        const receiptNumber = await generateReceiptNumber(reservation.checkInDate);

        const paymentData = {
          reservationId: reservationRef.id,
          receiptNumber,
          amount: payment.amount,
          paymentMethod: mapPaymentMethod(payment.method),
          paymentDate: toTimestamp(reservation.checkInDate),
          notes: `Payment ${i + 1} of ${reservation.payments.length}`,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: ADMIN_USER_ID,
          updatedBy: ADMIN_USER_ID,
          deletedAt: null,
          deletedBy: null
        };

        const paymentRef = await addDoc(collection(db, 'payments'), paymentData);
        console.log(`  💰 Payment created: ${receiptNumber} - Rs. ${payment.amount} (${payment.method})`);
      }
    } else {
      console.log(`  ⚠️  No payments to record`);
    }

    return reservationRef.id;
  } catch (error) {
    console.error(`  ❌ Error inserting reservation:`, error);
    return null;
  }
}

// Main function
async function main() {
  console.log('=== IMPORTING RESERVATIONS TO FIREBASE ===\n');

  // Read merged reservations
  const jsonPath = path.join(__dirname, '../import/merged-reservations.json');
  const reservations: MergedReservation[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  console.log(`Found ${reservations.length} reservations to import\n`);

  // Ask for confirmation
  console.log('⚠️  WARNING: This will insert data into Firebase!');
  console.log('Status will be set to: checked_out');
  console.log('\nPress Ctrl+C to cancel, or wait 5 seconds to continue...\n');

  await new Promise(resolve => setTimeout(resolve, 5000));

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  // Insert each reservation
  for (let i = 0; i < reservations.length; i++) {
    const result = await insertReservation(reservations[i], i + 1);

    if (result) {
      successCount++;
    } else if (!reservations[i].guestName || reservations[i].guestName === 'Unknown' || !reservations[i].guestPhone) {
      skipCount++;
    } else {
      errorCount++;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Summary
  console.log('\n=== IMPORT SUMMARY ===');
  console.log(`Total: ${reservations.length}`);
  console.log(`✅ Successfully imported: ${successCount}`);
  console.log(`⚠️  Skipped (invalid): ${skipCount}`);
  console.log(`❌ Errors: ${errorCount}`);

  console.log('\n✅ Import complete!');
  process.exit(0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
