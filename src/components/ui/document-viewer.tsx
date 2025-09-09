import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  Image as ImageIcon, 
  Download, 
  Eye, 
  X, 
  ExternalLink 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
// import Image from 'next/image' // Replaced with regular img tag for Vite

interface Document {
  id: string
  document_type: 'aadhar' | 'driving_license' | 'voter_id' | 'passport' | 'other'
  file_url: string
  file_name: string
  created_at: string
  uploaded_at?: string
  room_info?: {
    room_number: string
    room_type: string
  } | null
  document_source?: 'reservation' | 'room_checkin'
}

interface DocumentViewerProps {
  documents: Document[]
  onClose: () => void
  isOpen: boolean
}

export default function DocumentViewer({ documents, onClose, isOpen }: DocumentViewerProps) {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'aadhar': return 'Aadhaar Card'
      case 'driving_license': return 'Driving License'
      case 'voter_id': return 'Voter ID'
      case 'passport': return 'Passport'
      case 'other': return 'Other Document'
      default: return 'Document'
    }
  }

  const getDocumentIcon = (fileUrl: string) => {
    const extension = fileUrl.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'webp'].includes(extension || '')) {
      return <ImageIcon className="w-5 h-5" />
    }
    return <FileText className="w-5 h-5" />
  }

  const handleDownload = (doc: Document) => {
    const link = document.createElement('a')
    link.href = doc.file_url
    link.download = doc.file_name
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document)
  }

  const isImageFile = (fileUrl: string) => {
    const extension = fileUrl.split('.').pop()?.toLowerCase()
    return ['jpg', 'jpeg', 'png', 'webp'].includes(extension || '')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-6 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Uploaded Documents</h2>
                <p className="text-gray-600 mt-1">
                  {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
                  {(() => {
                    const roomDocs = documents.filter(doc => doc.document_source === 'room_checkin').length
                    const reservationDocs = documents.filter(doc => doc.document_source === 'reservation').length
                    if (roomDocs > 0 && reservationDocs > 0) {
                      return ` (${roomDocs} room check-in, ${reservationDocs} reservation)`
                    } else if (roomDocs > 0) {
                      return ` (${roomDocs} room check-in)`
                    } else if (reservationDocs > 0) {
                      return ` (${reservationDocs} reservation)`
                    }
                    return ''
                  })()}
                </p>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No documents uploaded yet</p>
                </div>
              ) : (
                documents.map((document) => (
                  <motion.div
                    key={document.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {getDocumentIcon(document.file_url)}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">
                            {getDocumentTypeLabel(document.document_type)}
                          </p>
                          {document.document_source === 'room_checkin' && document.room_info && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              Room {document.room_info.room_number}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{document.file_name}</p>
                        <p className="text-xs text-gray-500">
                          Uploaded: {new Date(document.uploaded_at || document.created_at).toLocaleDateString()}
                          {document.document_source === 'room_checkin' && document.room_info && (
                            <span className="ml-2 text-blue-600">
                              • {document.room_info.room_type}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleViewDocument(document)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                      <Button
                        onClick={() => handleDownload(document)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Document Preview Modal */}
            <AnimatePresence>
              {selectedDocument && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60 p-4"
                  onClick={() => setSelectedDocument(null)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Preview Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {getDocumentTypeLabel(selectedDocument.document_type)}
                        </h3>
                        <p className="text-sm text-gray-600">{selectedDocument.file_name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleDownload(selectedDocument)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                        <Button
                          onClick={() => setSelectedDocument(null)}
                          variant="outline"
                          size="sm"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Document Content */}
                    <div className="p-4 max-h-96 overflow-auto">
                      {isImageFile(selectedDocument.file_url) ? (
                        <div className="text-center">
                          <img
                            src={selectedDocument.file_url}
                            alt={selectedDocument.file_name}
                            width={800}
                            height={600}
                            className="max-w-full max-h-80 object-contain rounded-lg shadow-sm"
                          />
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-4">PDF Document</p>
                          <Button
                            onClick={() => window.open(selectedDocument.file_url, '_blank')}
                            className="flex items-center gap-2 mx-auto"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Open in New Tab
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 