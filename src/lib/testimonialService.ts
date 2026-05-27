import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot,
  orderBy,
  query
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Testimonial } from '../types';

const TEST_COLLECTION = 'testimonials';

export async function createFirestoreTestimonial(t: Testimonial): Promise<void> {
  const path = `${TEST_COLLECTION}/${t.id}`;
  try {
    const docRef = doc(db, TEST_COLLECTION, t.id);
    await setDoc(docRef, t);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeToTestimonials(onUpdate: (testimonials: Testimonial[]) => void) {
  const collectionRef = collection(db, TEST_COLLECTION);
  const q = query(collectionRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: Testimonial[] = [];
      snapshot.forEach((snap) => {
        list.push(snap.data() as Testimonial);
      });
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, TEST_COLLECTION);
    }
  );
}
