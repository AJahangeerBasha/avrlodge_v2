/**
 * Debug script to check reservation and guest data
 */

import './firebaseConfig'
import { getAllReservations } from '../src/lib/reservations'
import { getGuestsByReservationId } from '../src/lib/guests'

async function debugReservationData() {
  try {
    console.log('🔍 Loading all reservations...')
    const reservations = await getAllReservations()
    console.log(`📊 Found ${reservations.length} reservations`)
    
    if (reservations.length === 0) {
      console.log('❌ No reservations found in database')
      return
    }
    
    console.log('\n📋 First few reservations:')
    for (let i = 0; i < Math.min(3, reservations.length); i++) {
      const reservation = reservations[i]
      console.log(`\n🎫 Reservation ${i + 1}:`)
      console.log(`   ID: ${reservation.id}`)
      console.log(`   Reference: ${reservation.referenceNumber}`)
      console.log(`   Guest Count: ${reservation.guestCount}`)
      console.log(`   Status: ${reservation.status}`)
      console.log(`   Check-in: ${reservation.checkInDate}`)
      console.log(`   Check-out: ${reservation.checkOutDate}`)
      
      // Check guests for this reservation
      console.log(`\n👥 Loading guests for reservation ${reservation.referenceNumber}...`)
      try {
        const guests = await getGuestsByReservationId(reservation.id)
        console.log(`   Found ${guests.length} guests`)
        
        if (guests.length > 0) {
          guests.forEach((guest, guestIndex) => {
            console.log(`   Guest ${guestIndex + 1}: ${guest.name} (${guest.phone}) - Primary: ${guest.isPrimaryGuest}`)
          })
          
          const primaryGuest = guests.find(g => g.isPrimaryGuest)
          if (primaryGuest) {
            console.log(`   ✅ Primary Guest: ${primaryGuest.name} (${primaryGuest.phone})`)
          } else {
            console.log(`   ❌ No primary guest found`)
          }
        } else {
          console.log(`   ❌ No guests found for this reservation`)
        }
      } catch (guestError) {
        console.error(`   ❌ Error loading guests:`, guestError)
      }
    }
    
  } catch (error) {
    console.error('❌ Error in debug script:', error)
  }
}

debugReservationData().then(() => {
  console.log('\n✅ Debug script completed')
  process.exit(0)
}).catch(error => {
  console.error('❌ Script failed:', error)
  process.exit(1)
})
