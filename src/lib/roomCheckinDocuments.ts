// Room Check-in Documents Firestore Operations
// Handles CRUD operations for room check-in documents

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  writeBatch,
  runTransaction,
  Timestamp,
  DocumentSnapshot,
  Query,
  Unsubscribe
} from 'firebase/firestore'
import { db } from './firebase'
import { 
  RoomCheckinDocument,
  CreateRoomCheckinDocumentData,
  UpdateRoomCheckinDocumentData,
  RoomCheckinDocumentFilters,
  BulkDocumentUploadData,
  BulkDocumentUploadResult,
  DocumentUploadResult,
  DocumentSummary,
  DocumentAuditLog,
  DocumentType,
  DOCUMENT_TYPE_INFO
} from './types/roomCheckinDocuments'

const COLLECTION_NAME = 'roomCheckinDocuments'
const AUDIT_COLLECTION_NAME = 'roomCheckinDocumentAudits'

// Helper function to convert Firestore timestamp to ISO string
const timestampToString = (timestamp: any): string => {
  if (timestamp?.toDate) {
    return timestamp.toDate().toISOString()
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString()
  }
  return timestamp || new Date().toISOString()
}

// Helper function to convert document data
const convertDocumentData = (doc: DocumentSnapshot): RoomCheckinDocument | null => {
  if (!doc.exists()) return null
  
  const data = doc.data()
  return {
    id: doc.id,
    reservationId: data.reservationId,
    roomId: data.roomId,
    documentType: data.documentType,
    fileUrl: data.fileUrl,
    fileName: data.fileName,
    uploadedAt: timestampToString(data.uploadedAt),
    uploadedBy: data.uploadedBy,
    createdAt: timestampToString(data.createdAt),
    updatedAt: timestampToString(data.updatedAt),
    createdBy: data.createdBy,
    updatedBy: data.updatedBy,
    deletedBy: data.deletedBy,
    deletedAt: data.deletedAt ? timestampToString(data.deletedAt) : undefined
  }
}

// Create audit log entry
const createAuditLog = async (
  documentId: string,
  action: 'created' | 'updated' | 'deleted' | 'restored',
  performedBy: string,
  details?: Record<string, any>
): Promise<void> => {
  try {
    const auditData: Omit<DocumentAuditLog, 'id'> = {
      documentId,
      action,
      performedBy,
      performedAt: new Date().toISOString(),
      details
    }
    
    await addDoc(collection(db, AUDIT_COLLECTION_NAME), {
      ...auditData,
      performedAt: Timestamp.now()
    })
  } catch (error) {
    console.error('Error creating audit log:', error)
    // Don't throw error for audit log failures
  }
}

// Create a new room check-in document
export const createRoomCheckinDocument = async (
  data: CreateRoomCheckinDocumentData,
  userId: string
): Promise<string> => {
  try {
    const now = Timestamp.now()
    const documentData = {
      reservationId: data.reservationId,
      roomId: data.roomId,
      documentType: data.documentType,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      uploadedAt: now,
      uploadedBy: data.uploadedBy || userId,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      updatedBy: userId
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), documentData)
    
    // Create audit log
    await createAuditLog(docRef.id, 'created', userId, {
      documentType: data.documentType,
      fileName: data.fileName,
      reservationId: data.reservationId,
      roomId: data.roomId
    })

    return docRef.id
  } catch (error) {
    console.error('Error creating room check-in document:', error)
    throw error
  }
}

// Update a room check-in document
export const updateRoomCheckinDocument = async (
  documentId: string,
  data: UpdateRoomCheckinDocumentData,
  userId: string
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, documentId)
    
    // Get current document for audit
    const currentDoc = await getDoc(docRef)
    const currentData = currentDoc.exists() ? currentDoc.data() : null
    
    const updateData = {
      ...data,
      updatedAt: Timestamp.now(),
      updatedBy: userId
    }

    await updateDoc(docRef, updateData)
    
    // Create audit log
    await createAuditLog(documentId, 'updated', userId, {
      before: currentData,
      after: data
    })
  } catch (error) {
    console.error('Error updating room check-in document:', error)
    throw error
  }
}

// Soft delete a room check-in document
export const deleteRoomCheckinDocument = async (
  documentId: string,
  userId: string
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, documentId)
    
    // Get current document for audit
    const currentDoc = await getDoc(docRef)
    const currentData = currentDoc.exists() ? currentDoc.data() : null
    
    const deleteData = {
      deletedAt: Timestamp.now(),
      deletedBy: userId,
      updatedAt: Timestamp.now(),
      updatedBy: userId
    }

    await updateDoc(docRef, deleteData)
    
    // Create audit log
    await createAuditLog(documentId, 'deleted', userId, {
      document: currentData
    })
  } catch (error) {
    console.error('Error deleting room check-in document:', error)
    throw error
  }
}

