import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogIn, X, User, Home, Calendar, Upload, FileText, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import { TimePicker } from '@/components/ui/time-picker'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { updateReservationRoom } from '@/lib/reservationRooms'
import { DocumentType, DOCUMENT_TYPE_INFO } from '@/lib/types/roomCheckinDocuments'
import {
  validateDocumentFile,
  uploadSingleDocument,
  DocumentUploadProgress,
  getFileSizeString,
  getAvailableDocumentTypes
} from '@/lib/utils/documentUpload'

interface Booking {
  id: string
  reference_number: string
  guest_name: string
  guest_email: string
  guest_phone: string
  check_in_date: string
  check_out_date: string
}

interface Room {
  id: string
  room_number: string
  room_type: string
  guest_count: number
  room_status?: 'pending' | 'checked_in' | 'checked_out'
  check_in_datetime?: string | null
  check_out_datetime?: string | null
}

interface DocumentToUpload {
  id: string
  file: File
  documentType: DocumentType
  progress: DocumentUploadProgress | null
  uploaded: boolean
}

interface RoomCheckInModalProps {
  booking: Booking
  room: Room | null
  isOpen: boolean
  onClose: () => void
  onCheckInComplete: () => void
}

export function RoomCheckInModal({
  booking,
  room,
  isOpen,
  onClose,
  onCheckInComplete
}: RoomCheckInModalProps) {
  const [checkInDate, setCheckInDate] = useState('')
  const [checkInTime, setCheckInTime] = useState('')
  const [processing, setProcessing] = useState(false)

  // Document upload states
  const [documentsToUpload, setDocumentsToUpload] = useState<DocumentToUpload[]>([])
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType>('aadhar')
  const [uploadingDocuments, setUploadingDocuments] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  // Validation states
  const [validationErrors, setValidationErrors] = useState<{
    checkInDate?: string
    checkInTime?: string
    documents?: string
  }>({})
  const [showValidationErrors, setShowValidationErrors] = useState(false)

  const { toast } = useToast()
  const { currentUser } = useAuth()

  // Reset form when modal opens with new booking
  useEffect(() => {
    if (isOpen && booking) {
      // Set check-in date to booking's check-in date
      const bookingCheckInDate = booking.check_in_date ?
        new Date(booking.check_in_date).toISOString().split('T')[0] :
        new Date().toISOString().split('T')[0]
      setCheckInDate(bookingCheckInDate)

      // Set current time
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, '0')
      const minutes = now.getMinutes().toString().padStart(2, '0')
      setCheckInTime(`${hours}:${minutes}`)

      // Reset documents and validation
      setDocumentsToUpload([])
      setSelectedDocumentType('aadhar')
      setValidationErrors({})
      setShowValidationErrors(false)
    }
  }, [isOpen, booking])

  // Validation functions
  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {}

    // Validate check-in date
    if (!checkInDate) {
      errors.checkInDate = 'Check-in date is required'
    }

    // Validate check-in time
    if (!checkInTime) {
      errors.checkInTime = 'Check-in time is required'
    }

    // Validate documents - at least 1 document must be uploaded
    const uploadedDocuments = documentsToUpload.filter(doc => doc.uploaded)
    if (uploadedDocuments.length === 0) {
      errors.documents = 'At least 1 document must be uploaded before check-in'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const clearValidationError = (field: keyof typeof validationErrors) => {
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  // Document upload functions
  const processFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    if (fileArray.length === 0) return

    fileArray.forEach(file => {
      // Validate file
      const validation = validateDocumentFile(file, selectedDocumentType)
      if (!validation.isValid) {
        toast({
          title: "Invalid File",
          description: validation.errors.join(', '),
          variant: "destructive",
        })
        return
      }

      // Add to upload queue
      const newDocument: DocumentToUpload = {
        id: `${Date.now()}_${Math.random()}`,
        file,
        documentType: selectedDocumentType,
        progress: null,
        uploaded: false
      }

      setDocumentsToUpload(prev => [...prev, newDocument])
    })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    processFiles(files)
    // Reset file input
    e.target.value = ''
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files) {
      processFiles(files)
    }
  }

  const removeDocument = (documentId: string) => {
    setDocumentsToUpload(prev => prev.filter(doc => doc.id !== documentId))
  }

  const uploadDocuments = async () => {
    if (!currentUser || !room?.id || !booking.id) return

    const docsToUpload = documentsToUpload.filter(doc => !doc.uploaded)
    if (docsToUpload.length === 0) return

    setUploadingDocuments(true)

    for (const doc of docsToUpload) {
      try {
        const _result = await uploadSingleDocument(
          {
            file: doc.file,
            documentType: doc.documentType,
            reservationId: booking.id,
            roomId: room.id
          },
          currentUser.uid,
          (progress) => {
            setDocumentsToUpload(prev =>
              prev.map(d =>
                d.id === doc.id ? { ...d, progress } : d
              )
            )
          }
        )

        // Mark as uploaded
        setDocumentsToUpload(prev =>
          prev.map(d =>
            d.id === doc.id ? { ...d, uploaded: true } : d
          )
        )

        toast({
          title: "Document Uploaded",
          description: `${DOCUMENT_TYPE_INFO[doc.documentType].displayName} uploaded successfully`,
        })

        // Clear document validation error when a document is successfully uploaded
        clearValidationError('documents')

      } catch (error) {
        console.error('Document upload error:', error)
        toast({
          title: "Upload Failed",
          description: error instanceof Error ? error.message : "Failed to upload document",
          variant: "destructive",
        })
      }
    }

    setUploadingDocuments(false)
  }

  const getDocumentStatusIcon = (doc: DocumentToUpload) => {
    if (doc.uploaded) {
      return <CheckCircle className="w-4 h-4 text-green-600" />
    }
    if (doc.progress?.status === 'uploading') {
      return <Upload className="w-4 h-4 text-blue-600 animate-pulse" />
    }
    if (doc.progress?.status === 'error') {
      return <AlertTriangle className="w-4 h-4 text-red-600" />
    }
    return <FileText className="w-4 h-4 text-gray-600" />
  }

  const handleCheckIn = async () => {
    // Show validation errors
    setShowValidationErrors(true)

    // Validate form
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields before checking in.",
        variant: "destructive",
      })
      return
    }

    if (!currentUser || !room?.id) {
      toast({
        title: "Error",
        description: "Unable to check in room. Please try again.",
        variant: "destructive",
      })
      return
    }

    try {
      setProcessing(true)

      // Upload any remaining documents first
      const unuploadedDocs = documentsToUpload.filter(doc => !doc.uploaded)
      if (unuploadedDocs.length > 0) {
        await uploadDocuments()

        // Re-validate after upload attempt
        const uploadedAfterAttempt = documentsToUpload.filter(doc => doc.uploaded)
        if (uploadedAfterAttempt.length === 0) {
          toast({
            title: "Document Upload Required",
            description: "At least 1 document must be successfully uploaded before check-in.",
            variant: "destructive",
          })
          return
        }
      }

      // Create check-in datetime using selected date and time
      const checkInDateTime = new Date(`${checkInDate}T${checkInTime}:00`).toISOString()

      await updateReservationRoom(room.id, {
        roomStatus: 'checked_in',
        checkInTime: checkInDateTime,
        checkedInBy: currentUser.uid,
        updatedBy: currentUser.uid,
        updatedAt: new Date().toISOString()
      })

      toast({
        title: "Check-In Successful",
        description: `Room ${room.room_number} has been checked in successfully.`,
      })

      onCheckInComplete()
      onClose()
    } catch (error) {
      console.error('Error checking in room:', error)
      toast({
        title: "Check-In Failed",
        description: error instanceof Error ? error.message : "Failed to check in room. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  if (!room) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <LogIn className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Room Check-In
                  </h2>
                  <p className="text-sm text-gray-500">
                    {booking.guest_name} • {booking.reference_number}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Room Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Room Details
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Room:</span>
                    <span className="font-semibold text-gray-900">
                      {room.room_number} ({room.room_type})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Guests:</span>
                    <span className="font-semibold text-gray-900">
                      {room.guest_count}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Booking Check-In:</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(booking.check_in_date).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Check-In Date */}
              <div className="mb-6">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Check-In Date <span className="text-red-500">*</span>
                </Label>
                <DatePicker
                  selectedDate={checkInDate}
                  onDateChange={(date) => {
                    setCheckInDate(date)
                    clearValidationError('checkInDate')
                  }}
                  placeholder="Select check-in date"
                  className={`w-full ${
                    showValidationErrors && validationErrors.checkInDate
                      ? 'border-red-300'
                      : ''
                  }`}
                />
                {showValidationErrors && validationErrors.checkInDate && (
                  <p className="text-xs text-red-600 mt-1">
                    {validationErrors.checkInDate}
                  </p>
                )}
                {!validationErrors.checkInDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    Default: {new Date(booking.check_in_date).toLocaleDateString('en-IN')} (from booking)
                  </p>
                )}
              </div>

              {/* Check-In Time */}
              <div className="mb-6">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Check-In Time <span className="text-red-500">*</span>
                </Label>
                <TimePicker
                  selectedTime={checkInTime}
                  onTimeChange={(time) => {
                    setCheckInTime(time)
                    clearValidationError('checkInTime')
                  }}
                  placeholder="Select check-in time"
                  className={`w-full ${
                    showValidationErrors && validationErrors.checkInTime
                      ? 'border-red-300'
                      : ''
                  }`}
                />
                {showValidationErrors && validationErrors.checkInTime && (
                  <p className="text-xs text-red-600 mt-1">
                    {validationErrors.checkInTime}
                  </p>
                )}
              </div>


              {/* Document Upload Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Upload Documents <span className="text-red-500 text-base">*</span>
                  <span className="text-sm font-normal text-gray-600">(At least 1 required)</span>
                </h3>
                {showValidationErrors && validationErrors.documents && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      {validationErrors.documents}
                    </p>
                  </div>
                )}

                {/* Document Type Selection */}
                <div className="mb-4">
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Document Type
                  </Label>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {getAvailableDocumentTypes().map((docType) => (
                      <button
                        key={docType}
                        type="button"
                        onClick={() => setSelectedDocumentType(docType)}
                        className={`p-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
                          selectedDocumentType === docType
                            ? 'bg-blue-50 border-blue-300 text-blue-700'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className="text-xs font-medium">{DOCUMENT_TYPE_INFO[docType].displayName}</div>
                        {DOCUMENT_TYPE_INFO[docType].isRequired && (
                          <div className="text-xs text-red-600 mt-0.5">Required</div>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    Selected: {DOCUMENT_TYPE_INFO[selectedDocumentType].displayName} • Accepted: {DOCUMENT_TYPE_INFO[selectedDocumentType].acceptedFormats.join(', ')} • Max: 5MB
                  </p>
                </div>

                {/* File Upload Area */}
                <div className="mb-4">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      isDragOver
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept={DOCUMENT_TYPE_INFO[selectedDocumentType].acceptedFormats.join(',')}
                      multiple
                    />
                    <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragOver ? 'text-blue-600' : 'text-gray-400'}`} />
                    <p className={`text-sm font-medium mb-1 ${isDragOver ? 'text-blue-700' : 'text-gray-700'}`}>
                      {isDragOver ? 'Drop files here' : 'Drag & drop files here, or click to browse'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Upload {DOCUMENT_TYPE_INFO[selectedDocumentType].displayName} documents
                    </p>
                  </div>
                </div>

                {/* Documents to Upload List */}
                {documentsToUpload.length > 0 && (
                  <div className="mb-4">
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Documents to Upload ({documentsToUpload.length})
                    </Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {documentsToUpload.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {getDocumentStatusIcon(doc)}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900 truncate">
                                  {doc.file.name}
                                </span>
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                  {DOCUMENT_TYPE_INFO[doc.documentType].displayName}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500">
                                  {getFileSizeString(doc.file.size)}
                                </span>
                                {doc.progress && (
                                  <span className="text-xs text-gray-500">
                                    {doc.progress.status} {doc.progress.progress > 0 && `${doc.progress.progress}%`}
                                  </span>
                                )}
                              </div>
                              {/* Progress bar */}
                              {doc.progress && doc.progress.status === 'uploading' && (
                                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                  <div
                                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-200"
                                    style={{ width: `${doc.progress.progress}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => removeDocument(doc.id)}
                            disabled={doc.uploaded || uploadingDocuments}
                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Upload Documents Button */}
                    {documentsToUpload.some(doc => !doc.uploaded) && (
                      <button
                        onClick={uploadDocuments}
                        disabled={uploadingDocuments}
                        className={`w-full mt-3 p-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                          uploadingDocuments
                            ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100'
                        }`}
                      >
                        {uploadingDocuments ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span>Uploading Documents...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <Upload className="w-4 h-4" />
                            <span>Upload Documents ({documentsToUpload.filter(doc => !doc.uploaded).length})</span>
                          </div>
                        )}
                      </button>
                    )}
                  </div>
                )}

                {/* Document Upload Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 mb-1">Document Upload</p>
                      <ul className="text-blue-700 text-xs space-y-1">
                        <li>• You can upload multiple documents for this room check-in</li>
                        <li>• At least 1 document is required for check-in (any type)</li>
                        <li>• Documents are stored securely in Supabase Storage</li>
                        <li>• Supported formats: JPG, PNG, PDF (max 5MB each)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions - Fixed at bottom */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={processing}
                  className={`flex-1 p-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                    processing
                      ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </div>
                </button>
                <button
                  onClick={handleCheckIn}
                  disabled={processing}
                  className={`flex-1 p-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                    processing
                      ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
                  }`}
                >
                  {processing ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                      <span>Checking In...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <LogIn className="w-4 h-4" />
                      <span>Check In Room</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default RoomCheckInModal