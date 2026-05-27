import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc,
  getDoc,
  query, 
  where, 
  onSnapshot,
  orderBy
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Order, OrderStatus } from '../types';

const ORDERS_COLLECTION = 'orders';

/**
 * Creates a new order in Firestore.
 */
export async function createFirestoreOrder(order: Order): Promise<void> {
  const path = `${ORDERS_COLLECTION}/${order.id}`;
  try {
    const docRef = doc(db, ORDERS_COLLECTION, order.id);
    await setDoc(docRef, order);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Subscribes to all orders in real-time (for Admin View).
 */
export function subscribeToAllOrders(onUpdate: (orders: Order[]) => void, onError?: (err: any) => void) {
  const collectionRef = collection(db, ORDERS_COLLECTION);
  const q = query(collectionRef, orderBy('createdAt', 'desc'));
  
  return onSnapshot(
    q, 
    (snapshot) => {
      const orders: Order[] = [];
      snapshot.forEach((docSnap) => {
        orders.push(docSnap.data() as Order);
      });
      onUpdate(orders);
    }, 
    (error) => {
      console.error("subscribeToAllOrders snapshot error:", error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, ORDERS_COLLECTION);
    }
  );
}

/**
 * Subscribes to a signed-in client's orders in real-time.
 */
export function subscribeToUserOrders(email: string, onUpdate: (orders: Order[]) => void) {
  const collectionRef = collection(db, ORDERS_COLLECTION);
  const q = query(collectionRef, where('customerEmail', '==', email), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const orders: Order[] = [];
      snapshot.forEach((docSnap) => {
        orders.push(docSnap.data() as Order);
      });
      onUpdate(orders);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, ORDERS_COLLECTION);
    }
  );
}

/**
 * Listens to a single order in real-time using its specific tracking code.
 * (Allows guest trackers to get zero-delay status updates).
 */
export function subscribeToSingleOrder(orderId: string, onUpdate: (order: Order | null) => void) {
  const docRef = doc(db, ORDERS_COLLECTION, orderId);

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as Order);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `${ORDERS_COLLECTION}/${orderId}`);
    }
  );
}

/**
 * Updates an existing order in Firestore (Admin or Client revision).
 */
export async function updateFirestoreOrder(order: Order): Promise<void> {
  const path = `${ORDERS_COLLECTION}/${order.id}`;
  try {
    const docRef = doc(db, ORDERS_COLLECTION, order.id);
    await setDoc(docRef, order, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
