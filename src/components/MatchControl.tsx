import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Goal, Shield, Trophy, ArrowLeft } from 'lucide-react';
import type { Team, Player } from '@/types/player';

interface MatchControlProps {
  teamA: Team;
  teamB: Team;
  onGoal: (teamName: string, playerId: string) => void;
  onSave: (teamName: string, playerId: string) => void;
  onEndMatch: () => void;
}

const MatchControl = ({ teamA, teamB, onGoal, onSave, onEndMatch }: MatchControlProps) => {
  const [matchGoals, setMatchGoals] = useState<{ teamName: string; playerId: string; playerName: string }[]>([]);
  const [matchSaves, setMatchSaves] = useState<{ teamName: string; playerId: string; playerName: string }[]>([]);

  const handleGoal = (team: Team, player: Player) => {
    onGoal(team.name, player.id);
    setMatchGoals((prev) => [...prev, { teamName: team.name, playerId: player.id, playerName: player.name }]);
  };

  const handleSave = (team: Team, player: Player) => {
    onSave(team.name, player.id);
    setMatchSaves((prev) => [...prev, { teamName: team.name, playerId: player.id, playerName: player.name }]);
  };

  const getPlayerMatchStats = (playerId: string) => {
    const goals = matchGoals.filter((g) => g.playerId === playerId).length;
    const saves = matchSaves.filter((s) => s.playerId === playerId).length;
    return { goals, saves };
  };

  const getMVP = () => {
    const allPlayers = [...teamA.players, ...teamB.players];
    let mvp: Player | null = null;
    let maxPoints = 0;

    allPlayers.forEach((player) => {
      const stats = getPlayerMatchStats(player.id);
      const points = stats.goals * 2 + stats.saves;
      if (points > maxPoints) {
        maxPoints = points;
        mvp = player;
      }
    });

    return mvp;
  };

  const mvp = getMVP();

  const TeamCard = ({ team, isGold = false }: { team: Team; isGold?: boolean }) => (
    <div className={`card-elevated p-4 border-t-4 ${isGold ? 'border-t-gold' : 'border-t-primary'}`}>
      <div className="text-center mb-4">
        <h3 className={`font-display text-2xl ${isGold ? 'text-gold' : 'text-primary'}`}>
          {team.name}
        </h3>
        <div className={`font-display text-6xl mt-2 ${isGold ? 'text-gold' : 'text-primary'}`}>
          {team.score}
        </div>
      </div>

      <div className="space-y-2">
        {team.players.map((player) => {
          const stats = getPlayerMatchStats(player.id);
          return (
            <div
              key={player.id}
              className="flex items-center gap-2 p-2 bg-secondary rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">{player.name}</span>
                  {player.isGoalkeeper && <Shield className="w-3 h-3 text-primary" />}
                  {mvp?.id === player.id && stats.goals + stats.saves > 0 && (
                    <Trophy className="w-4 h-4 text-gold animate-bounce-soft" />
                  )}
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  {stats.goals > 0 && <span>⚽ {stats.goals}</span>}
                  {stats.saves > 0 && <span>🧤 {stats.saves}</span>}
                </div>
              </div>

              <div className="flex gap-1">
                <Button
                  size="sm"
                  onClick={() => handleGoal(team, player)}
                  className="h-8 px-2 bg-primary hover:bg-primary/80"
                >
                  <Goal className="w-4 h-4" />
                </Button>
                {player.isGoalkeeper && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSave(team, player)}
                    className="h-8 px-2"
                  >
                    🧤
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card-elevated p-6 gradient-hero text-primary-foreground text-center">
        <h2 className="font-display text-3xl mb-2">PLACAR AO VIVO</h2>
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <div className="font-display text-5xl">{teamA.score}</div>
            <div className="text-sm opacity-80">{teamA.name}</div>
          </div>
          <div className="font-display text-3xl opacity-50">×</div>
          <div className="text-center">
            <div className="font-display text-5xl">{teamB.score}</div>
            <div className="text-sm opacity-80">{teamB.name}</div>
          </div>
        </div>

        {mvp && matchGoals.length + matchSaves.length > 0 && (
          <div className="mt-4 pt-4 border-t border-primary-foreground/20">
            <Badge className="bg-gold text-foreground animate-pulse-gold">
              <Trophy className="w-4 h-4 mr-1" />
              MVP: {mvp.name}
            </Badge>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <TeamCard team={teamA} />
        <TeamCard team={teamB} isGold />
      </div>

      <Button
        onClick={onEndMatch}
        variant="outline"
        className="w-full py-6 text-lg border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Encerrar Partida
      </Button>
    </div>
  );
};

export default MatchControl;
