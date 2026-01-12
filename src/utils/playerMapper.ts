import type { Player } from '@/types/player';

interface FirebasePlayer {
  id: string;
  name: string;
  skill_level: number;
  goals: number;
  assists: number;
  saves: number;
  mvp_count?: number;
  is_goalkeeper: boolean;
  position: string;
  weight?: number;
  height?: number;
  preferred_foot?: string;
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
    mvpCount: data.mvp_count ?? 0,
    isGoalkeeper: data.is_goalkeeper,
    position: (data.position ?? 'Atacante') as any,
    weight: data.weight,
    height: data.height,
    preferredFoot: data.preferred_foot as any,
    active: data.active ?? true,
  };
}
