import { 
  CreateRoomCheckinDocumentData,
  DocumentType,
  DOCUMENT_TYPE_INFO,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  DocumentValidationResult
} from '../types/roomCheckinDocuments'

// Validation error types
export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

// Validate document type
export const validateDocumentType = (documentType: DocumentType): ValidationError | null => {
  const validTypes = Object.keys(DOCUMENT_TYPE_INFO) as DocumentType[]
  
  if (!validTypes.includes(documentType)) {
    return {
      field: 'documentType',
      message: `Invalid document type. Must be one of: ${validTypes.join(', ')}`,
      code: 'INVALID_DOCUMENT_TYPE'
    }
  }
  
  return null
}

// Validate file URL
export const validateFileUrl = (fileUrl: string): ValidationError | null => {
  if (!fileUrl || fileUrl.trim().length === 0) {
    return {
      field: 'fileUrl',
      message: 'File URL is required',
      code: 'REQUIRED_FIELD'
    }
  }
  
  // Check if it's a valid URL format
  try {
    new URL(fileUrl)
  } catch {
    return {
      field: 'fileUrl',
      message: 'File URL must be a valid URL',
      code: 'INVALID_URL'
    }
  }
  
  // Check if URL is from supported storage providers (Firebase Storage or Supabase Storage)
  const isFirebaseStorage = fileUrl.includes('firebase') || fileUrl.includes('googleapis.com')
  const isSupabaseStorage = fileUrl.includes('supabase.co') || fileUrl.includes('supabase.com')

  if (!isFirebaseStorage && !isSupabaseStorage) {
    return {
      field: 'fileUrl',
      message: 'File URL should be from Firebase Storage or Supabase Storage',
      code: 'INVALID_STORAGE_URL'
    }
  }
  
  return null
}

// Validate file name
export const validateFileName = (fileName: string): ValidationError | null => {
  if (!fileName || fileName.trim().length === 0) {
    return {
      field: 'fileName',
      message: 'File name is required',
      code: 'REQUIRED_FIELD'
    }
  }
  
  if (fileName.length > 255) {
    return {
      field: 'fileName',
      message: 'File name cannot exceed 255 characters',
      code: 'FILE_NAME_TOO_LONG'
    }
  }
  
  // Check for valid file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf']
  const hasValidExtension = allowedExtensions.some(ext => 
    fileName.toLowerCase().endsWith(ext)
  )
  
  if (!hasValidExtension) {
    return {
      field: 'fileName',
      message: `File must have one of these extensions: ${allowedExtensions.join(', ')}`,
      code: 'INVALID_FILE_EXTENSION'
    }
  }
  
  // Check for potentially dangerous characters
  const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/
  if (dangerousChars.test(fileName)) {
    return {
      field: 'fileName',
      message: 'File name contains invalid characters',
      code: 'INVALID_FILE_NAME_CHARS'
    }
  }
  
  return null
}

// Validate required string fields
export const validateRequiredString = (value: string | undefined, fieldName: string): ValidationError | null => {
  if (!value || value.trim().length === 0) {
    return {
      field: fieldName,
      message: `${fieldName} is required`,
      code: 'REQUIRED_FIELD'
    }
  }
  
  return null
}

// Validate UUID format
export const validateUUID = (value: string, fieldName: string): ValidationError | null => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  
  if (!value || !uuidRegex.test(value)) {
    return {
      field: fieldName,
      message: `${fieldName} must be a valid UUID`,
      code: 'INVALID_UUID'
    }
  }
  
  return null
}

// Validate file type from file name
export const validateFileType = (fileName: string): ValidationError | null => {
  const extension = fileName.toLowerCase().split('.').pop()
  
  if (!extension) {
    return {
      field: 'fileName',
      message: 'File must have an extension',
      code: 'MISSING_FILE_EXTENSION'
    }
  }
  
  const mimeTypeMap: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg', 
    'png': 'image/png',
    'pdf': 'application/pdf'
  }
  
  const mimeType = mimeTypeMap[extension]
  
  if (!mimeType || !ALLOWED_FILE_TYPES.includes(mimeType)) {
    return {
      field: 'fileName',
      message: `File type not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`,
      code: 'FILE_TYPE_NOT_ALLOWED'
    }
  }
  
  return null
}

