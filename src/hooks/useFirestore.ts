import { useState, useEffect } from 'react';
import { DocumentData } from 'firebase/firestore';
import {
  getDocument,
  getCollection,
  queryCollection,
  subscribeToDocument,
  subscribeToCollection,
  createDocument,
  updateDocument,
  deleteDocument,
} from '../lib/firestore';

export const useDocument = (collectionName: string, docId: string) => {
  const [data, setData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!docId) {
      setData(null);
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToDocument(collectionName, docId, (docData) => {
      setData(docData);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, [collectionName, docId]);

  return { data, loading, error };
};

export const useCollection = (collectionName: string, options = {}) => {
  const [data, setData] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToCollection(
      collectionName,
      (collectionData) => {
        setData(collectionData);
        setLoading(false);
        setError(null);
      },
      options
    );

    return () => unsubscribe();
  }, [collectionName, JSON.stringify(options)]);

  return { data, loading, error };
};

export const useFirestoreOperations = (collectionName: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = async (data: DocumentData) => {
    setLoading(true);
    setError(null);
    try {
      const docRef = await createDocument(collectionName, data);
      setLoading(false);
      return docRef;
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      throw err;
    }
  };

  const update = async (docId: string, data: Partial<DocumentData>) => {
    setLoading(true);
    setError(null);
    try {
      await updateDocument(collectionName, docId, data);
      setLoading(false);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      throw err;
    }
  };

  const remove = async (docId: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteDocument(collectionName, docId);
      setLoading(false);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      throw err;
    }
  };

  const get = async (docId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDocument(collectionName, docId);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      throw err;
    }
  };

  const getAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCollection(collectionName);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      throw err;
    }
  };

  const query = async (options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await queryCollection(collectionName, options);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      throw err;
    }
  };

  return {
    create,
    update,
    remove,
    get,
    getAll,
    query,
    loading,
    error,
  };
};