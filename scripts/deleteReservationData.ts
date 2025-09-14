#!/usr/bin/env tsx

/**
 * Manual Reservation Data Deletion Script
 * 
 * Usage:
 * - Delete specific reservation: npm run delete-reservation <reservationId>
 * - Delete all reservations: npm run delete-reservation 0
 * 
 * This script deletes all related data across collections:
 * - reservations
 * - guests
 * - reservationRooms
 * - reservationSpecialCharges
 * - roomCheckinDocuments
 * - payments
 */

import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  where,
  writeBatch,
  limit as firestoreLimit
} from 'firebase/firestore'
import { db } from './firebaseConfig'

// Collection names
const COLLECTIONS = {
  reservations: 'reservations',
  guests: 'guests',
  guestAudits: 'guestAudits',
  reservationRooms: 'reservationRooms',
  reservationSpecialCharges: 'reservationSpecialCharges',
  roomCheckinDocuments: 'roomCheckinDocuments',
  payments: 'payments'
} as const

interface DeletionStats {
  reservations: number
  guests: number
  guestAudits: number
  reservationRooms: number
  reservationSpecialCharges: number
  roomCheckinDocuments: number
  payments: number
  totalDeleted: number
}

/**
 * Delete documents in batches to avoid Firestore limits
 */
async function deleteInBatches(collectionName: string, docs: any[]): Promise<number> {
  const batchSize = 500 // Firestore batch limit
  let totalDeleted = 0

  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = writeBatch(db)
    const batchDocs = docs.slice(i, i + batchSize)
    
    batchDocs.forEach(docSnapshot => {
      batch.delete(doc(db, collectionName, docSnapshot.id))
    })
    
    await batch.commit()
    totalDeleted += batchDocs.length
    
    console.log(`✅ Deleted ${batchDocs.length} documents from ${collectionName} (batch ${Math.floor(i / batchSize) + 1})`)
  }

  return totalDeleted
}

/**
 * Delete all documents related to a specific reservation ID
 */
async function deleteByReservationId(reservationId: string): Promise<DeletionStats> {
  console.log(`🗑️  Deleting all data for reservation ID: ${reservationId}`)
  
  const stats: DeletionStats = {
    reservations: 0,
    guests: 0,
    guestAudits: 0,
    reservationRooms: 0,
    reservationSpecialCharges: 0,
    roomCheckinDocuments: 0,
    payments: 0,
    totalDeleted: 0
  }

  try {
    // Delete from reservations collection
    console.log('🔍 Deleting reservation record...')
    const reservationRef = doc(db, COLLECTIONS.reservations, reservationId)
    await deleteDoc(reservationRef)
    stats.reservations = 1
    console.log('✅ Deleted 1 reservation record')

    // Delete from related collections
    const collectionsToDelete = [
      { name: COLLECTIONS.guests, field: 'reservationId' },
      { name: COLLECTIONS.guestAudits, field: 'details.reservationId' },
      { name: COLLECTIONS.reservationRooms, field: 'reservationId' },
      { name: COLLECTIONS.reservationSpecialCharges, field: 'reservationId' },
      { name: COLLECTIONS.roomCheckinDocuments, field: 'reservationId' },
      { name: COLLECTIONS.payments, field: 'reservationId' }
    ]

    for (const { name, field } of collectionsToDelete) {
      console.log(`🔍 Searching ${name} collection...`)
      
      const q = query(collection(db, name), where(field, '==', reservationId))
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) {
        console.log(`ℹ️  No documents found in ${name}`)
        continue
      }

      const deletedCount = await deleteInBatches(name, querySnapshot.docs)
      stats[name as keyof typeof stats] = deletedCount
    }

    stats.totalDeleted = Object.values(stats).reduce((sum, count) => sum + count, 0)
    
    return stats

  } catch (error) {
    console.error('❌ Error deleting reservation data:', error)
    throw error
  }
}

/**
 * Delete all reservation-related data from all collections
 */
