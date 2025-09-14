// Room Check-in Document Management Utilities
// High-level utilities for managing room check-in documents

import {
  createRoomCheckinDocument,
  createBulkRoomCheckinDocuments,
  getRoomCheckinDocumentsByReservationAndRoom,
  getRoomCheckinDocumentsByReservationId,
  getRoomCheckinDocumentSummary,
  deleteRoomCheckinDocument,
  deleteRoomCheckinDocumentsByReservationId,
  checkDocumentTypeExists
} from '../roomCheckinDocuments'
import { 
  DocumentType,
  RoomCheckinDocument,
  CreateRoomCheckinDocumentData,
  BulkDocumentUploadData,
  DocumentSummary,
  DocumentStatus,
  RoomDocumentStatus,
  DOCUMENT_TYPE_INFO
} from '../types/roomCheckinDocuments'
import {
  validateRoomCheckinDocument,
  validateBulkDocumentUpload,
  getRequiredDocumentStatus,
  calculateDocumentCompletionPercentage
} from './roomCheckinDocumentValidation'
import { getRoomById } from '../rooms'

// Upload a single document with validation and duplicate checking
export const uploadSingleDocument = async (
  data: CreateRoomCheckinDocumentData,
  userId: string,
  allowDuplicates: boolean = false
): Promise<{ documentId: string; warnings?: string[] }> => {
  try {
    const warnings: string[] = []
    
    // Validate the document data
    const validation = validateRoomCheckinDocument(data)
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`)
    }
    
    // Check for duplicates unless explicitly allowed
    if (!allowDuplicates) {
      const exists = await checkDocumentTypeExists(
        data.reservationId,
        data.roomId,
        data.documentType
      )
      
      if (exists) {
        warnings.push(`Document type ${data.documentType} already exists for this room. The existing document will be replaced.`)
        
        // Get existing documents and mark them as deleted
        const existingDocs = await getRoomCheckinDocumentsByReservationAndRoom(
          data.reservationId,
          data.roomId
        )
        
        const duplicateDocs = existingDocs.filter(doc => doc.documentType === data.documentType)
        for (const doc of duplicateDocs) {
          await deleteRoomCheckinDocument(doc.id, userId)
        }
      }
    }
    
    // Create the new document
    const documentId = await createRoomCheckinDocument(data, userId)
    
    return {
      documentId,
      warnings: warnings.length > 0 ? warnings : undefined
    }
  } catch (error) {
    console.error('Error uploading single document:', error)
    throw error
  }
}

// Upload multiple documents for a reservation-room combination
export const uploadMultipleDocuments = async (
  data: BulkDocumentUploadData,
  userId: string,
  replaceExisting: boolean = false
): Promise<{
  uploadedCount: number
  documentIds: string[]
  warnings: string[]
  errors: string[]
}> => {
  try {
    const warnings: string[] = []
    const errors: string[] = []
    
    // Validate the bulk upload data
    const validation = validateBulkDocumentUpload(data.documents)
    if (!validation.isValid) {
      throw new Error(`Bulk validation failed: ${validation.errors.map(e => e.message).join(', ')}`)
    }
    
    // If replace existing is true, delete all existing documents for this room
    if (replaceExisting) {
      const existingDocs = await getRoomCheckinDocumentsByReservationAndRoom(
        data.reservationId,
        data.roomId
      )
      
      for (const doc of existingDocs) {
        await deleteRoomCheckinDocument(doc.id, userId)
      }
      
      if (existingDocs.length > 0) {
        warnings.push(`Replaced ${existingDocs.length} existing documents`)
      }
    }
    
    // Upload the documents
    const result = await createBulkRoomCheckinDocuments(data, userId)
    
    // Collect any errors from the bulk upload
    if (result.errors) {
      result.errors.forEach(error => {
        errors.push(`${error.documentType} (${error.fileName}): ${error.error}`)
      })
    }
    
    return {
      uploadedCount: result.totalUploaded,
      documentIds: result.uploadedDocuments.map(doc => doc.documentId),
      warnings,
      errors
    }
  } catch (error) {
    console.error('Error uploading multiple documents:', error)
    throw error
  }
}

// Get comprehensive document status for a reservation-room combination
export const getRoomDocumentStatus = async (
  reservationId: string,
  roomId: string
): Promise<RoomDocumentStatus> => {
  try {
    const documents = await getRoomCheckinDocumentsByReservationAndRoom(
      reservationId,
      roomId
    )
    
    // Get room details for display
    const room = await getRoomById(roomId)
    
    // Create status for each document type
    const documentStatuses: DocumentStatus[] = Object.values(DOCUMENT_TYPE_INFO).map(typeInfo => {
      const existingDoc = documents.find(doc => doc.documentType === typeInfo.type)
      
      return {
        documentType: typeInfo.type,
        isUploaded: !!existingDoc,
        isRequired: typeInfo.isRequired,
        fileName: existingDoc?.fileName,
        uploadedAt: existingDoc?.uploadedAt,
        uploadedBy: existingDoc?.uploadedBy
      }
    })
    
    // Calculate completion percentage
    const uploadedTypes = documents.map(doc => doc.documentType)
    const completionPercentage = calculateDocumentCompletionPercentage(uploadedTypes)
    
    // Check if all required documents are present
    const requiredStatus = getRequiredDocumentStatus(uploadedTypes)
    
    return {
      reservationId,
      roomId,
      roomNumber: room?.roomNumber,
      documentStatuses,
      completionPercentage,
      hasAllRequiredDocuments: requiredStatus.hasAllRequired,
      totalDocuments: documents.length
    }
  } catch (error) {
    console.error('Error getting room document status:', error)
    throw error
  }
}

// Get document status for all rooms in a reservation
export const getReservationDocumentStatus = async (
  reservationId: string
): Promise<{
  reservationId: string
  totalRooms: number
  roomStatuses: RoomDocumentStatus[]
  overallCompletionPercentage: number
  roomsWithAllRequiredDocs: number
  totalDocuments: number
}> => {
  try {
    // Get all documents for the reservation
    const allDocuments = await getRoomCheckinDocumentsByReservationId(reservationId)
    
    // Group documents by room
    const documentsByRoom = allDocuments.reduce((acc, doc) => {
      if (!acc[doc.roomId]) {
        acc[doc.roomId] = []
      }
      acc[doc.roomId].push(doc)
      return acc
    }, {} as Record<string, RoomCheckinDocument[]>)
    
    // Get status for each room
    const roomIds = Object.keys(documentsByRoom)
    const roomStatuses: RoomDocumentStatus[] = []
    
    for (const roomId of roomIds) {
      const roomStatus = await getRoomDocumentStatus(reservationId, roomId)
      roomStatuses.push(roomStatus)
    }
    
    // Calculate overall statistics
    const roomsWithAllRequiredDocs = roomStatuses.filter(status => 
      status.hasAllRequiredDocuments
    ).length
    
    const overallCompletionPercentage = roomStatuses.length > 0
      ? Math.round(roomStatuses.reduce((sum, status) => 
          sum + status.completionPercentage, 0) / roomStatuses.length)
      : 0
    
    const totalDocuments = allDocuments.length
    
    return {
      reservationId,
      totalRooms: roomStatuses.length,
      roomStatuses,
      overallCompletionPercentage,
      roomsWithAllRequiredDocs,
      totalDocuments
    }
  } catch (error) {
    console.error('Error getting reservation document status:', error)
    throw error
  }
}

// Check document requirements and get missing documents
export const checkDocumentRequirements = async (
  reservationId: string,
  roomId: string
): Promise<{
  isComplete: boolean
  missingRequired: DocumentType[]
  missingOptional: DocumentType[]
  uploadedDocuments: Array<{
    documentType: DocumentType
    fileName: string
    uploadedAt: string
  }>
  recommendations: string[]
}> => {
  try {
    const documents = await getRoomCheckinDocumentsByReservationAndRoom(
      reservationId,
      roomId
    )
    
    const uploadedTypes = new Set(documents.map(doc => doc.documentType))
    const allTypes = Object.keys(DOCUMENT_TYPE_INFO) as DocumentType[]
    
    const missingRequired: DocumentType[] = []
    const missingOptional: DocumentType[] = []
    const recommendations: string[] = []
    
    // Check each document type
    allTypes.forEach(type => {
      const typeInfo = DOCUMENT_TYPE_INFO[type]
      
      if (!uploadedTypes.has(type)) {
        if (typeInfo.isRequired) {
          missingRequired.push(type)
        } else {
          missingOptional.push(type)
        }
      }
    })
    
    // Generate recommendations
    if (missingRequired.length > 0) {
      recommendations.push(`Upload required documents: ${missingRequired.map(type => DOCUMENT_TYPE_INFO[type].displayName).join(', ')}`)
    }
    
    if (missingOptional.length > 0 && missingRequired.length === 0) {
      recommendations.push(`Consider uploading additional documents for better verification: ${missingOptional.slice(0, 2).map(type => DOCUMENT_TYPE_INFO[type].displayName).join(', ')}`)
    }
    
    if (uploadedTypes.has('aadhar') && !uploadedTypes.has('passport') && !uploadedTypes.has('driving_license')) {
      recommendations.push('Consider adding a secondary ID document like passport or driving license')
    }
    
    const uploadedDocuments = documents.map(doc => ({
      documentType: doc.documentType,
      fileName: doc.fileName,
      uploadedAt: doc.uploadedAt
    }))
    
    return {
      isComplete: missingRequired.length === 0,
      missingRequired,
      missingOptional,
      uploadedDocuments,
      recommendations
    }
  } catch (error) {
    console.error('Error checking document requirements:', error)
    throw error
  }
}

// Remove all documents for a specific room in a reservation
export const removeRoomDocuments = async (
  reservationId: string,
  roomId: string,
  userId: string
): Promise<{ removedCount: number; removedDocuments: string[] }> => {
  try {
    const documents = await getRoomCheckinDocumentsByReservationAndRoom(
      reservationId,
      roomId
    )
    
    const removedDocuments: string[] = []
    
    for (const document of documents) {
      await deleteRoomCheckinDocument(document.id, userId)
      removedDocuments.push(`${DOCUMENT_TYPE_INFO[document.documentType].displayName} (${document.fileName})`)
    }
    
    return {
      removedCount: documents.length,
      removedDocuments
    }
  } catch (error) {
    console.error('Error removing room documents:', error)
    throw error
  }
}

// Remove specific document type from a room
export const removeDocumentType = async (
  reservationId: string,
  roomId: string,
  documentType: DocumentType,
  userId: string
): Promise<{ removed: boolean; documentName?: string }> => {
  try {
    const documents = await getRoomCheckinDocumentsByReservationAndRoom(
      reservationId,
      roomId
    )
    
    const documentToRemove = documents.find(doc => doc.documentType === documentType)
    
    if (!documentToRemove) {
      return { removed: false }
    }
    
    await deleteRoomCheckinDocument(documentToRemove.id, userId)
    
    return {
      removed: true,
      documentName: documentToRemove.fileName
    }
  } catch (error) {
    console.error('Error removing document type:', error)
    throw error
  }
}

// Get document analytics for admin dashboard
export const getDocumentAnalytics = async (): Promise<{
  totalDocuments: number
  documentsByType: Record<DocumentType, number>
  uploadTrends: Array<{
    date: string
    count: number
  }>
  mostUploadedTypes: Array<{
    type: DocumentType
    count: number
    percentage: number
  }>
}> => {
  try {
    // This would typically use aggregation queries
    // For now, we'll implement a basic version
    const allDocuments = await getRoomCheckinDocumentsByReservationId('') // Get all documents
    
    const documentsByType = allDocuments.reduce((acc, doc) => {
      acc[doc.documentType] = (acc[doc.documentType] || 0) + 1
      return acc
    }, {} as Record<DocumentType, number>)
    
    const totalDocuments = allDocuments.length
    
    // Calculate upload trends (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentDocuments = allDocuments.filter(doc => 
      new Date(doc.createdAt) >= thirtyDaysAgo
    )
    
    // Group by date
    const uploadTrends = recentDocuments.reduce((acc, doc) => {
      const date = new Date(doc.createdAt).toISOString().split('T')[0]
      const existing = acc.find(item => item.date === date)
      if (existing) {
        existing.count++
      } else {
        acc.push({ date, count: 1 })
      }
      return acc
    }, [] as Array<{ date: string; count: number }>)
    
    // Sort trends by date
    uploadTrends.sort((a, b) => a.date.localeCompare(b.date))
    
    // Calculate most uploaded types
    const mostUploadedTypes = Object.entries(documentsByType)
      .map(([type, count]) => ({
        type: type as DocumentType,
        count,
        percentage: Math.round((count / totalDocuments) * 100)
      }))
      .sort((a, b) => b.count - a.count)
    
    return {
      totalDocuments,
      documentsByType,
      uploadTrends,
      mostUploadedTypes
    }
  } catch (error) {
    console.error('Error getting document analytics:', error)
    throw error
  }
}

// Validate and sanitize file upload data before processing
export const prepareDocumentUpload = (
  reservationId: string,
  roomId: string,
  documentType: DocumentType,
  fileUrl: string,
  fileName: string,
  uploadedBy?: string
): { 
  isValid: boolean
  sanitizedData?: CreateRoomCheckinDocumentData
  errors: string[]
} => {
  try {
    const errors: string[] = []
    
    // Sanitize file name
    let sanitizedFileName = fileName.trim()
    
    // Remove potentially dangerous characters but keep essential ones
    sanitizedFileName = sanitizedFileName.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
    
    // Ensure file name isn't too long
    if (sanitizedFileName.length > 200) {
      const extension = sanitizedFileName.split('.').pop()
      const baseName = sanitizedFileName.substring(0, 200 - (extension ? extension.length + 1 : 0))
      sanitizedFileName = extension ? `${baseName}.${extension}` : baseName
    }
    
    // Validate file URL format
    try {
      new URL(fileUrl)
    } catch {
      errors.push('Invalid file URL format')
    }
    
    // Check if file URL looks like supported storage provider URL
    const isFirebaseStorage = fileUrl.includes('firebase') || fileUrl.includes('googleapis.com')
    const isSupabaseStorage = fileUrl.includes('supabase.co') || fileUrl.includes('supabase.com')

    if (!isFirebaseStorage && !isSupabaseStorage) {
      errors.push('File URL should be from Firebase Storage or Supabase Storage')
    }
    
    const sanitizedData: CreateRoomCheckinDocumentData = {
      reservationId: reservationId.trim(),
      roomId: roomId.trim(),
      documentType,
      fileUrl: fileUrl.trim(),
      fileName: sanitizedFileName,
      uploadedBy: uploadedBy?.trim()
    }
    
    // Validate the sanitized data
    const validation = validateRoomCheckinDocument(sanitizedData)
    if (!validation.isValid) {
      errors.push(...validation.errors.map(e => e.message))
    }
    
    return {
      isValid: errors.length === 0,
      sanitizedData: errors.length === 0 ? sanitizedData : undefined,
      errors
    }
  } catch (error) {
    console.error('Error preparing document upload:', error)
    return {
      isValid: false,
      errors: ['Failed to prepare document upload data']
    }
  }
}

// Generate document checklist for a reservation
export const generateDocumentChecklist = async (
  reservationId: string
): Promise<{
  reservationId: string
  rooms: Array<{
    roomId: string
    roomNumber?: string
    requiredDocuments: Array<{
      type: DocumentType
      displayName: string
      isUploaded: boolean
      fileName?: string
    }>
    optionalDocuments: Array<{
      type: DocumentType
      displayName: string
      isUploaded: boolean
      fileName?: string
    }>
    completionStatus: 'complete' | 'partial' | 'missing'
  }>
  overallStatus: 'complete' | 'partial' | 'missing'
}> => {
  try {
    const reservationStatus = await getReservationDocumentStatus(reservationId)
    
    const rooms = await Promise.all(
      reservationStatus.roomStatuses.map(async (roomStatus) => {
        const requirements = await checkDocumentRequirements(
          reservationId,
          roomStatus.roomId
        )
        
        const allDocumentTypes = Object.keys(DOCUMENT_TYPE_INFO) as DocumentType[]
        const uploadedDocuments = new Set(requirements.uploadedDocuments.map(doc => doc.documentType))
        
        const requiredDocuments = allDocumentTypes
          .filter(type => DOCUMENT_TYPE_INFO[type].isRequired)
          .map(type => {
            const uploadedDoc = requirements.uploadedDocuments.find(doc => doc.documentType === type)
            return {
              type,
              displayName: DOCUMENT_TYPE_INFO[type].displayName,
              isUploaded: uploadedDocuments.has(type),
              fileName: uploadedDoc?.fileName
            }
          })
        
        const optionalDocuments = allDocumentTypes
          .filter(type => !DOCUMENT_TYPE_INFO[type].isRequired)
          .map(type => {
            const uploadedDoc = requirements.uploadedDocuments.find(doc => doc.documentType === type)
            return {
              type,
              displayName: DOCUMENT_TYPE_INFO[type].displayName,
              isUploaded: uploadedDocuments.has(type),
              fileName: uploadedDoc?.fileName
            }
          })
        
        const completionStatus = requirements.isComplete 
          ? 'complete' 
          : requirements.uploadedDocuments.length > 0 
            ? 'partial' 
            : 'missing'
        
        return {
          roomId: roomStatus.roomId,
          roomNumber: roomStatus.roomNumber,
          requiredDocuments,
          optionalDocuments,
          completionStatus: completionStatus as 'complete' | 'partial' | 'missing'
        }
      })
    )
    
    const overallStatus = rooms.every(room => room.completionStatus === 'complete')
      ? 'complete'
      : rooms.some(room => room.completionStatus !== 'missing')
        ? 'partial'
        : 'missing'
    
    return {
      reservationId,
      rooms,
      overallStatus: overallStatus as 'complete' | 'partial' | 'missing'
    }
  } catch (error) {
    console.error('Error generating document checklist:', error)
    throw error
  }
}