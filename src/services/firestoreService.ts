import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  Timestamp,
  Firestore 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const firestoreService = {
  async saveProduct(productData: any) {
    const path = 'products';
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Authentication required');
      
      const newProductRef = doc(collection(db, path));
      const data = {
        ...productData,
        id: newProductRef.id,
        userId: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      await setDoc(newProductRef, data);
      return data;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async getUserProducts() {
    const path = 'products';
    try {
      const user = auth.currentUser;
      if (!user) return [];
      
      const q = query(collection(db, path), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async saveNiche(nicheData: any) {
    const path = 'niches';
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Authentication required');
      
      const newNicheRef = doc(collection(db, path));
      const data = {
        ...nicheData,
        id: newNicheRef.id,
        userId: user.uid,
        createdAt: Timestamp.now(),
      };
      
      await setDoc(newNicheRef, data);
      return data;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async getSavedNiches() {
    const path = 'niches';
    try {
      const user = auth.currentUser;
      if (!user) return [];
      
      const q = query(collection(db, path), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  }
};
