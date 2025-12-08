import type { Player } from '@/types/player';

interface FirebasePlayer {
  id: string;
  name: string;
  skill_level: number;
  goals: number;
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
    saves: data.saves,
    isGoalkeeper: data.is_goalkeeper,
    active: data.active ?? true,
  };
}
