import { update, ref } from 'firebase/database';
import { database } from '@/lib/firebase';

export async function reactivatePlayer(playerId: string) {
  const now = Date.now();
  await update(ref(database, `players/${playerId}`), {
    active: true,
    updated_at: now
  });
}