// Validate document against document type constraints
export const validateDocumentConstraints = (
  documentType: DocumentType,
  fileName: string
): ValidationError[] => {
  const errors: ValidationError[] = []
  const typeInfo = DOCUMENT_TYPE_INFO[documentType]
  
  if (!typeInfo) {
    errors.push({
      field: 'documentType',
      message: 'Unknown document type',
      code: 'UNKNOWN_DOCUMENT_TYPE'
    })
    return errors
  }
  
  // Validate file extension against allowed formats for document type
  const extension = fileName.toLowerCase().split('.').pop()
  if (extension) {
    const mimeTypeMap: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png', 
      'pdf': 'application/pdf'
    }
    
    const fileMimeType = mimeTypeMap[extension]
    if (fileMimeType && !typeInfo.acceptedFormats.includes(fileMimeType)) {
      errors.push({
        field: 'fileName',
        message: `File type ${fileMimeType} not allowed for ${typeInfo.displayName}. Allowed: ${typeInfo.acceptedFormats.join(', ')}`,
        code: 'FILE_TYPE_NOT_ALLOWED_FOR_DOCUMENT'
      })
    }
  }
  
  return errors
}

// Comprehensive room check-in document validation
export const validateRoomCheckinDocument = (data: CreateRoomCheckinDocumentData): ValidationResult => {
  const errors: ValidationError[] = []
  
  // Validate required string fields
  const reservationIdError = validateRequiredString(data.reservationId, 'reservationId')
  if (reservationIdError) errors.push(reservationIdError)
  
  const roomIdError = validateRequiredString(data.roomId, 'roomId')
  if (roomIdError) errors.push(roomIdError)
  
  // Validate document type
  const documentTypeError = validateDocumentType(data.documentType)
  if (documentTypeError) errors.push(documentTypeError)
  
  // Validate file URL
  const fileUrlError = validateFileUrl(data.fileUrl)
  if (fileUrlError) errors.push(fileUrlError)
  
  // Validate file name
  const fileNameError = validateFileName(data.fileName)
  if (fileNameError) errors.push(fileNameError)
  
  // Validate file type
  const fileTypeError = validateFileType(data.fileName)
  if (fileTypeError) errors.push(fileTypeError)
  
  // Validate document constraints
  const constraintErrors = validateDocumentConstraints(data.documentType, data.fileName)
  errors.push(...constraintErrors)
  
  // Validate uploadedBy if provided
  if (data.uploadedBy) {
    const uploadedByError = validateRequiredString(data.uploadedBy, 'uploadedBy')
    if (uploadedByError) errors.push(uploadedByError)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Validate bulk document upload
export const validateBulkDocumentUpload = (
  documents: Array<{
    documentType: DocumentType
    fileUrl: string
    fileName: string
  }>
): ValidationResult => {
  const errors: ValidationError[] = []
  
  if (!documents || documents.length === 0) {
    errors.push({
      field: 'documents',
      message: 'At least one document must be provided',
      code: 'EMPTY_DOCUMENTS_ARRAY'
    })
    return { isValid: false, errors }
  }
  
  if (documents.length > 20) { // Reasonable limit for bulk upload
    errors.push({
      field: 'documents',
      message: 'Cannot upload more than 20 documents at once',
      code: 'TOO_MANY_DOCUMENTS'
    })
  }
  
  // Validate each document
  documents.forEach((document, index) => {
    const validation = validateRoomCheckinDocument({
      reservationId: 'temp', // Will be set by calling function
      roomId: 'temp', // Will be set by calling function
      ...document
    })
    
    if (!validation.isValid) {
      validation.errors.forEach(error => {
        // Skip the temp validation errors
        if (error.field === 'reservationId' || error.field === 'roomId') {
          return
        }
        
        errors.push({
          ...error,
          field: `documents[${index}].${error.field}`,
          message: `Document ${index + 1}: ${error.message}`
        })
      })
    }
  })
  
  // Check for duplicate document types in the same batch
  const documentTypes = new Set<DocumentType>()
  documents.forEach((document, index) => {
    if (documentTypes.has(document.documentType)) {
      errors.push({
        field: `documents[${index}].documentType`,
        message: `Duplicate document type ${document.documentType} in batch`,
        code: 'DUPLICATE_DOCUMENT_TYPE'
      })
    } else {
      documentTypes.add(document.documentType)
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Validate file size (if available in client)
export const validateFileSize = (fileSize: number, documentType?: DocumentType): ValidationError | null => {
  if (fileSize > MAX_FILE_SIZE) {
    return {
      field: 'fileSize',
      message: `File size (${Math.round(fileSize / 1024 / 1024)}MB) exceeds maximum allowed size (${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB)`,
      code: 'FILE_SIZE_TOO_LARGE'
    }
  }
  
  // Check document type specific limits
  if (documentType) {
    const typeInfo = DOCUMENT_TYPE_INFO[documentType]
    if (typeInfo && fileSize > typeInfo.maxFileSize) {
      return {
        field: 'fileSize',
        message: `File size exceeds maximum allowed for ${typeInfo.displayName} (${Math.round(typeInfo.maxFileSize / 1024 / 1024)}MB)`,
        code: 'FILE_SIZE_EXCEEDS_TYPE_LIMIT'
      }
    }
  }
  
  return null
}

// Validate file content type (MIME type)
export const validateFileMimeType = (mimeType: string, fileName: string): ValidationError | null => {
  if (!ALLOWED_FILE_TYPES.includes(mimeType)) {
    return {
      field: 'fileType',
      message: `File type ${mimeType} not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`,
      code: 'MIME_TYPE_NOT_ALLOWED'
    }
  }
  
  // Cross-check with file extension
  const extension = fileName.toLowerCase().split('.').pop()
  const mimeTypeMap: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'pdf': 'application/pdf'
  }
  
  if (extension) {
    const expectedMimeType = mimeTypeMap[extension]
    if (expectedMimeType && expectedMimeType !== mimeType) {
      return {
        field: 'fileType',
        message: `File extension (${extension}) doesn't match MIME type (${mimeType})`,
        code: 'MIME_TYPE_EXTENSION_MISMATCH'
      }
    }
  }
  
  return null
}

// Client-side file validation (for use with File objects)
export const validateClientFile = (
  file: File,
  documentType: DocumentType
): DocumentValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Validate file size
  const sizeError = validateFileSize(file.size, documentType)
  if (sizeError) {
    errors.push(sizeError.message)
  }
  
  // Validate MIME type
  const mimeError = validateFileMimeType(file.type, file.name)
  if (mimeError) {
    errors.push(mimeError.message)
  }
  
  // Validate file name
  const nameError = validateFileName(file.name)
  if (nameError) {
    errors.push(nameError.message)
  }
  
  // Validate document constraints
  const constraintErrors = validateDocumentConstraints(documentType, file.name)
  constraintErrors.forEach(error => errors.push(error.message))
  
  // Check document type specific warnings
  const typeInfo = DOCUMENT_TYPE_INFO[documentType]
  if (typeInfo) {
    // Warn if file size is large but still under limit
    if (file.size > typeInfo.maxFileSize * 0.8) {
      warnings.push(`File size is large (${Math.round(file.size / 1024 / 1024)}MB). Consider compressing the file.`)
    }
    
    // Warn if using PDF for image-preferred document types
    if (file.type === 'application/pdf' && documentType !== 'other') {
      warnings.push('Image files (JPG, PNG) are preferred over PDF for better processing.')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// Check if required documents are missing for a reservation/room
export const getRequiredDocumentStatus = (
  existingDocumentTypes: DocumentType[]
): { 
  hasAllRequired: boolean
  missingRequired: DocumentType[]
  allRequired: DocumentType[]
} => {
  const allRequired = Object.values(DOCUMENT_TYPE_INFO)
    .filter(info => info.isRequired)
    .map(info => info.type)
  
  const existingTypes = new Set(existingDocumentTypes)
  const missingRequired = allRequired.filter(type => !existingTypes.has(type))
  
  return {
    hasAllRequired: missingRequired.length === 0,
    missingRequired,
    allRequired
  }
}

// Calculate document completion percentage
export const calculateDocumentCompletionPercentage = (
  existingDocumentTypes: DocumentType[]
): number => {
  const allDocumentTypes = Object.keys(DOCUMENT_TYPE_INFO) as DocumentType[]
  const requiredDocumentTypes = allDocumentTypes.filter(type => 
    DOCUMENT_TYPE_INFO[type].isRequired
  )
  
  if (requiredDocumentTypes.length === 0) {
    return 100 // If no required documents, 100% complete
  }
  
  const existingTypes = new Set(existingDocumentTypes)
  const completedRequired = requiredDocumentTypes.filter(type => 
    existingTypes.has(type)
  ).length
  
  return Math.round((completedRequired / requiredDocumentTypes.length) * 100)
}