async function deleteAllReservations(): Promise<DeletionStats> {
  console.log('🗑️  Deleting ALL reservation-related data...')
  console.log('⚠️  This will delete ALL data from reservation collections!')
  
  const stats: DeletionStats = {
    reservations: 0,
    guests: 0,
    guestAudits: 0,
    reservationRooms: 0,
    reservationSpecialCharges: 0,
    roomCheckinDocuments: 0,
    payments: 0,
    totalDeleted: 0
  }

  try {
    // Delete all documents from each collection
    for (const [key, collectionName] of Object.entries(COLLECTIONS)) {
      console.log(`🔍 Deleting all documents from ${collectionName}...`)
      
      const querySnapshot = await getDocs(collection(db, collectionName))
      
      if (querySnapshot.empty) {
        console.log(`ℹ️  No documents found in ${collectionName}`)
        continue
      }

      const deletedCount = await deleteInBatches(collectionName, querySnapshot.docs)
      stats[key as keyof typeof stats] = deletedCount
    }

    stats.totalDeleted = Object.values(stats).reduce((sum, count) => sum + count, 0)
    
    return stats

  } catch (error) {
    console.error('❌ Error deleting all reservation data:', error)
    throw error
  }
}

/**
 * Print deletion statistics
 */
function printStats(stats: DeletionStats, isSpecific: boolean): void {
  console.log('\n📊 DELETION STATISTICS')
  console.log('='.repeat(50))
  
  if (isSpecific) {
    console.log('🎯 Specific Reservation Deletion:')
  } else {
    console.log('🧹 Complete Data Cleanup:')
  }
  
  console.log(`📋 Reservations: ${stats.reservations}`)
  console.log(`👥 Guests: ${stats.guests}`)
  console.log(`📝 Guest Audits: ${stats.guestAudits}`)
  console.log(`🏠 Reservation Rooms: ${stats.reservationRooms}`)
  console.log(`💰 Special Charges: ${stats.reservationSpecialCharges}`)
  console.log(`📄 Check-in Documents: ${stats.roomCheckinDocuments}`)
  console.log(`💳 Payments: ${stats.payments}`)
  console.log('='.repeat(50))
  console.log(`🗑️  TOTAL DELETED: ${stats.totalDeleted} documents`)
  console.log('='.repeat(50))
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.error('❌ Usage: npm run delete-reservation <reservationId>')
    console.error('   Delete specific: npm run delete-reservation abc123')
    console.error('   Delete all: npm run delete-reservation 0')
    process.exit(1)
  }

  const reservationId = args[0]
  
  if (!reservationId) {
    console.error('❌ Please provide a reservation ID or 0 to delete all')
    process.exit(1)
  }

  console.log('🚀 Starting reservation data deletion...')
  console.log(`📅 Timestamp: ${new Date().toISOString()}`)
  
  try {
    let stats: DeletionStats
    
    if (reservationId === '0') {
      // Confirmation prompt for deleting all data
      console.log('\n⚠️  WARNING: You are about to delete ALL reservation data!')
      console.log('⚠️  This action cannot be undone!')
      console.log('⚠️  Press Ctrl+C to cancel or wait 5 seconds to continue...')
      
      // Wait 5 seconds before proceeding
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      stats = await deleteAllReservations()
      printStats(stats, false)
    } else {
      // Delete specific reservation
      console.log(`🎯 Target reservation: ${reservationId}`)
      stats = await deleteByReservationId(reservationId)
      printStats(stats, true)
    }

    if (stats.totalDeleted === 0) {
      console.log('ℹ️  No data was found to delete')
    } else {
      console.log(`✅ Successfully deleted ${stats.totalDeleted} documents`)
    }

  } catch (error) {
    console.error('❌ Deletion failed:', error)
    process.exit(1)
  }

  console.log('🏁 Deletion script completed')
}

// Execute the script
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Script execution failed:', error)
    process.exit(1)
  })
}

export { deleteByReservationId, deleteAllReservations }