// Restore a soft deleted document
export const restoreRoomCheckinDocument = async (
  documentId: string,
  userId: string
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, documentId)
    
    const updateData = {
      deletedAt: null,
      deletedBy: null,
      updatedAt: Timestamp.now(),
      updatedBy: userId
    }

    await updateDoc(docRef, updateData)
    
    // Create audit log
    await createAuditLog(documentId, 'restored', userId)
  } catch (error) {
    console.error('Error restoring room check-in document:', error)
    throw error
  }
}

// Get a single room check-in document by ID
export const getRoomCheckinDocumentById = async (
  documentId: string
): Promise<RoomCheckinDocument | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, documentId)
    const docSnap = await getDoc(docRef)
    return convertDocumentData(docSnap)
  } catch (error) {
    console.error('Error getting room check-in document:', error)
    throw error
  }
}

// Get room check-in documents with filters
export const getRoomCheckinDocuments = async (
  filters?: RoomCheckinDocumentFilters,
  limitCount?: number
): Promise<RoomCheckinDocument[]> => {
  try {
    let q: Query = collection(db, COLLECTION_NAME)

    // Apply filters
    if (filters?.reservationId) {
      q = query(q, where('reservationId', '==', filters.reservationId))
    }
    
    if (filters?.roomId) {
      q = query(q, where('roomId', '==', filters.roomId))
    }
    
    if (filters?.documentType) {
      q = query(q, where('documentType', '==', filters.documentType))
    }
    
    if (filters?.uploadedBy) {
      q = query(q, where('uploadedBy', '==', filters.uploadedBy))
    }
    
    if (filters?.createdBy) {
      q = query(q, where('createdBy', '==', filters.createdBy))
    }

    // Note: Removed server-side soft delete filtering due to Firestore limitations
    // Documents without deletedAt field are not matched by where('deletedAt', '==', null)
    // Client-side filtering applied below

    // Add ordering and limit
    q = query(q, orderBy('createdAt', 'desc'))
    
    if (limitCount) {
      q = query(q, limit(limitCount))
    }

    const querySnapshot = await getDocs(q)
    let documents = querySnapshot.docs
      .map(doc => convertDocumentData(doc))
      .filter((doc): doc is RoomCheckinDocument => doc !== null)

    // Apply soft delete filter client-side (more reliable than server-side)
    if (filters?.isActive !== false) {
      documents = documents.filter(doc => !doc.deletedAt)
    }

    // Apply date range filter (client-side due to Firestore limitations)
    if (filters?.dateRange) {
      const startDate = new Date(filters.dateRange.start)
      const endDate = new Date(filters.dateRange.end)

      documents = documents.filter(doc => {
        const docDate = new Date(doc.createdAt)
        return docDate >= startDate && docDate <= endDate
      })
    }

    return documents
  } catch (error) {
    console.error('Error getting room check-in documents:', error)
    
    // Fallback: get all documents and filter client-side
    try {
      const allQuery = query(
        collection(db, COLLECTION_NAME),
        orderBy('createdAt', 'desc'),
        ...(limitCount ? [limit(limitCount)] : [])
      )
      
      const fallbackSnapshot = await getDocs(allQuery)
      let documents = fallbackSnapshot.docs
        .map(doc => convertDocumentData(doc))
        .filter((doc): doc is RoomCheckinDocument => doc !== null)

      // Apply all filters client-side
      if (filters?.reservationId) {
        documents = documents.filter(doc => doc.reservationId === filters.reservationId)
      }
      
      if (filters?.roomId) {
        documents = documents.filter(doc => doc.roomId === filters.roomId)
      }
      
      if (filters?.documentType) {
        documents = documents.filter(doc => doc.documentType === filters.documentType)
      }
      
      if (filters?.uploadedBy) {
        documents = documents.filter(doc => doc.uploadedBy === filters.uploadedBy)
      }
      
      if (filters?.createdBy) {
        documents = documents.filter(doc => doc.createdBy === filters.createdBy)
      }
      
      if (filters?.isActive !== false) {
        documents = documents.filter(doc => !doc.deletedAt)
      }
      
      if (filters?.dateRange) {
        const startDate = new Date(filters.dateRange.start)
        const endDate = new Date(filters.dateRange.end)
        
        documents = documents.filter(doc => {
          const docDate = new Date(doc.createdAt)
          return docDate >= startDate && docDate <= endDate
        })
      }

      return documents
    } catch (fallbackError) {
      console.error('Fallback query also failed:', fallbackError)
      throw fallbackError
    }
  }
}

// Get documents by reservation ID
export const getRoomCheckinDocumentsByReservationId = async (
  reservationId: string
): Promise<RoomCheckinDocument[]> => {
  return getRoomCheckinDocuments({ reservationId, isActive: true })
}

