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

// Rooms data converted from PostgreSQL
const roomsData = [
  {
    id: '71473c7e-61fa-4be5-b9f2-2c32a2de8fb3',
    roomNumber: '102',
    roomTypeId: '77b434bb-3693-4e0e-ab12-cd64a28c8269',
    floorNumber: 1,
    isActive: true,
    status: 'available',
    createdAt: '2025-08-23T05:39:31.184Z',
    updatedAt: '2025-08-28T05:58:58.166Z',
    deletedAt: null,
    createdBy: ADMIN_USER_ID,
    updatedBy: ADMIN_USER_ID,
    deletedBy: null
  },
  {
    id: 'bbe55278-1744-4789-ab8c-182664fcdb76',
    roomNumber: '107',
    roomTypeId: '274dd93c-e93d-4070-8856-9365e056d025',
    floorNumber: 2,
    isActive: true,
    status: 'available',
    createdAt: '2025-08-23T05:39:31.184Z',
    updatedAt: '2025-08-23T09:40:10.283Z',
    deletedAt: null,
    createdBy: ADMIN_USER_ID,
    updatedBy: ADMIN_USER_ID,
    deletedBy: null
  },
  {
    id: '57baccd1-d739-44b0-93d6-27cd4d7371e3',
    roomNumber: '203',
    roomTypeId: '77b434bb-3693-4e0e-ab12-cd64a28c8269',
    floorNumber: 1,
    isActive: true,
    status: 'available',
    createdAt: '2025-08-23T05:39:31.184Z',
    updatedAt: '2025-08-23T09:40:10.283Z',
    deletedAt: null,
    createdBy: ADMIN_USER_ID,
    updatedBy: ADMIN_USER_ID,
    deletedBy: null
  },
  {
    id: '27d3b11d-1ab4-47d0-a385-f6292ade0e70',
    roomNumber: '204',
    roomTypeId: '77b434bb-3693-4e0e-ab12-cd64a28c8269',
    floorNumber: 1,
    isActive: true,
    status: 'available',
    createdAt: '2025-08-23T05:39:31.184Z',
    updatedAt: '2025-08-23T09:40:10.283Z',
    deletedAt: null,
    createdBy: ADMIN_USER_ID,
    updatedBy: ADMIN_USER_ID,
    deletedBy: null
  },
  {
    id: 'f538b292-c470-44bf-bf8f-7c9870806b94',
    roomNumber: '205',
    roomTypeId: '77b434bb-3693-4e0e-ab12-cd64a28c8269',
    floorNumber: 1,
    isActive: true,
    status: 'available',
    createdAt: '2025-08-23T05:39:31.184Z',
    updatedAt: '2025-08-23T09:40:10.283Z',
    deletedAt: null,
    createdBy: ADMIN_USER_ID,
    updatedBy: ADMIN_USER_ID,
    deletedBy: null
  },
  {
    id: '823eed17-474e-4e24-9767-c33034fac5d0',
    roomNumber: '206',
    roomTypeId: '77b434bb-3693-4e0e-ab12-cd64a28c8269',
    floorNumber: 1,
    isActive: true,
    status: 'available',
    createdAt: '2025-08-23T05:39:31.184Z',
    updatedAt: '2025-08-23T09:40:10.283Z',
    deletedAt: null,
    createdBy: ADMIN_USER_ID,
    updatedBy: ADMIN_USER_ID,
    deletedBy: null
  },
  {
    id: 'e569f47d-07ee-49e3-a5c1-2732dae0a9aa',
    roomNumber: '207',
    roomTypeId: '77b434bb-3693-4e0e-ab12-cd64a28c8269',
    floorNumber: 1,
    isActive: true,
    status: 'available',
    createdAt: '2025-08-23T05:39:31.184Z',
    updatedAt: '2025-08-23T09:40:10.283Z',
    deletedAt: null,
    createdBy: ADMIN_USER_ID,
    updatedBy: ADMIN_USER_ID,
    deletedBy: null
  },
  {
    id: '7f4f6dac-d005-469c-9772-f99180c4ea9c',
    roomNumber: '208',
    roomTypeId: '77b434bb-3693-4e0e-ab12-cd64a28c8269',
    floorNumber: 1,
    isActive: true,
    status: 'available',
    createdAt: '2025-08-23T05:39:31.184Z',
    updatedAt: '2025-08-23T09:40:10.283Z',
    deletedAt: null,
    createdBy: ADMIN_USER_ID,
    updatedBy: ADMIN_USER_ID,
    deletedBy: null
  },
  {
    id: '3326292c-ef01-45d6-8761-2f48b56a2ad6',
    roomNumber: '104',
    roomTypeId: '274dd93c-e93d-4070-8856-9365e056d025',
    floorNumber: 1,
    isActive: true,
    status: 'available',
    createdAt: '2025-08-23T05:39:31.184Z',
    updatedAt: '2025-08-27T11:22:32.167Z',
    deletedAt: null,
    createdBy: ADMIN_USER_ID,
    updatedBy: ADMIN_USER_ID,
    deletedBy: null
  },
  {
    id: 'bf495f47-725b-4112-97d3-f4a53dc4f644',
    roomNumber: '103',
    roomTypeId: '274dd93c-e93d-4070-8856-9365e056d025',
    floorNumber: 1,
    isActive: true,
    status: 'available',
    createdAt: '2025-08-23T05:39:31.184Z',
    updatedAt: '2025-08-27T12:35:26.375Z',
    deletedAt: null,
    createdBy: ADMIN_USER_ID,
    updatedBy: ADMIN_USER_ID,
    deletedBy: null
  },
  {
    id: 'ffbb4d40-f8d1-4d27-b515-7e3b1a075f45',
    roomNumber: '201',
    roomTypeId: '77b434bb-3693-4e0e-ab12-cd64a28c8269',
    floorNumber: 1,
    isActive: true,
    status: 'available',
    createdAt: '2025-08-23T05:39:31.184Z',
    updatedAt: '2025-08-28T06:24:11.269Z',
    deletedAt: null,
    createdBy: ADMIN_USER_ID,
    updatedBy: ADMIN_USER_ID,
    deletedBy: null
  },
  {
    id: '6f7f5531-d306-4525-8d8d-7262325eaa4b',
    roomNumber: '202',
    roomTypeId: '77b434bb-3693-4e0e-ab12-cd64a28c8269',
    floorNumber: 1,
    isActive: true,
    status: 'available',
    createdAt: '2025-08-23T05:39:31.184Z',
    updatedAt: '2025-08-28T06:24:16.571Z',
    deletedAt: null,
    createdBy: ADMIN_USER_ID,
    updatedBy: ADMIN_USER_ID,
    deletedBy: null
  },
  {
    id: 'f8407d68-934b-45ca-8b1f-f8a61f17e0de',
    roomNumber: '106',
    roomTypeId: '3091a830-f65b-4385-af93-747122bf8d6c',
    floorNumber: 1,
    isActive: true,
    status: 'available',
    createdAt: '2025-08-23T05:39:31.184Z',
    updatedAt: '2025-08-28T05:47:35.633Z',
    deletedAt: null,
    createdBy: ADMIN_USER_ID,
    updatedBy: ADMIN_USER_ID,
    deletedBy: null
  },
  {
    id: 'f2a85852-6839-47fe-aa4d-f29a321a6df5',
    roomNumber: '105',
    roomTypeId: '77b434bb-3693-4e0e-ab12-cd64a28c8269',
    floorNumber: 1,
    isActive: true,
    status: 'available',
    createdAt: '2025-08-23T05:39:31.184Z',
    updatedAt: '2025-08-28T06:54:58.911Z',
    deletedAt: null,
    createdBy: ADMIN_USER_ID,
    updatedBy: ADMIN_USER_ID,
    deletedBy: null
  },
  {
    id: '68fe2e66-843d-4161-91f6-5c3b6c855a6e',
    roomNumber: '101',
    roomTypeId: '3091a830-f65b-4385-af93-747122bf8d6c',
    floorNumber: 1,
    isActive: true,
    status: 'occupied',
    createdAt: '2025-08-23T05:39:31.184Z',
    updatedAt: '2025-08-29T03:11:00.307Z',
    deletedAt: null,
    createdBy: ADMIN_USER_ID,
    updatedBy: ADMIN_USER_ID,
    deletedBy: null
  },
  {
    id: '87ae8ac6-b1a5-4706-aa15-64fa06c05275',
    roomNumber: '108',
    roomTypeId: '274dd93c-e93d-4070-8856-9365e056d025',
    floorNumber: 2,
    isActive: true,
    status: 'available',
    createdAt: '2025-08-23T05:39:31.184Z',
    updatedAt: '2025-08-29T03:48:26.495Z',
    deletedAt: null,
    createdBy: ADMIN_USER_ID,
    updatedBy: ADMIN_USER_ID,
    deletedBy: null
  }
]

async function importRooms() {
  try {
    console.log('Starting rooms import...')
    
    for (const room of roomsData) {
      const { id, ...data } = room
      
      // Create document with specific ID
      const docRef = doc(db, 'rooms', id)
      await setDoc(docRef, {
        ...data,
        // Use server timestamp for current operations
        importedAt: serverTimestamp()
      })
      
      console.log(`✅ Imported room: ${data.roomNumber} (${id})`)
    }
    
    console.log(`\n🎉 Successfully imported ${roomsData.length} rooms to Firestore!`)
    console.log('Collection: rooms')
    
  } catch (error) {
    console.error('❌ Error importing rooms:', error)
    throw error
  }
}

// Run the import
importRooms()
  .then(() => {
    console.log('Import completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Import failed:', error)
    process.exit(1)
  })