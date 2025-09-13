#!/usr/bin/env tsx

/**
 * Debug script to check what data exists for a reservation ID
 */

import { 
  collection, 
  getDocs, 
  query, 
  where
} from 'firebase/firestore'
import { db } from './firebaseConfig'

async function debugReservationData(reservationId: string) {
  console.log(`🔍 Debugging data for reservation ID: ${reservationId}`)
  console.log('='.repeat(60))

  const collections = [
    'guests',
    'guestAudits', 
    'reservationRooms',
    'reservationSpecialCharges',
    'roomCheckinDocuments',
    'payments'
  ]

  for (const collectionName of collections) {
    console.log(`\n📂 Checking ${collectionName} collection...`)
    
    try {
      // Get all documents to see the structure first
      const allDocsQuery = await getDocs(collection(db, collectionName))
      console.log(`   Total documents in ${collectionName}: ${allDocsQuery.size}`)
      
      if (allDocsQuery.size > 0) {
        // Show structure of first document
        const firstDoc = allDocsQuery.docs[0]
        const data = firstDoc.data()
        console.log(`   Sample document structure:`, Object.keys(data))
        console.log(`   Sample document:`, data)
      }

      // Try to find documents with reservationId
      const reservationQuery = query(collection(db, collectionName), where('reservationId', '==', reservationId))
      const reservationDocs = await getDocs(reservationQuery)
      console.log(`   Documents with reservationId '${reservationId}': ${reservationDocs.size}`)
      
      reservationDocs.forEach(doc => {
        console.log(`   - Document ID: ${doc.id}`)
        console.log(`   - Data:`, doc.data())
      })

    } catch (error) {
      console.log(`   ❌ Error querying ${collectionName}:`, error.message)
    }
  }
}

async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.error('❌ Usage: tsx scripts/debugReservationData.ts <reservationId>')
    process.exit(1)
  }

  const reservationId = args[0]
  await debugReservationData(reservationId)
  console.log('\n🏁 Debug completed')
}

if (require.main === module) {
  main().catch(console.error)
}