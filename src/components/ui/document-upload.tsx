import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, FileText, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { Button } from './button'
import { supabase } from '@/lib/supabase'

interface DocumentUploadProps {
  onUploadComplete: (fileUrl: string, fileName: string, fileSize?: number) => void
  onUploadError: (error: string) => void
  documentType: 'aadhar' | 'driving_license' | 'voter_id' | 'passport' | 'other'
  className?: string
}

export default function DocumentUpload({ 
  onUploadComplete, 
  onUploadError, 
  documentType,
  className = '' 
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setUploadedFile(file)
    setUploading(true)
    setUploadProgress(0)

    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload JPEG, PNG, WebP, or PDF files only.')
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        throw new Error('File too large. Maximum size is 5MB.')
      }

      // Generate unique filename
      const timestamp = Date.now()
      const extension = file.name.split('.').pop()
      const fileName = `${documentType}_${timestamp}.${extension}`
      const filePath = `documents/${fileName}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        throw new Error(`Upload failed: ${error.message}`)
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath)

      if (!urlData.publicUrl) {
        throw new Error('Failed to get public URL for uploaded file')
      }

      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i)
        await new Promise(resolve => setTimeout(resolve, 50))
      }

      onUploadComplete(urlData.publicUrl, fileName, file.size)
      
      // Reset the uploaded file to allow for new uploads
      setUploadedFile(null)
      
    } catch (error: any) {
      console.error('Upload error:', error)
      onUploadError(error.message || 'Upload failed')
      setUploadedFile(null)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [documentType, onUploadComplete, onUploadError])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: uploading
  })

  const removeFile = () => {
    setUploadedFile(null)
  }

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'aadhar': return 'Aadhaar Card'
      case 'driving_license': return 'Driving License'
      case 'voter_id': return 'Voter ID'
      case 'passport': return 'Passport'
      default: return 'Document'
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="w-8 h-8 text-gray-400" />
    }
    return <FileText className="w-8 h-8 text-gray-400" />
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Upload {getDocumentTypeLabel(documentType)}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Please upload a clear image or PDF of your {getDocumentTypeLabel(documentType).toLowerCase()}
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive && !isDragReject 
            ? 'border-gray-900 bg-gray-50' 
            : isDragReject 
            ? 'border-red-300 bg-red-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${uploading ? 'pointer-events-none opacity-75' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <AnimatePresence mode="wait">
          {uploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Upload className="w-8 h-8 text-gray-600" />
                </motion.div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Uploading...</p>
                <p className="text-xs text-gray-600 mt-1">{uploadedFile?.name}</p>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-gray-900 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-xs text-gray-500">{uploadProgress}%</p>
            </motion.div>
          ) : uploadedFile ? (
            <motion.div
              key="uploaded"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Upload Complete!</p>
                <p className="text-xs text-gray-600 mt-1">{uploadedFile.name}</p>
              </div>
              <Button
                onClick={removeFile}
                variant="outline"
                size="sm"
                className="mx-auto"
              >
                <X className="w-4 h-4 mr-2" />
                Remove File
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="default"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                {isDragReject ? (
                  <AlertCircle className="w-8 h-8 text-red-500" />
                ) : (
                  <Upload className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {isDragReject 
                    ? 'Invalid file type' 
                    : isDragActive 
                    ? 'Drop your file here' 
                    : 'Drag & drop your file here'
                  }
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {isDragReject 
                    ? 'Please upload a valid image or PDF file'
                    : 'or click to browse files'
                  }
                </p>
              </div>
              <div className="text-xs text-gray-500">
                <p>Supported formats: JPEG, PNG, WebP, PDF</p>
                <p>Maximum size: 5MB</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 