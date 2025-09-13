import { supabase } from './supabase'

// Bucket name for room documents
const DOCUMENTS_BUCKET = 'room-documents'

// Upload file to Supabase Storage
export const uploadFile = async (
  path: string,
  file: File | Blob,
  metadata?: Record<string, any>
): Promise<{ data: { path: string; fullPath: string } | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        ...metadata,
      })

    if (error) {
      throw error
    }

    return {
      data: data ? {
        path: data.path,
        fullPath: data.fullPath || data.path
      } : null,
      error: null
    }
  } catch (error) {
    return {
      data: null,
      error: error as Error
    }
  }
}

// Get public URL for uploaded file
export const getFileDownloadURL = async (path: string): Promise<string> => {
  const { data } = supabase.storage
    .from(DOCUMENTS_BUCKET)
    .getPublicUrl(path)

  return data.publicUrl
}

// Delete file from Supabase Storage
export const deleteFile = async (path: string): Promise<void> => {
  const { error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .remove([path])

  if (error) {
    throw error
  }
}

// List files in a folder
export const listFiles = async (path: string): Promise<any[]> => {
  const { data, error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .list(path)

  if (error) {
    throw error
  }

  return data || []
}

// Upload file with progress tracking
export const uploadFileWithProgress = (
  path: string,
  file: File | Blob,
  onProgress?: (progress: number) => void,
  onError?: (error: Error) => void,
  onSuccess?: (downloadURL: string) => void,
  metadata?: Record<string, any>
): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Supabase doesn't have built-in progress tracking for uploads
      // We'll simulate progress updates
      onProgress?.(10)

      const { data, error } = await uploadFile(path, file, metadata)

      if (error) {
        onError?.(error)
        reject(error)
        return
      }

      onProgress?.(50)

      if (data) {
        const publicUrl = await getFileDownloadURL(data.path)
        onProgress?.(100)
        onSuccess?.(publicUrl)
        resolve()
      } else {
        throw new Error('Upload failed - no data returned')
      }
    } catch (error) {
      const err = error as Error
      onError?.(err)
      reject(err)
    }
  })
}

// Create bucket if it doesn't exist (for initialization)
export const initializeStorage = async (): Promise<void> => {
  try {
    // First check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.log(`⚠️ Could not list buckets:`, listError.message)
      return
    }

    const bucketExists = buckets?.some(bucket => bucket.name === DOCUMENTS_BUCKET)

    if (bucketExists) {
      console.log(`✅ Storage bucket '${DOCUMENTS_BUCKET}' already exists`)
      return
    }

    // Try to create the bucket
    const { error: createError } = await supabase.storage.createBucket(DOCUMENTS_BUCKET, {
      public: false, // Files are not publicly readable by default
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
      fileSizeLimit: 5242880, // 5MB in bytes
    })

    if (createError) {
      console.log(`❌ Failed to create bucket:`, createError.message)
      console.log(`💡 Please create the '${DOCUMENTS_BUCKET}' bucket manually in your Supabase dashboard`)
    } else {
      console.log(`✅ Storage bucket '${DOCUMENTS_BUCKET}' created successfully`)
    }
  } catch (error) {
    console.log(`ℹ️ Storage initialization error:`, error)
  }
}

// Get file metadata
export const getFileMetadata = async (path: string): Promise<any> => {
  const { data, error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .list(path.split('/').slice(0, -1).join('/'), {
      search: path.split('/').pop()
    })

  if (error) {
    throw error
  }

  return data?.[0] || null
}