import { ref, set, update, push } from "firebase/database";
import { database } from "@/lib/firebase";

export interface Match {
  id: string;
  team_a_name: string;
  team_b_name: string;
  team_a_score: number;
  team_b_score: number;
  is_active: boolean;
  started_at: number | null;
  ended_at: number | null;
  created_at: number;
}

export async function createMatch(teamA: string, teamB: string) {
  const newMatchRef = push(ref(database, 'matches'));
  const id = newMatchRef.key!;
  const now = Date.now();

  await set(newMatchRef, {
    id,
    team_a_name: teamA,
    team_b_name: teamB,
    team_a_score: 0,
    team_b_score: 0,
    is_active: true,
    started_at: null,
    ended_at: null,
    created_at: now
  });

  return id;
}

export async function addPlayerToMatch(matchId: string, playerId: string, teamName: string) {
  await set(ref(database, `matches/${matchId}/players/${playerId}`), {
    team_name: teamName
  });
}

export async function addMatchEvent(
  matchId: string,
  playerId: string,
  eventType: "goal" | "save",
  teamName: string
) {
  const eventsRef = ref(database, `matches/${matchId}/events`);
  const newEvent = push(eventsRef);

  await set(newEvent, {
    event_id: newEvent.key,
    player_id: playerId,
    event_type: eventType,
    team_name: teamName,
    created_at: Date.now()
  });
}

export async function updateScore(matchId: string, team: "A" | "B") {
  const path =
    team === "A"
      ? `matches/${matchId}/team_a_score`
      : `matches/${matchId}/team_b_score`;

  await update(ref(database, `matches/${matchId}`), {
    [team === "A" ? "team_a_score" : "team_b_score"]: null
  });
}


