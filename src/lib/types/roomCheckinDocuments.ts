// Room Check-in Documents Types
// Converted from PostgreSQL room_checkin_documents table

export type DocumentType = 
  | 'aadhar'
  | 'driving_license' 
  | 'voter_id'
  | 'passport'
  | 'pan_card'
  | 'other'

export interface RoomCheckinDocument {
  id: string
  reservationId: string
  roomId: string
  documentType: DocumentType
  fileUrl: string
  fileName: string
  uploadedAt: string // ISO timestamp
  uploadedBy?: string // User ID who uploaded the document
  createdAt: string // ISO timestamp
  updatedAt: string // ISO timestamp
  createdBy: string // User ID
  updatedBy: string // User ID
  deletedBy?: string // User ID who deleted (soft delete)
  deletedAt?: string // ISO timestamp for soft delete
}

export interface CreateRoomCheckinDocumentData {
  reservationId: string
  roomId: string
  documentType: DocumentType
  fileUrl: string
  fileName: string
  uploadedBy?: string
}

export interface UpdateRoomCheckinDocumentData {
  documentType?: DocumentType
  fileName?: string
  // Note: fileUrl should not be updated directly, require re-upload
}

export interface RoomCheckinDocumentFilters {
  reservationId?: string
  roomId?: string
  documentType?: DocumentType
  uploadedBy?: string
  createdBy?: string
  isActive?: boolean // Filter for non-deleted documents
  dateRange?: {
    start: string
    end: string
  }
}

export interface BulkDocumentUploadData {
  reservationId: string
  roomId: string
  documents: Array<{
    documentType: DocumentType
    fileUrl: string
    fileName: string
  }>
}

export interface DocumentUploadResult {
  documentId: string
  documentType: DocumentType
  fileName: string
  fileUrl: string
  uploadedAt: string
}

export interface BulkDocumentUploadResult {
  reservationId: string
  roomId: string
  uploadedDocuments: DocumentUploadResult[]
  totalUploaded: number
  errors?: Array<{
    documentType: DocumentType
    fileName: string
    error: string
  }>
}

export interface DocumentValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface DocumentTypeInfo {
  type: DocumentType
  displayName: string
  description: string
  acceptedFormats: string[]
  maxFileSize: number // in bytes
  isRequired: boolean
}

export interface DocumentSummary {
  reservationId: string
  roomId: string
  totalDocuments: number
  documentsByType: Record<DocumentType, number>
  hasRequiredDocuments: boolean
  missingRequiredDocuments: DocumentType[]
  lastUploadedAt?: string
  lastUploadedBy?: string
}

export interface DocumentAuditLog {
  documentId: string
  action: 'created' | 'updated' | 'deleted' | 'restored'
  performedBy: string
  performedAt: string
  details?: Record<string, any>
}

// Document type definitions with validation rules
export const DOCUMENT_TYPE_INFO: Record<DocumentType, DocumentTypeInfo> = {
  aadhar: {
    type: 'aadhar',
    displayName: 'Aadhar Card',
    description: 'Government issued identity proof',
    acceptedFormats: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    isRequired: true
  },
  driving_license: {
    type: 'driving_license',
    displayName: 'Driving License',
    description: 'Valid driving license',
    acceptedFormats: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    isRequired: false
  },
  voter_id: {
    type: 'voter_id',
    displayName: 'Voter ID',
    description: 'Election commission voter ID',
    acceptedFormats: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    isRequired: false
  },
  passport: {
    type: 'passport',
    displayName: 'Passport',
    description: 'Valid passport',
    acceptedFormats: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    isRequired: false
  },
  pan_card: {
    type: 'pan_card',
    displayName: 'PAN Card',
    description: 'Income tax PAN card',
    acceptedFormats: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    isRequired: false
  },
  other: {
    type: 'other',
    displayName: 'Other Document',
    description: 'Any other valid identity document',
    acceptedFormats: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    isRequired: false
  }
}

// File validation constants
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'application/pdf'
]

export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const MAX_DOCUMENTS_PER_ROOM = 20 // Reasonable limit

// Document status for UI
export interface DocumentStatus {
  documentType: DocumentType
  isUploaded: boolean
  isRequired: boolean
  fileName?: string
  uploadedAt?: string
  uploadedBy?: string
}

export interface RoomDocumentStatus {
  reservationId: string
  roomId: string
  roomNumber?: string
  documentStatuses: DocumentStatus[]
  completionPercentage: number
  hasAllRequiredDocuments: boolean
  totalDocuments: number
}