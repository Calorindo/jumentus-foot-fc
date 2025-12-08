export interface Player {
  id: string;
  name: string;
  skillLevel: number;
  goals: number;
  saves: number;
  isGoalkeeper: boolean;
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
