import { ref, get, update } from "firebase/database";
import { database } from "@/lib/firebase";

export interface User {
  uid: string;
  email: string;
  isAdmin: boolean;
  trusted: boolean;
  active?: boolean;
  createdAt: number;
}

export async function getPendingUsers(): Promise<User[]> {
  const usersRef = ref(database, 'users');
  const snapshot = await get(usersRef);
  
  if (snapshot.exists()) {
    const users = Object.values(snapshot.val()) as User[];
    return users.filter(user => !user.trusted);
  }
  return [];
}

export async function approveUser(uid: string): Promise<void> {
  await update(ref(database, `users/${uid}`), {
    trusted: true
  });
}

export async function updateUser(uid: string, updates: Partial<User>): Promise<void> {
  await update(ref(database, `users/${uid}`), updates);
}

export async function getAllUsers(): Promise<User[]> {
  const usersRef = ref(database, 'users');
  const snapshot = await get(usersRef);
  
  if (snapshot.exists()) {
    return Object.values(snapshot.val()) as User[];
  }
  return [];
}