export type PlayerPosition = 'Goleiro' | 'Zagueiro' | 'Meio Campo' | 'Atacante';
export type PreferredFoot = 'Direito' | 'Esquerdo' | 'Ambidestro';

export interface Player {
  id: string;
  name: string;
  skillLevel: number;
  goals: number;
  assists: number;
  saves: number;
  isGoalkeeper: boolean;
  position: PlayerPosition;
  weight?: number;
  height?: number;
  preferredFoot?: PreferredFoot;
  active: boolean;
}

export interface Team {
  name: string;
  players: Player[];
  score: number;
}

export interface Match {
  id: string;
  teamA: Team;
  teamB: Team;
  isActive: boolean;
  startedAt: Date | null;
}
