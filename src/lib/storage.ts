import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
  updateMetadata,
  UploadResult,
  UploadTask,
  UploadTaskSnapshot,
  StorageReference,
  FullMetadata,
} from 'firebase/storage';
import { storage } from './firebase';

export const uploadFile = async (
  path: string,
  file: File | Blob,
  metadata?: Record<string, any>
): Promise<UploadResult> => {
  const storageRef = ref(storage, path);
  return await uploadBytes(storageRef, file, metadata);
};

export const uploadFileResumable = (
  path: string,
  file: File | Blob,
  metadata?: Record<string, any>
): UploadTask => {
  const storageRef = ref(storage, path);
  return uploadBytesResumable(storageRef, file, metadata);
};

export const getFileDownloadURL = async (path: string): Promise<string> => {
  const storageRef = ref(storage, path);
  return await getDownloadURL(storageRef);
};

export const deleteFile = async (path: string): Promise<void> => {
  const storageRef = ref(storage, path);
  return await deleteObject(storageRef);
};

export const listFiles = async (path: string): Promise<StorageReference[]> => {
  const storageRef = ref(storage, path);
  const result = await listAll(storageRef);
  return result.items;
};

export const getFileMetadata = async (path: string): Promise<FullMetadata> => {
  const storageRef = ref(storage, path);
  return await getMetadata(storageRef);
};

export const updateFileMetadata = async (
  path: string,
  metadata: Record<string, any>
): Promise<FullMetadata> => {
  const storageRef = ref(storage, path);
  return await updateMetadata(storageRef, metadata);
};

export const uploadFileWithProgress = (
  path: string,
  file: File | Blob,
  onProgress?: (progress: number) => void,
  onError?: (error: Error) => void,
  onSuccess?: (downloadURL: string) => void,
  metadata?: Record<string, any>
): UploadTask => {
  const uploadTask = uploadFileResumable(path, file, metadata);
  
  uploadTask.on(
    'state_changed',
    (snapshot: UploadTaskSnapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      onProgress?.(progress);
    },
    (error) => {
      onError?.(error);
    },
    async () => {
      try {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        onSuccess?.(downloadURL);
      } catch (error) {
        onError?.(error as Error);
      }
    }
  );
  
  return uploadTask;
};