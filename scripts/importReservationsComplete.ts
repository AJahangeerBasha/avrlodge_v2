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
  limit,
  doc,
  getDoc
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

// Cache for room lookups
const roomCache = new Map<string, string>();

// Get user ID by email
async function getUserIdByEmail(email: string): Promise<string | null> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.error(`❌ User not found with email: ${email}`);
      return null;
    }

    const userId = snapshot.docs[0].id;
    console.log(`✅ Found user ID: ${userId} for email: ${email}`);
    return userId;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

// Get room details by room number
async function getRoomDetails(roomNumber: string): Promise<{id: string, roomTypeId: string, tariff: number} | null> {
  // Check cache first
  const cacheKey = `room_${roomNumber}`;
  if (roomCache.has(cacheKey)) {
    return JSON.parse(roomCache.get(cacheKey)!);
  }

  try {
    const roomsRef = collection(db, 'rooms');
    const q = query(roomsRef, where('roomNumber', '==', roomNumber), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.error(`  ⚠️  Room not found: ${roomNumber}`);
      return null;
    }

    const roomData = snapshot.docs[0].data();
    const roomDetails = {
      id: snapshot.docs[0].id,
      roomTypeId: roomData.roomTypeId || '',
      tariff: 0 // Will be fetched from room type
    };

    // Fetch room type for tariff
    if (roomDetails.roomTypeId) {
      const roomTypeRef = doc(db, 'roomTypes', roomDetails.roomTypeId);
      const roomTypeSnap = await getDoc(roomTypeRef);
      if (roomTypeSnap.exists()) {
        const roomTypeData = roomTypeSnap.data();
        roomDetails.tariff = roomTypeData.pricePerNight || 2000; // Default 2000
      }
    }

    roomCache.set(cacheKey, JSON.stringify(roomDetails));
    return roomDetails;
  } catch (error) {
    console.error(`  ❌ Error fetching room ${roomNumber}:`, error);
    return null;
  }
}

// Get room type name by ID
async function getRoomTypeName(roomTypeId: string): Promise<string> {
  const cacheKey = `roomtype_${roomTypeId}`;
  if (roomCache.has(cacheKey)) {
    return roomCache.get(cacheKey)!;
  }

  try {
    const roomTypeRef = doc(db, 'roomTypes', roomTypeId);
    const roomTypeSnap = await getDoc(roomTypeRef);
    if (roomTypeSnap.exists()) {
      const name = roomTypeSnap.data().name || 'Unknown';
      roomCache.set(cacheKey, name);
      return name;
    }
  } catch (error) {
    console.error(`  ❌ Error fetching room type:`, error);
  }

  return 'Unknown';
}

// Generate reference number in format MMYYYY-XXX
async function generateReferenceNumber(checkInDate: string): Promise<string> {
  const date = new Date(checkInDate);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const monthYear = `${month}${year}`;

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

  return `${monthYear}-${nextNumber.toString().padStart(3, '0')}`;
}

// Generate receipt number in format PAY-MMYYYY-XXXXX
async function generateReceiptNumber(date: string): Promise<string> {
  const dateObj = new Date(date);
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  const monthYear = `${month}${year}`;

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

  return `PAY-${monthYear}-${nextNumber.toString().padStart(5, '0')}`;
}

// Convert date string to Firestore Timestamp
// Ensures proper date parsing without timezone issues
function toTimestamp(dateStr: string): Timestamp {
  // Parse date string (YYYY-MM-DD format)
  const [year, month, day] = dateStr.split('-').map(Number);
  // Create date at midnight local time (month is 0-indexed in JS)
  const date = new Date(year, month - 1, day, 0, 0, 0, 0);
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

// Create or get guest document
async function createGuest(
  guestName: string,
  guestEmail: string,
  guestPhone: string,
  userId: string
): Promise<string> {
  try {
    // Check if guest already exists by phone
    const guestsRef = collection(db, 'guests');
    const q = query(guestsRef, where('phone', '==', guestPhone), limit(1));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const guestId = snapshot.docs[0].id;
      console.log(`  👤 Guest exists: ${guestId}`);
      return guestId;
    }

    // Create new guest
    const guestData = {
      name: guestName,
      email: guestEmail || '',
      phone: guestPhone,
      address: '',
      idProofType: '',
      idProofNumber: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userId,
      updatedBy: userId,
      deletedAt: null,
      deletedBy: null
    };

    const guestRef = await addDoc(collection(db, 'guests'), guestData);
    console.log(`  👤 Guest created: ${guestRef.id}`);
    return guestRef.id;
  } catch (error) {
    console.error('  ❌ Error creating guest:', error);
    throw error;
  }
}

