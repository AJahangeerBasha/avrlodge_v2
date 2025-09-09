import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot,
  CollectionReference,
  DocumentReference,
  Query,
  WhereFilterOp,
  OrderByDirection,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';

export const createDocument = async (collectionName: string, data: DocumentData): Promise<DocumentReference> => {
  return await addDoc(collection(db, collectionName), data);
};

export const setDocument = async (collectionName: string, docId: string, data: DocumentData): Promise<void> => {
  try {
    console.log(`Setting document: ${collectionName}/${docId}`, data);
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, data);
    console.log(`Document set successfully: ${collectionName}/${docId}`);
  } catch (error) {
    console.error(`Error setting document ${collectionName}/${docId}:`, error);
    throw error;
  }
};

export const getDocument = async (collectionName: string, docId: string): Promise<DocumentData | null> => {
  try {
    console.log(`Fetching document: ${collectionName}/${docId}`);
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log(`Document found: ${collectionName}/${docId}`);
      return { id: docSnap.id, ...docSnap.data() };
    }
    console.log(`Document not found: ${collectionName}/${docId}`);
    return null;
  } catch (error) {
    console.error(`Error fetching document ${collectionName}/${docId}:`, error);
    throw error;
  }
};

export const updateDocument = async (collectionName: string, docId: string, data: Partial<DocumentData>): Promise<void> => {
  const docRef = doc(db, collectionName, docId);
  return await updateDoc(docRef, data);
};

export const deleteDocument = async (collectionName: string, docId: string): Promise<void> => {
  const docRef = doc(db, collectionName, docId);
  return await deleteDoc(docRef);
};

export const getCollection = async (collectionName: string): Promise<DocumentData[]> => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

interface QueryOptions {
  where?: {
    field: string;
    operator: WhereFilterOp;
    value: any;
  }[];
  orderBy?: {
    field: string;
    direction?: OrderByDirection;
  }[];
  limit?: number;
  startAfter?: QueryDocumentSnapshot<DocumentData>;
}

export const queryCollection = async (collectionName: string, options: QueryOptions = {}): Promise<DocumentData[]> => {
  let q: Query<DocumentData> = collection(db, collectionName);
  
  if (options.where) {
    options.where.forEach(condition => {
      q = query(q, where(condition.field, condition.operator, condition.value));
    });
  }
  
  if (options.orderBy) {
    options.orderBy.forEach(order => {
      q = query(q, orderBy(order.field, order.direction || 'asc'));
    });
  }
  
  if (options.limit) {
    q = query(q, limit(options.limit));
  }
  
  if (options.startAfter) {
    q = query(q, startAfter(options.startAfter));
  }
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const subscribeToDocument = (
  collectionName: string,
  docId: string,
  callback: (data: DocumentData | null) => void
): Unsubscribe => {
  const docRef = doc(db, collectionName, docId);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() });
    } else {
      callback(null);
    }
  });
};

export const subscribeToCollection = (
  collectionName: string,
  callback: (data: DocumentData[]) => void,
  options: QueryOptions = {}
): Unsubscribe => {
  let q: Query<DocumentData> = collection(db, collectionName);
  
  if (options.where) {
    options.where.forEach(condition => {
      q = query(q, where(condition.field, condition.operator, condition.value));
    });
  }
  
  if (options.orderBy) {
    options.orderBy.forEach(order => {
      q = query(q, orderBy(order.field, order.direction || 'asc'));
    });
  }
  
  if (options.limit) {
    q = query(q, limit(options.limit));
  }
  
  return onSnapshot(q, (querySnapshot) => {
    const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(docs);
  });
};