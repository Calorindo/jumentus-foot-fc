import { ref, set, push, get } from "firebase/database";
import { database } from "@/lib/firebase";
import type { Player } from "@/types/player";

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
  votes: Record<string, number>; // playerId -> vote count
  userVotes: Record<string, string>; // userId -> playerId voted for
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
    votes: {},
    userVotes: {}
  });

  return matchId;
}

export async function getMatch(matchId: string): Promise<MatchData | null> {
  const matchRef = ref(database, `matches/${matchId}`);
  const snapshot = await get(matchRef);
  
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return null;
}

export async function getRecentMatches(): Promise<MatchData[]> {
  const matchesRef = ref(database, 'matches');
  const snapshot = await get(matchesRef);
  
  if (snapshot.exists()) {
    const matches = Object.values(snapshot.val()) as MatchData[];
    return matches.sort((a, b) => b.endedAt - a.endedAt).slice(0, 10);
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
