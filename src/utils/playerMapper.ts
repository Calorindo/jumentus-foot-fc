import type { Player } from '@/types/player';

interface FirebasePlayer {
  id: string;
  name: string;
  skill_level: number;
  goals: number;
  assists: number;
  saves: number;
  is_goalkeeper: boolean;
  active: boolean;
}

export function mapFirebaseToPlayer(data: FirebasePlayer): Player {
  return {
    id: data.id,
    name: data.name,
    skillLevel: data.skill_level,
    goals: data.goals,
    assists: data.assists ?? 0,
    saves: data.saves,
    isGoalkeeper: data.is_goalkeeper,
    active: data.active ?? true,
  };
}
