import { ref, set, update, push } from "firebase/database";
import { database } from "@/lib/firebase";

export interface Player {
  id: string;
  name: string;
  skill_level: number;
  goals: number;
  assists: number;
  saves: number;
  is_goalkeeper: boolean;
  position: string;
  weight?: number;
  height?: number;
  preferred_foot?: string;
  created_at: number;
  updated_at: number;
  active: boolean;
}

export async function createPlayer(
  name: string, 
  skill: number, 
  is_goalkeeper = false, 
  position = 'Atacante',
  weight?: number,
  height?: number,
  preferred_foot?: string
) {
  const newPlayerRef = push(ref(database, 'players'));
  const id = newPlayerRef.key!;
  const now = Date.now();

  const playerData: Partial<Player> & {
    id: string;
    name: string;
    skill_level: number;
    goals: number;
    assists: number;
    saves: number;
    is_goalkeeper: boolean;
    position: string;
    created_at: number;
    updated_at: number;
    active: boolean;
  } = {
    id,
    name: name.trim(),
    skill_level: skill,
    goals: 0,
    assists: 0,
    saves: 0,
    is_goalkeeper: is_goalkeeper,
    position: position,
    created_at: now,
    updated_at: now,
    active: true
  };

  // Apenas adiciona campos opcionais se eles tiverem valores
  if (weight !== undefined && weight !== null) {
    playerData.weight = weight;
  }
  if (height !== undefined && height !== null) {
    playerData.height = height;
  }
  if (preferred_foot !== undefined && preferred_foot !== null) {
    playerData.preferred_foot = preferred_foot;
  }

  await set(newPlayerRef, playerData);

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