// Get documents by room ID
export const getRoomCheckinDocumentsByRoomId = async (
  roomId: string
): Promise<RoomCheckinDocument[]> => {
  return getRoomCheckinDocuments({ roomId, isActive: true })
}

// Get documents by reservation and room
export const getRoomCheckinDocumentsByReservationAndRoom = async (
  reservationId: string,
  roomId: string
): Promise<RoomCheckinDocument[]> => {
  return getRoomCheckinDocuments({ reservationId, roomId, isActive: true })
}

// Subscribe to room check-in documents with real-time updates
export const subscribeToRoomCheckinDocuments = (
  filters: RoomCheckinDocumentFilters,
  callback: (documents: RoomCheckinDocument[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  try {
    let q: Query = collection(db, COLLECTION_NAME)

    // Apply basic filters that work with Firestore
    if (filters.reservationId) {
      q = query(q, where('reservationId', '==', filters.reservationId))
    }
    
    if (filters.roomId) {
      q = query(q, where('roomId', '==', filters.roomId))
    }
    
    // Note: Removed server-side soft delete filtering due to Firestore limitations
    // Documents without deletedAt field are not matched by where('deletedAt', '==', null)
    // Client-side filtering applied below
    
    q = query(q, orderBy('createdAt', 'desc'))

    return onSnapshot(
      q,
      (querySnapshot) => {
        let documents = querySnapshot.docs
          .map(doc => convertDocumentData(doc))
          .filter((doc): doc is RoomCheckinDocument => doc !== null)

        // Apply additional filters client-side
        // Apply soft delete filter first
        if (filters.isActive !== false) {
          documents = documents.filter(doc => !doc.deletedAt)
        }

        if (filters.documentType) {
          documents = documents.filter(doc => doc.documentType === filters.documentType)
        }
        
        if (filters.uploadedBy) {
          documents = documents.filter(doc => doc.uploadedBy === filters.uploadedBy)
        }
        
        if (filters.createdBy) {
          documents = documents.filter(doc => doc.createdBy === filters.createdBy)
        }
        
        if (filters.dateRange) {
          const startDate = new Date(filters.dateRange.start)
          const endDate = new Date(filters.dateRange.end)
          
          documents = documents.filter(doc => {
            const docDate = new Date(doc.createdAt)
            return docDate >= startDate && docDate <= endDate
          })
        }

        callback(documents)
      },
      (error) => {
        console.error('Error in room check-in documents subscription:', error)
        if (onError) onError(error)
      }
    )
  } catch (error) {
    console.error('Error setting up room check-in documents subscription:', error)
    if (onError) onError(error as Error)
    return () => {} // Return empty unsubscribe function
  }
}

// Bulk upload documents
export const createBulkRoomCheckinDocuments = async (
  data: BulkDocumentUploadData,
  userId: string
): Promise<BulkDocumentUploadResult> => {
  try {
    const batch = writeBatch(db)
    const uploadedDocuments: DocumentUploadResult[] = []
    const errors: Array<{ documentType: DocumentType; fileName: string; error: string }> = []
    
    for (const document of data.documents) {
      try {
        const docRef = doc(collection(db, COLLECTION_NAME))
        const now = Timestamp.now()
        
        const documentData = {
          reservationId: data.reservationId,
          roomId: data.roomId,
          documentType: document.documentType,
          fileUrl: document.fileUrl,
          fileName: document.fileName,
          uploadedAt: now,
          uploadedBy: userId,
          createdAt: now,
          updatedAt: now,
          createdBy: userId,
          updatedBy: userId
        }
        
        batch.set(docRef, documentData)
        
        uploadedDocuments.push({
          documentId: docRef.id,
          documentType: document.documentType,
          fileName: document.fileName,
          fileUrl: document.fileUrl,
          uploadedAt: new Date().toISOString()
        })
        
        // Create audit log (fire and forget)
        createAuditLog(docRef.id, 'created', userId, {
          documentType: document.documentType,
          fileName: document.fileName,
          reservationId: data.reservationId,
          roomId: data.roomId,
          bulkOperation: true
        })
        
      } catch (error) {
        errors.push({
          documentType: document.documentType,
          fileName: document.fileName,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    if (uploadedDocuments.length > 0) {
      await batch.commit()
    }
    
    return {
      reservationId: data.reservationId,
      roomId: data.roomId,
      uploadedDocuments,
      totalUploaded: uploadedDocuments.length,
      errors: errors.length > 0 ? errors : undefined
    }
  } catch (error) {
    console.error('Error in bulk document upload:', error)
    throw error
  }
}

// Delete all documents for a reservation (soft delete)
export const deleteRoomCheckinDocumentsByReservationId = async (
  reservationId: string,
  userId: string
): Promise<{ deletedCount: number }> => {
  try {
    const documents = await getRoomCheckinDocumentsByReservationId(reservationId)
    
    if (documents.length === 0) {
      return { deletedCount: 0 }
    }
    
    const batch = writeBatch(db)
    const now = Timestamp.now()
    
    for (const document of documents) {
      const docRef = doc(db, COLLECTION_NAME, document.id)
      batch.update(docRef, {
        deletedAt: now,
        deletedBy: userId,
        updatedAt: now,
        updatedBy: userId
      })
      
      // Create audit log (fire and forget)
      createAuditLog(document.id, 'deleted', userId, {
        reservationId,
        bulkOperation: true
      })
    }
    
    await batch.commit()
    
    return { deletedCount: documents.length }
  } catch (error) {
    console.error('Error deleting documents by reservation ID:', error)
    throw error
  }
}

// Get document summary for a reservation or room
export const getRoomCheckinDocumentSummary = async (
  reservationId: string,
  roomId?: string
): Promise<DocumentSummary | null> => {
  try {
    const filters: RoomCheckinDocumentFilters = { reservationId, isActive: true }
    if (roomId) {
      filters.roomId = roomId
    }
    
    const documents = await getRoomCheckinDocuments(filters)
    
    if (documents.length === 0) {
      return null
    }
    
    // Count documents by type
    const documentsByType = documents.reduce((acc, doc) => {
      acc[doc.documentType] = (acc[doc.documentType] || 0) + 1
      return acc
    }, {} as Record<DocumentType, number>)
    
    // Find required documents that are missing
    const uploadedTypes = new Set(documents.map(doc => doc.documentType))
    const missingRequiredDocuments = Object.values(DOCUMENT_TYPE_INFO)
      .filter(info => info.isRequired && !uploadedTypes.has(info.type))
      .map(info => info.type)
    
    // Find latest upload
    const sortedByUpload = [...documents].sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )
    const latestDocument = sortedByUpload[0]
    
    return {
      reservationId,
      roomId: roomId || '',
      totalDocuments: documents.length,
      documentsByType,
      hasRequiredDocuments: missingRequiredDocuments.length === 0,
      missingRequiredDocuments,
      lastUploadedAt: latestDocument?.uploadedAt,
      lastUploadedBy: latestDocument?.uploadedBy
    }
  } catch (error) {
    console.error('Error getting document summary:', error)
    throw error
  }
}

// Get document audit logs
export const getDocumentAuditLogs = async (
  documentId: string,
  limitCount: number = 50
): Promise<DocumentAuditLog[]> => {
  try {
    const q = query(
      collection(db, AUDIT_COLLECTION_NAME),
      where('documentId', '==', documentId),
      orderBy('performedAt', 'desc'),
      limit(limitCount)
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      ...doc.data() as Omit<DocumentAuditLog, 'performedAt'>,
      performedAt: timestampToString(doc.data().performedAt)
    }))
  } catch (error) {
    console.error('Error getting document audit logs:', error)
    throw error
  }
}

// Check if document type already exists for reservation-room combination
export const checkDocumentTypeExists = async (
  reservationId: string,
  roomId: string,
  documentType: DocumentType
): Promise<boolean> => {
  try {
    const documents = await getRoomCheckinDocuments({
      reservationId,
      roomId,
      documentType,
      isActive: true
    })
    
    return documents.length > 0
  } catch (error) {
    console.error('Error checking document type exists:', error)
    throw error
  }
}

// Update room ID for all documents of a specific reservation and old room
export const updateRoomCheckinDocuments = async (
  reservationId: string,
  oldRoomId: string,
  newRoomId: string,
  userId?: string
): Promise<void> => {
  try {
    // Get all documents for the old room
    const documents = await getRoomCheckinDocuments({
      reservationId,
      roomId: oldRoomId,
      isActive: true
    })

    if (documents.length === 0) {
      console.log('No documents found to update')
      return
    }

    // Use batch to update all documents atomically
    const batch = writeBatch(db)

    for (const document of documents) {
      const docRef = doc(db, COLLECTION_NAME, document.id)
      batch.update(docRef, {
        roomId: newRoomId,
        updatedAt: Timestamp.now(),
        updatedBy: userId || document.updatedBy
      })
    }

    await batch.commit()

    // Create audit logs for all updated documents
    for (const document of documents) {
      await createAuditLog(document.id, 'updated', userId || document.updatedBy, {
        roomChange: {
          oldRoomId,
          newRoomId,
          reservationId
        }
      })
    }

    console.log(`Updated ${documents.length} documents from room ${oldRoomId} to ${newRoomId}`)
  } catch (error) {
    console.error('Error updating room check-in documents:', error)
    throw error
  }
}