import { ref, set, push, get, update } from "firebase/database";
import { database } from "@/lib/firebase";
import type { Player } from "@/types/player";
import { updatePlayerStats } from "./addPlayer";

export interface MatchData {
  id: string;
  teamA: {
    name: string;
    score: number;
    playerIds: string[];
  };
  teamB: {
    name: string;
    score: number;
    playerIds: string[];
  };
  startedAt: number;
  endedAt: number;
  isActive: boolean;
  votes: Record<string, number>; // playerId -> vote count
  userVotes: Record<string, string>; // userId -> playerId voted for
  votingFinalized?: boolean;
  mvpWinner?: string;
}

export async function saveMatch(
  teamAName: string,
  teamAScore: number,
  teamAPlayers: Player[],
  teamBName: string,
  teamBScore: number,
  teamBPlayers: Player[]
): Promise<string> {
  const newMatchRef = push(ref(database, 'matches'));
  const matchId = newMatchRef.key!;
  const now = Date.now();

  await set(newMatchRef, {
    id: matchId,
    teamA: {
      name: teamAName,
      score: teamAScore,
      playerIds: teamAPlayers.map(p => p.id)
    },
    teamB: {
      name: teamBName,
      score: teamBScore,
      playerIds: teamBPlayers.map(p => p.id)
    },
    startedAt: now,
    endedAt: now,
    isActive: false,
    votes: {},
    userVotes: {}
  });

  return matchId;
}

let isCreatingMatch = false;

export async function createActiveMatch(
  teamAName: string,
  teamAPlayers: Player[],
  teamBName: string,
  teamBPlayers: Player[]
): Promise<string> {
  if (isCreatingMatch) {
    throw new Error('Já existe uma partida sendo criada');
  }
  
  isCreatingMatch = true;
  
  try {
    // Verificar se já existe uma partida ativa
    const existingMatch = await getActiveMatch();
    if (existingMatch) {
      throw new Error('Já existe uma partida ativa');
    }
    
    const newMatchRef = push(ref(database, 'matches'));
    const matchId = newMatchRef.key!;
    const now = Date.now();

    await set(newMatchRef, {
      id: matchId,
      teamA: {
        name: teamAName,
        score: 0,
        playerIds: teamAPlayers.map(p => p.id)
      },
      teamB: {
        name: teamBName,
        score: 0,
        playerIds: teamBPlayers.map(p => p.id)
      },
      startedAt: now,
      endedAt: 0,
      isActive: true,
      votes: {},
      userVotes: {}
    });

    return matchId;
  } finally {
    isCreatingMatch = false;
  }
}

export async function getMatch(matchId: string): Promise<MatchData | null> {
  const matchRef = ref(database, `matches/${matchId}`);
  const snapshot = await get(matchRef);
  
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return null;
}

export async function getActiveMatch(): Promise<MatchData | null> {
  const matchesRef = ref(database, 'matches');
  const snapshot = await get(matchesRef);
  
  if (snapshot.exists()) {
    const matches = Object.values(snapshot.val()) as MatchData[];
    return matches.find(match => match.isActive) || null;
  }
  return null;
}

export async function updateMatchScore(matchId: string, teamAScore: number, teamBScore: number): Promise<void> {
  await update(ref(database, `matches/${matchId}`), {
    'teamA/score': teamAScore,
    'teamB/score': teamBScore
  });
}

export async function endMatch(matchId: string, teamAScore: number, teamBScore: number): Promise<void> {
  await update(ref(database, `matches/${matchId}`), {
    'teamA/score': teamAScore,
    'teamB/score': teamBScore,
    endedAt: Date.now(),
    isActive: false
  });
}

export async function getRecentMatches(): Promise<MatchData[]> {
  const matchesRef = ref(database, 'matches');
  const snapshot = await get(matchesRef);
  
  if (snapshot.exists()) {
    const matches = Object.values(snapshot.val()) as MatchData[];
    return matches.filter(m => !m.isActive).sort((a, b) => b.endedAt - a.endedAt).slice(0, 10);
  }
  return [];
}

export function canVote(match: MatchData): boolean {
  const twoHoursInMs = 2 * 60 * 60 * 1000;
  const now = Date.now();
  return (now - match.endedAt) < twoHoursInMs;
}

export async function voteForPlayer(matchId: string, playerId: string, userId: string): Promise<void> {
  // Check if user already voted
  const userVoteRef = ref(database, `matches/${matchId}/userVotes/${userId}`);
  const userVoteSnapshot = await get(userVoteRef);
  
  if (userVoteSnapshot.exists()) {
    throw new Error('User already voted');
  }
  
  // Register vote
  const voteRef = ref(database, `matches/${matchId}/votes/${playerId}`);
  const snapshot = await get(voteRef);
  const currentVotes = snapshot.exists() ? snapshot.val() : 0;
  
  await set(voteRef, currentVotes + 1);
  await set(userVoteRef, playerId);
}

export async function hasUserVoted(matchId: string, userId: string): Promise<boolean> {
  const userVoteRef = ref(database, `matches/${matchId}/userVotes/${userId}`);
  const snapshot = await get(userVoteRef);
  return snapshot.exists();
}
export async function finalizeVoting(matchId: string): Promise<string | null> {
  const match = await getMatch(matchId);
  if (!match || !match.votes) return null;
  
  // Encontrar o jogador com mais votos
  let maxVotes = 0;
  let winnerId: string | null = null;
  
  Object.entries(match.votes).forEach(([playerId, votes]) => {
    if (votes > maxVotes) {
      maxVotes = votes;
      winnerId = playerId;
    }
  });
  
  if (winnerId && maxVotes > 0) {
    // Incrementar mvpCount do vencedor
    const playerRef = ref(database, `players/${winnerId}`);
    const playerSnapshot = await get(playerRef);
    
    if (playerSnapshot.exists()) {
      const currentMvpCount = playerSnapshot.val().mvp_count || 0;
      await update(playerRef, {
        mvp_count: currentMvpCount + 1,
        updated_at: Date.now()
      });
    }
    
    // Marcar votação como finalizada
    await update(ref(database, `matches/${matchId}`), {
      votingFinalized: true,
      mvpWinner: winnerId
    });
    
    return winnerId;
  }
  
  return null;
}