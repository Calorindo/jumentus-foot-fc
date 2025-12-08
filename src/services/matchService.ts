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
    votes: {}
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

export async function voteForPlayer(matchId: string, playerId: string): Promise<void> {
  const voteRef = ref(database, `matches/${matchId}/votes/${playerId}`);
  const snapshot = await get(voteRef);
  const currentVotes = snapshot.exists() ? snapshot.val() : 0;
  
  await set(voteRef, currentVotes + 1);
}
