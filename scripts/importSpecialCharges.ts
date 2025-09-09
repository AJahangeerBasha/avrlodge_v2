import { initializeApp } from 'firebase/app'
import { getFirestore, collection, doc, setDoc, serverTimestamp } from 'firebase/firestore'

// Firebase config - use same as your app
const firebaseConfig = {
  apiKey: "AIzaSyDZxKLNEHICeyOoIwiJdAVf6ULMbW-Kq_c",
  authDomain: "avrlodgev2.firebaseapp.com",
  projectId: "avrlodgev2",
  storageBucket: "avrlodgev2.firebasestorage.app",
  messagingSenderId: "423109120986",
  appId: "1:423109120986:web:69500d1e043f9cc170e6e3",
  measurementId: "G-HSKHTM1097"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Your Firebase user ID
const ADMIN_USER_ID = 'yYGgGtjR6YQS7LfEfQLR9zvUqDh2'

// Special charges data converted from PostgreSQL
const specialChargesData = [
  {
    id: '396d6484-9ba1-4f46-89b2-a56dbf6804f7',
    chargeName: 'Kitchen',
    defaultRate: 2000.00,
    rateType: 'per_day',
    description: 'Kitchen facility usage',
    isActive: true,
    createdBy: ADMIN_USER_ID,
    updatedBy: ADMIN_USER_ID,
    deletedBy: null,
    createdAt: '2025-08-26T13:46:59.483Z',
    updatedAt: '2025-08-26T13:46:59.483Z',
    deletedAt: null
  },
  {
    id: 'e2774f90-c58a-4515-8d1a-63c7b678f7d0',
    chargeName: 'Campfire',
    defaultRate: 300.00,
    rateType: 'per_day',
    description: 'Campfire setup and maintenance',
    isActive: true,
    createdBy: ADMIN_USER_ID,
    updatedBy: ADMIN_USER_ID,
    deletedBy: null,
    createdAt: '2025-08-26T13:46:59.483Z',
    updatedAt: '2025-08-26T13:46:59.483Z',
    deletedAt: null
  },
  {
    id: 'f9e0cad4-db76-4d99-8b49-435a93ce6e3f',
    chargeName: 'Conference Hall',
    defaultRate: 5000.00,
    rateType: 'per_day',
    description: 'Conference hall rental',
    isActive: true,
    createdBy: ADMIN_USER_ID,
    updatedBy: ADMIN_USER_ID,
    deletedBy: null,
    createdAt: '2025-08-26T13:46:59.483Z',
    updatedAt: '2025-08-26T13:46:59.483Z',
    deletedAt: null
  },
  {
    id: '37604edc-e4c9-4668-8260-6cf75e51be43',
    chargeName: 'Extra Person',
    defaultRate: 300.00,
    rateType: 'per_person',
    description: 'Extra person accommodation charge',
    isActive: true,
    createdBy: ADMIN_USER_ID,
    updatedBy: ADMIN_USER_ID,
    deletedBy: null,
    createdAt: '2025-08-26T13:46:59.483Z',
    updatedAt: '2025-08-26T13:46:59.483Z',
    deletedAt: null
  }
]

async function importSpecialCharges() {
  try {
    console.log('Starting special charges import...')
    
    for (const charge of specialChargesData) {
      const { id, ...data } = charge
      
      // Create document with specific ID
      const docRef = doc(db, 'specialCharges', id)
      await setDoc(docRef, {
        ...data,
        // Use server timestamp for current operations
        importedAt: serverTimestamp()
      })
      
      console.log(`✅ Imported special charge: ${data.chargeName} (${id})`)
    }
    
    console.log(`\n🎉 Successfully imported ${specialChargesData.length} special charges to Firestore!`)
    console.log('Collection: specialCharges')
    
  } catch (error) {
    console.error('❌ Error importing special charges:', error)
    throw error
  }
}

// Run the import
importSpecialCharges()
  .then(() => {
    console.log('Import completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Import failed:', error)
    process.exit(1)
  })