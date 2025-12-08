import { ref, set, update, push } from "firebase/database";
import { database } from "@/lib/firebase";

export interface Player {
  id: string;
  name: string;
  skill_level: number;
  goals: number;
  saves: number;
  is_goalkeeper: boolean;
  created_at: number;
  updated_at: number;
  active: boolean;
}

export async function createPlayer(name: string, skill: number, is_goalkeeper = false) {
  const newPlayerRef = push(ref(database, 'players'));
  const id = newPlayerRef.key!;
  const now = Date.now();

  await set(newPlayerRef, {
    id,
    name: name.trim(),
    skill_level: skill,
    goals: 0,
    saves: 0,
    is_goalkeeper: is_goalkeeper,
    created_at: now,
    updated_at: now,
    active: true
  });

  return id;
}

export async function incrementPlayerGoal(playerId: string, goalsUpdated: number) {
  const now = Date.now();

  await update(ref(database, `players/${playerId}`), {
    goals: goalsUpdated,
    updated_at: now
  });
}

export async function updatePlayerStats(playerId: string, stats: Partial<Player>) {
  const now = Date.now();
  await update(ref(database, `players/${playerId}`), {
    ...stats,
    updated_at: now
  });
}

export async function deletePlayer(playerId: string) {
  const now = Date.now();
  await update(ref(database, `players/${playerId}`), {
    active: false,
    updated_at: now
  });
}
