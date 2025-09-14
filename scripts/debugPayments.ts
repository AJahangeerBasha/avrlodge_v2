import { getPaymentsByReservationId } from '../src/lib/payments'

// Test function to debug payments
async function debugPayments() {
  console.log('=== Payment Debug Script ===')

  // You'll need to replace this with an actual reservation ID from your Firebase
  const testReservationId = 'your-reservation-id-here'

  try {
    console.log(`Fetching payments for reservation ID: ${testReservationId}`)
    const payments = await getPaymentsByReservationId(testReservationId)
    console.log('Payments found:', payments.length)
    console.log('Payment details:', JSON.stringify(payments, null, 2))
  } catch (error) {
    console.error('Error fetching payments:', error)
  }
}

// Export for manual testing
export { debugPayments }

// Run if called directly
if (require.main === module) {
  debugPayments()
}