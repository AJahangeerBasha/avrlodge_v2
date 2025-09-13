// Document Upload Utilities for Room Check-in
// Handles file validation, upload to Supabase Storage, and document creation

import { uploadFileWithProgress, getFileDownloadURL } from '../supabaseStorage'
import { createRoomCheckinDocument, createBulkRoomCheckinDocuments } from '../roomCheckinDocuments'
import {
  DocumentType,
  DOCUMENT_TYPE_INFO,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  DocumentUploadResult,
  BulkDocumentUploadResult,
  DocumentValidationResult
} from '../types/roomCheckinDocuments'

export interface DocumentUploadData {
  file: File
  documentType: DocumentType
  reservationId: string
  roomId: string
}

export interface DocumentUploadProgress {
  fileName: string
  documentType: DocumentType
  progress: number
  status: 'uploading' | 'processing' | 'completed' | 'error'
  error?: string
}

export interface MultiDocumentUploadResult {
  success: DocumentUploadResult[]
  errors: Array<{
    fileName: string
    documentType: DocumentType
    error: string
  }>
  totalUploaded: number
  totalErrors: number
}

// Validate a single file
export const validateDocumentFile = (
  file: File,
  documentType: DocumentType
): DocumentValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed. Allowed types: JPG, PNG, PDF`)
  }

  // Check file size
  const maxSize = DOCUMENT_TYPE_INFO[documentType]?.maxFileSize || MAX_FILE_SIZE
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024))
    errors.push(`File size (${Math.round(file.size / (1024 * 1024))}MB) exceeds maximum allowed size of ${maxSizeMB}MB`)
  }

  // Check file extension matches MIME type
  const fileExtension = file.name.toLowerCase().split('.').pop()
  const mimeTypeExtensions = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/jpg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'application/pdf': ['pdf']
  }

  const allowedExtensions = mimeTypeExtensions[file.type as keyof typeof mimeTypeExtensions]
  if (allowedExtensions && !allowedExtensions.includes(fileExtension || '')) {
    warnings.push(`File extension .${fileExtension} may not match file type ${file.type}`)
  }

  // Check document type specific validations
  const docTypeInfo = DOCUMENT_TYPE_INFO[documentType]
  if (!docTypeInfo.acceptedFormats.includes(file.type)) {
    errors.push(`File type ${file.type} is not accepted for ${docTypeInfo.displayName}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// Generate unique file path for storage
const generateFilePath = (
  reservationId: string,
  roomId: string,
  documentType: DocumentType,
  fileName: string
): string => {
  const timestamp = Date.now()
  const fileExtension = fileName.toLowerCase().split('.').pop()
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')

  return `room-documents/${reservationId}/${roomId}/${documentType}/${timestamp}_${sanitizedFileName}`
}

// Upload a single document
export const uploadSingleDocument = async (
  data: DocumentUploadData,
  userId: string,
  onProgress?: (progress: DocumentUploadProgress) => void
): Promise<DocumentUploadResult> => {
  const { file, documentType, reservationId, roomId } = data

  // Validate file
  const validation = validateDocumentFile(file, documentType)
  if (!validation.isValid) {
    throw new Error(`File validation failed: ${validation.errors.join(', ')}`)
  }

  try {
    // Generate file path
    const filePath = generateFilePath(reservationId, roomId, documentType, file.name)

    // Update progress - uploading
    onProgress?.({
      fileName: file.name,
      documentType,
      progress: 0,
      status: 'uploading'
    })

    // Upload file to Supabase Storage with progress tracking
    const downloadURL = await new Promise<string>((resolve, reject) => {
      uploadFileWithProgress(
        filePath,
        file,
        (progress) => {
          onProgress?.({
            fileName: file.name,
            documentType,
            progress: Math.round(progress),
            status: 'uploading'
          })
        },
        (error) => reject(error),
        (downloadURL) => resolve(downloadURL),
        {
          metadata: {
            reservationId,
            roomId,
            documentType,
            uploadedBy: userId,
            originalFileName: file.name
          }
        }
      ).catch(reject)
    })

    // Update progress - processing
    onProgress?.({
      fileName: file.name,
      documentType,
      progress: 100,
      status: 'processing'
    })

    // Create document record in Firestore
    const documentId = await createRoomCheckinDocument({
      reservationId,
      roomId,
      documentType,
      fileUrl: downloadURL,
      fileName: file.name,
      uploadedBy: userId
    }, userId)

    // Update progress - completed
    onProgress?.({
      fileName: file.name,
      documentType,
      progress: 100,
      status: 'completed'
    })

    return {
      documentId,
      documentType,
      fileName: file.name,
      fileUrl: downloadURL,
      uploadedAt: new Date().toISOString()
    }

  } catch (error) {
    // Update progress - error
    onProgress?.({
      fileName: file.name,
      documentType,
      progress: 0,
      status: 'error',
      error: error instanceof Error ? error.message : 'Upload failed'
    })

    throw error
  }
}

// Upload multiple documents
export const uploadMultipleDocuments = async (
  documents: DocumentUploadData[],
  userId: string,
  onProgress?: (progress: DocumentUploadProgress) => void
): Promise<MultiDocumentUploadResult> => {
  const success: DocumentUploadResult[] = []
  const errors: Array<{
    fileName: string
    documentType: DocumentType
    error: string
  }> = []

  // Upload documents sequentially to avoid overwhelming the system
  for (const docData of documents) {
    try {
      const result = await uploadSingleDocument(docData, userId, onProgress)
      success.push(result)
    } catch (error) {
      errors.push({
        fileName: docData.file.name,
        documentType: docData.documentType,
        error: error instanceof Error ? error.message : 'Upload failed'
      })

      // Notify about error
      onProgress?.({
        fileName: docData.file.name,
        documentType: docData.documentType,
        progress: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Upload failed'
      })
    }
  }

  return {
    success,
    errors,
    totalUploaded: success.length,
    totalErrors: errors.length
  }
}

// Check if file type is valid for document type
export const isFileTypeValid = (file: File, documentType: DocumentType): boolean => {
  const docTypeInfo = DOCUMENT_TYPE_INFO[documentType]
  return docTypeInfo.acceptedFormats.includes(file.type)
}

// Get file size in human readable format
export const getFileSizeString = (sizeInBytes: number): string => {
  if (sizeInBytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(sizeInBytes) / Math.log(k))

  return parseFloat((sizeInBytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Get document type display information
export const getDocumentTypeInfo = (documentType: DocumentType) => {
  return DOCUMENT_TYPE_INFO[documentType]
}

// Get all available document types
export const getAvailableDocumentTypes = (): DocumentType[] => {
  return Object.keys(DOCUMENT_TYPE_INFO) as DocumentType[]
}