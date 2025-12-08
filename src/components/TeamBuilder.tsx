import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shuffle, Users, Sparkles, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  const [showGoalkeeperAlert, setShowGoalkeeperAlert] = useState(false);
  const [pendingTeams, setPendingTeams] = useState<{ teamA: Player[], teamB: Player[] } | null>(null);

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

    const goalkeepers = selected.filter(p => p.isGoalkeeper);
    const fieldPlayers = selected.filter(p => !p.isGoalkeeper);

    if (goalkeepers.length === 1) {
      toast.error('Apenas 1 goleiro selecionado. Adicione mais jogadores ou distribua manualmente.');
      return;
    }

    const newTeamA: Player[] = [];
    const newTeamB: Player[] = [];

    // Distribute goalkeepers first
    if (goalkeepers.length >= 2) {
      const sortedGK = [...goalkeepers].sort((a, b) => b.skillLevel - a.skillLevel);
      sortedGK.forEach((gk, index) => {
        if (index % 2 === 0) {
          newTeamA.push(gk);
        } else {
          newTeamB.push(gk);
        }
      });
    }

    // Distribute field players
    const sortedField = [...fieldPlayers].sort((a, b) => b.skillLevel - a.skillLevel);
    let sumA = newTeamA.reduce((sum, p) => sum + p.skillLevel, 0);
    let sumB = newTeamB.reduce((sum, p) => sum + p.skillLevel, 0);

    sortedField.forEach((player) => {
      if (sumA <= sumB) {
        newTeamA.push(player);
        sumA += player.skillLevel;
      } else {
        newTeamB.push(player);
        sumB += player.skillLevel;
      }
    });

    const gkInA = newTeamA.filter(p => p.isGoalkeeper).length;
    const gkInB = newTeamB.filter(p => p.isGoalkeeper).length;

    if (gkInA === 0 || gkInB === 0) {
      setPendingTeams({ teamA: newTeamA, teamB: newTeamB });
      setShowGoalkeeperAlert(true);
    } else {
      setTeamA(newTeamA);
      setTeamB(newTeamB);
    }
  };

  const confirmTeamsWithoutGoalkeeper = () => {
    if (pendingTeams) {
      setTeamA(pendingTeams.teamA);
      setTeamB(pendingTeams.teamB);
      setPendingTeams(null);
    }
    setShowGoalkeeperAlert(false);
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
  const unassignedPlayers = selectedPlayers.filter(
    (p) => !teamA.find(t => t.id === p.id) && !teamB.find(t => t.id === p.id)
  );

  const moveToTeamA = (player: Player) => {
    setTeamA([...teamA, player]);
  };

  const moveToTeamB = (player: Player) => {
    setTeamB([...teamB, player]);
  };

  const removeFromTeamA = (playerId: string) => {
    setTeamA(teamA.filter(p => p.id !== playerId));
  };

  const removeFromTeamB = (playerId: string) => {
    setTeamB(teamB.filter(p => p.id !== playerId));
  };

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

      {unassignedPlayers.length > 0 && (
        <div className="card-elevated p-4">
          <h3 className="font-display text-lg text-primary mb-3">Distribuir Manualmente</h3>
          <div className="space-y-2">
            {unassignedPlayers.map((player) => (
              <div key={player.id} className="flex items-center justify-between p-2 bg-secondary rounded">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{player.name}</span>
                  {player.isGoalkeeper && <Badge variant="outline" className="text-xs">🧤</Badge>}
                  <Badge variant="outline">{player.skillLevel}</Badge>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => moveToTeamA(player)}>
                    <UserPlus className="w-3 h-3 mr-1" /> Time A
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => moveToTeamB(player)}>
                    <UserPlus className="w-3 h-3 mr-1" /> Time B
                  </Button>
                </div>
              </div>
            ))}
          </div>
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
                <div key={player.id} className="flex items-center justify-between p-2 bg-secondary rounded group">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{player.name}</span>
                    {player.isGoalkeeper && <Badge variant="outline" className="text-xs">🧤</Badge>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{player.skillLevel}</Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                      onClick={() => removeFromTeamA(player.id)}
                    >
                      ✕
                    </Button>
                  </div>
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
                <div key={player.id} className="flex items-center justify-between p-2 bg-secondary rounded group">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{player.name}</span>
                    {player.isGoalkeeper && <Badge variant="outline" className="text-xs">🧤</Badge>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{player.skillLevel}</Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                      onClick={() => removeFromTeamB(player.id)}
                    >
                      ✕
                    </Button>
                  </div>
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

      <AlertDialog open={showGoalkeeperAlert} onOpenChange={setShowGoalkeeperAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Atenção: Distribuição de Goleiros</AlertDialogTitle>
            <AlertDialogDescription>
              Um ou ambos os times ficaram sem goleiro. Deseja continuar mesmo assim?
              Você pode ajustar manualmente depois.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingTeams(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmTeamsWithoutGoalkeeper}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TeamBuilder;
