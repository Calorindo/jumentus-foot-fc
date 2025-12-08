import { ref, set, get } from 'firebase/database';
import { database } from '@/lib/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  isAdmin: boolean;
  trusted: boolean;
  createdAt: number;
}

export async function createUserProfile(uid: string, email: string) {
  const userRef = ref(database, `users/${uid}`);
  const snapshot = await get(userRef);
  
  if (!snapshot.exists()) {
    await set(userRef, {
      uid,
      email,
      isAdmin: false,
      trusted: false,
      createdAt: Date.now()
    });
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = ref(database, `users/${uid}`);
  const snapshot = await get(userRef);
  
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return null;
}
