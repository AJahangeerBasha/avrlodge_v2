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

// Room types data converted from PostgreSQL
const roomTypesData = [
  {
    id: '274dd93c-e93d-4070-8856-9365e056d025',
    name: "Couple's Cove",
    pricePerNight: 1200.00,
    maxGuests: 2,
    numberOfRooms: 4,
    description: 'Ideal for couples or solo travelers seeking comfort and privacy.',
    amenities: ['WiFi', 'Private Bathroom', 'Air Conditioning'],
    isActive: true,
    createdAt: '2025-08-23T05:29:01.325Z',
    updatedAt: '2025-08-23T09:40:18.774Z',
    deletedAt: null,
    createdBy: ADMIN_USER_ID,
    updatedBy: ADMIN_USER_ID,
    deletedBy: null
  },
  {
    id: '77b434bb-3693-4e0e-ab12-cd64a28c8269',
    name: 'Family Nest',
    pricePerNight: 2200.00,
    maxGuests: 4,
    numberOfRooms: 10,
    description: 'Designed for families, friends and small groups.',
    amenities: ['WiFi', 'TV', 'Mini Fridge', 'Balcony'],
    isActive: true,
    createdAt: '2025-08-23T05:29:01.325Z',
    updatedAt: '2025-08-23T09:40:18.774Z',
    deletedAt: null,
    createdBy: ADMIN_USER_ID,
    updatedBy: ADMIN_USER_ID,
    deletedBy: null
  },
  {
    id: '3091a830-f65b-4385-af93-747122bf8d6c',
    name: "Rider's Haven",
    pricePerNight: 3000.00,
    maxGuests: 6,
    numberOfRooms: 2,
    description: 'Perfect for groups of bikers, backpackers, or friends on a road trip.',
    amenities: ['WiFi', 'Bike Parking', 'Lockers'],
    isActive: true,
    createdAt: '2025-08-23T05:29:01.325Z',
    updatedAt: '2025-08-23T09:40:18.774Z',
    deletedAt: null,
    createdBy: ADMIN_USER_ID,
    updatedBy: ADMIN_USER_ID,
    deletedBy: null
  },
  {
    id: '60230608-4023-4aa4-80df-0b486eacbfe7',
    name: 'Dormitory One Stay',
    pricePerNight: 350.00,
    maxGuests: 6,
    numberOfRooms: 1,
    description: 'Great for budget travelers, trekking groups and yoga students.',
    amenities: ['Shared Bathroom', 'Lockers', 'Common Area'],
    isActive: true,
    createdAt: '2025-08-23T05:29:01.325Z',
    updatedAt: '2025-08-23T09:40:18.774Z',
    deletedAt: null,
    createdBy: ADMIN_USER_ID,
    updatedBy: ADMIN_USER_ID,
    deletedBy: null
  },
  {
    id: 'b48297cf-35d9-4a7c-97dc-1138ae5ebbe7',
    name: 'Dormitory Two Stay',
    pricePerNight: 350.00,
    maxGuests: 15,
    numberOfRooms: 1,
    description: 'Great for budget travelers, trekking groups and yoga students.',
    amenities: ['Shared Bathroom', 'Lockers', 'Common Area'],
    isActive: true,
    createdAt: '2025-08-23T05:29:01.325Z',
    updatedAt: '2025-08-23T09:40:18.774Z',
    deletedAt: null,
    createdBy: ADMIN_USER_ID,
    updatedBy: ADMIN_USER_ID,
    deletedBy: null
  }
]

async function importRoomTypes() {
  try {
    console.log('Starting room types import...')
    
    for (const roomType of roomTypesData) {
      const { id, ...data } = roomType
      
      // Create document with specific ID
      const docRef = doc(db, 'roomTypes', id)
      await setDoc(docRef, {
        ...data,
        // Use server timestamp for current operations
        importedAt: serverTimestamp()
      })
      
      console.log(`✅ Imported room type: ${data.name} (${id})`)
    }
    
    console.log(`\n🎉 Successfully imported ${roomTypesData.length} room types to Firestore!`)
    console.log('Collection: roomTypes')
    
  } catch (error) {
    console.error('❌ Error importing room types:', error)
    throw error
  }
}

// Run the import
importRoomTypes()
  .then(() => {
    console.log('Import completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Import failed:', error)
    process.exit(1)
  })