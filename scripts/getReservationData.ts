import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs
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

interface ReservationData {
  reservation: any;
  guest: any;
  payments: any[];
  reservationRooms: any[];
}

// Convert Firestore Timestamp to readable format
function convertTimestamps(data: any): any {
  if (!data) return data;

  const converted = { ...data };

  for (const key in converted) {
    const value = converted[key];

    // Check if it's a Firestore Timestamp
    if (value && typeof value === 'object' && value.toDate) {
      converted[key] = value.toDate().toISOString();
    }
    // Recursively convert nested objects
    else if (value && typeof value === 'object' && !Array.isArray(value)) {
      converted[key] = convertTimestamps(value);
    }
    // Handle arrays
    else if (Array.isArray(value)) {
      converted[key] = value.map(item =>
        typeof item === 'object' ? convertTimestamps(item) : item
      );
    }
  }

  return converted;
}

async function getReservationData(reservationId: string): Promise<ReservationData> {
  console.log(`\n🔍 Fetching data for reservation ID: ${reservationId}\n`);

  const result: ReservationData = {
    reservation: null,
    guest: null,
    payments: [],
    reservationRooms: []
  };

  // 1. Fetch Reservation
  console.log('📋 Fetching reservation...');
  const reservationRef = doc(db, 'reservations', reservationId);
  const reservationSnap = await getDoc(reservationRef);

  if (!reservationSnap.exists()) {
    throw new Error(`❌ Reservation not found with ID: ${reservationId}`);
  }

  result.reservation = {
    id: reservationSnap.id,
    ...convertTimestamps(reservationSnap.data())
  };
  console.log(`✅ Reservation found: ${result.reservation.referenceNumber}`);

  // 2. Fetch Guest (if guestId exists)
  const guestId = result.reservation.guestId;
  if (guestId) {
    console.log(`👤 Fetching guest (${guestId})...`);
    const guestRef = doc(db, 'guests', guestId);
    const guestSnap = await getDoc(guestRef);

    if (guestSnap.exists()) {
      result.guest = {
        id: guestSnap.id,
        ...convertTimestamps(guestSnap.data())
      };
      console.log(`✅ Guest found: ${result.guest.name}`);
    } else {
      console.log(`⚠️  Guest not found`);
    }
  } else {
    console.log(`⚠️  No guestId in reservation`);
  }

  // 3. Fetch Payments
  console.log('💰 Fetching payments...');
  const paymentsRef = collection(db, 'payments');
  const paymentsQuery = query(paymentsRef, where('reservationId', '==', reservationId));
  const paymentsSnap = await getDocs(paymentsQuery);

  result.payments = paymentsSnap.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamps(doc.data())
  }));
  console.log(`✅ Found ${result.payments.length} payment(s)`);

  // 4. Fetch ReservationRooms
  console.log('🛏️  Fetching reservation rooms...');
  const reservationRoomsRef = collection(db, 'reservationRooms');
  const reservationRoomsQuery = query(
    reservationRoomsRef,
    where('reservationId', '==', reservationId)
  );
  const reservationRoomsSnap = await getDocs(reservationRoomsQuery);

  result.reservationRooms = reservationRoomsSnap.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamps(doc.data())
  }));
  console.log(`✅ Found ${result.reservationRooms.length} room(s)`);

  return result;
}

// Main function
async function main() {
  // Get reservationId from command line argument
  const reservationId = process.argv[2];

  if (!reservationId) {
    console.error('\n❌ Error: Please provide a reservation ID');
    console.log('\nUsage: npx tsx scripts/getReservationData.ts <reservationId>');
    console.log('Example: npx tsx scripts/getReservationData.ts zrn6xhxsNVyT0E8cdAWS\n');
    process.exit(1);
  }

  try {
    const data = await getReservationData(reservationId);

    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPLETE RESERVATION DATA');
    console.log('='.repeat(80) + '\n');

    // Output as formatted JSON
    console.log(JSON.stringify(data, null, 2));

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📈 SUMMARY');
    console.log('='.repeat(80));
    console.log(`📋 Reservation ID: ${data.reservation.id}`);
    console.log(`📋 Reference Number: ${data.reservation.referenceNumber}`);
    console.log(`👤 Guest: ${data.guest?.name || 'N/A'}`);
    console.log(`💰 Payments: ${data.payments.length}`);
    console.log(`🛏️  Rooms: ${data.reservationRooms.length}`);
    console.log(`💵 Total Amount: Rs. ${data.reservation.totalAmount}`);
    console.log(`📅 Check-in: ${data.reservation.checkInDate}`);
    console.log(`📅 Check-out: ${data.reservation.checkOutDate}`);
    console.log(`📊 Status: ${data.reservation.status}`);
    console.log('='.repeat(80) + '\n');

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