// Insert a single reservation with all related data
async function insertReservationComplete(
  reservation: MergedReservation,
  userId: string,
  index: number
): Promise<boolean> {
  try {
    console.log(`\n[${index}] Processing: ${reservation.guestName} - Rooms: [${reservation.rooms.join(', ')}]`);

    // Skip if invalid
    if (!reservation.guestName || reservation.guestName === 'Unknown' || !reservation.guestPhone) {
      console.log(`  ⚠️  Skipping - Missing guest name or phone`);
      return false;
    }

    // 1. Create/Get Guest
    const guestId = await createGuest(
      reservation.guestName,
      reservation.guestEmail,
      reservation.guestPhone,
      userId
    );

    // 2. Generate reference number
    const referenceNumber = await generateReferenceNumber(reservation.checkInDate);
    console.log(`  📋 Reference: ${referenceNumber}`);

    // 3. Get first room details for tariff calculation
    const firstRoomDetails = await getRoomDetails(reservation.rooms[0]);
    const roomTariff = firstRoomDetails?.tariff || 2000;
    const totalAmount = reservation.payments.reduce((sum, p) => sum + p.amount, 0);
    const totalRooms = reservation.rooms.length;

    // 4. Create reservation document with ALL required fields
    const reservationData = {
      referenceNumber,
      checkInDate: reservation.checkInDate, // Store as string YYYY-MM-DD
      checkOutDate: reservation.checkOutDate, // Store as string YYYY-MM-DD
      guestName: reservation.guestName,
      guestEmail: reservation.guestEmail || '',
      guestPhone: reservation.guestPhone,
      guestAddress: '',

      // Guest/Booking info
      guestType: 'individual',
      guestCount: 1,

      // Room info (for single room reservations, use first room)
      roomId: firstRoomDetails?.id || null,
      roomTariff,

      // Pricing
      totalPrice: totalAmount,
      totalQuote: totalAmount,
      totalAmount, // Keep for compatibility
      paidAmount: totalAmount,
      balanceAmount: 0,
      percentageDiscount: 0,
      fixedDiscount: 0,

      // Status
      status: 'checked_out',
      paymentStatus: totalAmount > 0 ? 'paid' : 'unpaid',

      // Agent
      agentId: null,
      agentCommission: null,

      // Other
      specialRequests: reservation.notes || '',
      guestId, // Link to guest

      // Timestamps
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userId,
      updatedBy: userId,
      deletedAt: null,
      deletedBy: null
    };

    const reservationRef = await addDoc(collection(db, 'reservations'), reservationData);
    console.log(`  ✅ Reservation created: ${reservationRef.id}`);

    // 5. Create reservationRooms documents with ALL required fields
    for (const roomNumber of reservation.rooms) {
      const roomDetails = await getRoomDetails(roomNumber);

      if (roomDetails) {
        const roomTypeName = await getRoomTypeName(roomDetails.roomTypeId);

        const reservationRoomData = {
          reservationId: reservationRef.id,
          roomId: roomDetails.id,
          roomNumber,
          roomType: roomTypeName,
          tariffPerNight: roomDetails.tariff,
          guestCount: 1,
          roomStatus: 'checked_out', // Match reservation status
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: userId,
          updatedBy: userId,
          deletedAt: null,
          deletedBy: null
        };

        await addDoc(collection(db, 'reservationRooms'), reservationRoomData);
        console.log(`  🛏️  Room linked: ${roomNumber} (${roomDetails.id}) - ${roomTypeName}`);
      }
    }

    // 6. Create payment documents
    if (reservation.payments.length > 0) {
      for (let i = 0; i < reservation.payments.length; i++) {
        const payment = reservation.payments[i];
        const receiptNumber = await generateReceiptNumber(reservation.checkInDate);

        const paymentData = {
          reservationId: reservationRef.id,
          guestId,
          receiptNumber,
          amount: payment.amount,
          paymentMethod: mapPaymentMethod(payment.method),
          paymentDate: toTimestamp(reservation.checkInDate),
          paymentStatus: 'completed', // Add payment status
          notes: `Payment ${i + 1} of ${reservation.payments.length}`,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: userId,
          updatedBy: userId,
          deletedAt: null,
          deletedBy: null
        };

        await addDoc(collection(db, 'payments'), paymentData);
        console.log(`  💰 Payment: ${receiptNumber} - Rs. ${payment.amount} (${payment.method})`);
      }
    } else {
      console.log(`  ⚠️  No payments to record`);
    }

    return true;
  } catch (error) {
    console.error(`  ❌ Error inserting reservation:`, error);
    return false;
  }
}

// Main function
async function main() {
  console.log('=== COMPREHENSIVE RESERVATION IMPORT ===\n');

  // 1. Get user ID from email
  const USER_EMAIL = 'writetojahangeer@gmail.com';
  const userId = await getUserIdByEmail(USER_EMAIL);

  if (!userId) {
    console.error('❌ Cannot proceed without user ID');
    process.exit(1);
  }

  // 2. Read merged reservations
  const jsonPath = path.join(__dirname, '../import/merged-reservations.json');
  const reservations: MergedReservation[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  console.log(`\n📊 Found ${reservations.length} reservations to import\n`);

  // 3. Preview what will be created
  console.log('📝 Collections that will be populated:');
  console.log('  - /guests (create or reuse existing)');
  console.log('  - /reservations');
  console.log('  - /reservationRooms (linking rooms to reservations)');
  console.log('  - /payments\n');

  console.log('⚠️  WARNING: This will insert data into Firebase!');
  console.log('Status will be set to: checked_out');
  console.log(`User: ${USER_EMAIL} (${userId})`);
  console.log('\nPress Ctrl+C to cancel, or wait 5 seconds to continue...\n');

  await new Promise(resolve => setTimeout(resolve, 5000));

  let successCount = 0;
  let skipCount = 0;

  // 4. Insert each reservation
  for (let i = 0; i < reservations.length; i++) {
    const success = await insertReservationComplete(reservations[i], userId, i + 1);

    if (success) {
      successCount++;
    } else {
      skipCount++;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 150));
  }

  // 5. Summary
  console.log('\n\n=== IMPORT SUMMARY ===');
  console.log(`Total: ${reservations.length}`);
  console.log(`✅ Successfully imported: ${successCount}`);
  console.log(`⚠️  Skipped (invalid): ${skipCount}`);

  console.log('\n📊 Documents created:');
  console.log(`  👤 Guests: ~${successCount} (some reused if existing)`);
  console.log(`  📋 Reservations: ${successCount}`);
  console.log(`  🛏️  ReservationRooms: ~${successCount * 1.5} (avg)`);
  console.log(`  💰 Payments: ~${successCount}`);

  console.log('\n✅ Import complete!');
  process.exit(0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
