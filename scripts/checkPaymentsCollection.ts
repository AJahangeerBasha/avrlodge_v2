// This script should be called from browser console instead
// Since tsx has issues with top-level await in firebase.ts

// Paste this in browser console when on the admin/bookings page:

/*
// Check payments collection structure
(async function checkPaymentsCollection() {
  const { collection, getDocs } = await import('firebase/firestore');
  const { db } = await import('/src/lib/firebase.ts');

  console.log('=== Checking Payments Collection ===');

  try {
    const paymentsRef = collection(db, 'payments');
    const querySnapshot = await getDocs(paymentsRef);

    console.log(`Total payments in collection: ${querySnapshot.size}`);

    querySnapshot.forEach((doc, index) => {
      console.log(`\n--- Payment ${index + 1} ---`);
      console.log(`Document ID: ${doc.id}`);
      console.log('Raw data:', doc.data());

      const data = doc.data();
      console.log('Field analysis:');
      console.log('- reservationId:', data.reservationId);
      console.log('- reservation_id:', data.reservation_id);
      console.log('- amount:', data.amount);
      console.log('- paymentStatus:', data.paymentStatus);
      console.log('- deletedAt:', data.deletedAt);
      console.log('- createdAt:', data.createdAt);
    });

  } catch (error) {
    console.error('Error checking payments collection:', error);
  }
})();
*/

console.log('Copy the function above and paste it in browser console')