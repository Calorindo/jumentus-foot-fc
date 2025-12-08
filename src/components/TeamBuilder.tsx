import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shuffle, Users, Sparkles } from 'lucide-react';
import PlayerList from './PlayerList';
import type { Player, Team } from '@/types/player';

interface TeamBuilderProps {
  players: Player[];
  onTeamsCreated: (teamA: Team, teamB: Team) => void;
}

const TeamBuilder = ({ players, onTeamsCreated }: TeamBuilderProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [teamA, setTeamA] = useState<Player[]>([]);
  const [teamB, setTeamB] = useState<Player[]>([]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const calculateAverage = (team: Player[]) => {
    if (team.length === 0) return 0;
    return (team.reduce((sum, p) => sum + p.skillLevel, 0) / team.length).toFixed(1);
  };

  const balanceTeams = () => {
    const selected = players.filter((p) => selectedIds.includes(p.id));
    if (selected.length < 2) return;

    // Sort by skill level descending
    const sorted = [...selected].sort((a, b) => b.skillLevel - a.skillLevel);
    
    const newTeamA: Player[] = [];
    const newTeamB: Player[] = [];
    let sumA = 0;
    let sumB = 0;

    // Distribute players to balance teams
    sorted.forEach((player) => {
      if (sumA <= sumB) {
        newTeamA.push(player);
        sumA += player.skillLevel;
      } else {
        newTeamB.push(player);
        sumB += player.skillLevel;
      }
    });

    setTeamA(newTeamA);
    setTeamB(newTeamB);
  };

  const shuffleTeams = () => {
    const selected = players.filter((p) => selectedIds.includes(p.id));
    if (selected.length < 2) return;

    const shuffled = [...selected].sort(() => Math.random() - 0.5);
    const mid = Math.ceil(shuffled.length / 2);
    
    setTeamA(shuffled.slice(0, mid));
    setTeamB(shuffled.slice(mid));
  };

  const startMatch = () => {
    if (teamA.length === 0 || teamB.length === 0) return;

    onTeamsCreated(
      { name: 'Time A', players: teamA, score: 0 },
      { name: 'Time B', players: teamB, score: 0 }
    );
  };

  const selectedPlayers = players.filter((p) => selectedIds.includes(p.id));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card-elevated p-6">
        <h2 className="font-display text-2xl text-primary mb-4 flex items-center gap-2">
          <Users className="w-6 h-6" />
          Selecionar Jogadores ({selectedIds.length})
        </h2>
        <PlayerList
          players={players}
          onEdit={() => {}}
          onDelete={() => {}}
          selectable
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
        />
      </div>

      {selectedIds.length >= 2 && (
        <div className="flex gap-2 justify-center">
          <Button onClick={balanceTeams} className="btn-primary">
            <Sparkles className="w-4 h-4 mr-2" />
            Equilibrar Times
          </Button>
          <Button onClick={shuffleTeams} variant="outline">
            <Shuffle className="w-4 h-4 mr-2" />
            Sortear
          </Button>
        </div>
      )}

      {(teamA.length > 0 || teamB.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card-elevated p-4 border-l-4 border-l-primary">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-xl text-primary">Time A</h3>
              <Badge className="bg-primary text-primary-foreground">
                Média: {calculateAverage(teamA)}
              </Badge>
            </div>
            <div className="space-y-2">
              {teamA.map((player) => (
                <div key={player.id} className="flex items-center justify-between p-2 bg-secondary rounded">
                  <span className="font-medium">{player.name}</span>
                  <Badge variant="outline">{player.skillLevel}</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="card-elevated p-4 border-l-4 border-l-gold">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-xl text-gold">Time B</h3>
              <Badge className="bg-gold text-foreground">
                Média: {calculateAverage(teamB)}
              </Badge>
            </div>
            <div className="space-y-2">
              {teamB.map((player) => (
                <div key={player.id} className="flex items-center justify-between p-2 bg-secondary rounded">
                  <span className="font-medium">{player.name}</span>
                  <Badge variant="outline">{player.skillLevel}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {teamA.length > 0 && teamB.length > 0 && (
        <Button onClick={startMatch} className="w-full btn-gold py-6 text-lg font-display animate-pulse-gold">
          ⚽ INICIAR PARTIDA
        </Button>
      )}
    </div>
  );
};

export default TeamBuilder;
