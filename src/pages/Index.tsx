import { useState, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import PlayerForm from '@/components/PlayerForm';
import PlayerList from '@/components/PlayerList';
import TeamBuilder from '@/components/TeamBuilder';
import MatchControl from '@/components/MatchControl';
import Statistics from '@/components/Statistics';
import { toast } from 'sonner';
import type { Player, Team } from '@/types/player';

const Index = () => {
  const [players, setPlayers] = useLocalStorage<Player[]>('pelada-players', []);
  const [activeTab, setActiveTab] = useState('players');
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [currentMatch, setCurrentMatch] = useState<{ teamA: Team; teamB: Team } | null>(null);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const addPlayer = useCallback(
    (playerData: Omit<Player, 'id' | 'goals' | 'saves'>) => {
      const newPlayer: Player = {
        ...playerData,
        id: generateId(),
        goals: 0,
        saves: 0,
      };
      setPlayers((prev) => [...prev, newPlayer]);
      toast.success(`${playerData.name} adicionado!`);
    },
    [setPlayers]
  );

  const updatePlayer = useCallback(
    (player: Player) => {
      setPlayers((prev) => prev.map((p) => (p.id === player.id ? player : p)));
      setEditingPlayer(null);
      toast.success(`${player.name} atualizado!`);
    },
    [setPlayers]
  );

  const deletePlayer = useCallback(
    (id: string) => {
      const player = players.find((p) => p.id === id);
      setPlayers((prev) => prev.filter((p) => p.id !== id));
      toast.success(`${player?.name} removido!`);
    },
    [players, setPlayers]
  );

  const handleTeamsCreated = useCallback((teamA: Team, teamB: Team) => {
    setCurrentMatch({ teamA, teamB });
    setActiveTab('match');
    toast.success('Partida iniciada! Boa pelada! ⚽');
  }, []);

  const handleGoal = useCallback(
    (teamName: string, playerId: string) => {
      if (!currentMatch) return;

      setPlayers((prev) =>
        prev.map((p) => (p.id === playerId ? { ...p, goals: p.goals + 1 } : p))
      );

      setCurrentMatch((prev) => {
        if (!prev) return null;
        if (teamName === prev.teamA.name) {
          return { ...prev, teamA: { ...prev.teamA, score: prev.teamA.score + 1 } };
        }
        return { ...prev, teamB: { ...prev.teamB, score: prev.teamB.score + 1 } };
      });

      const player = players.find((p) => p.id === playerId);
      toast.success(`⚽ GOL! ${player?.name}`);
    },
    [currentMatch, players, setPlayers]
  );

  const handleSave = useCallback(
    (teamName: string, playerId: string) => {
      setPlayers((prev) =>
        prev.map((p) => (p.id === playerId ? { ...p, saves: p.saves + 1 } : p))
      );

      const player = players.find((p) => p.id === playerId);
      toast.success(`🧤 Defesa! ${player?.name}`);
    },
    [players, setPlayers]
  );

  const handleEndMatch = useCallback(() => {
    if (currentMatch) {
      const winner =
        currentMatch.teamA.score > currentMatch.teamB.score
          ? currentMatch.teamA.name
          : currentMatch.teamB.score > currentMatch.teamA.score
          ? currentMatch.teamB.name
          : 'Empate';
      
      toast.success(
        winner === 'Empate'
          ? 'Partida encerrada! Foi empate!'
          : `Partida encerrada! ${winner} venceu!`
      );
    }
    setCurrentMatch(null);
    setActiveTab('stats');
  }, [currentMatch]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        matchActive={!!currentMatch}
      />

      <main className="container mx-auto py-6 px-4">
        {activeTab === 'players' && (
          <div className="grid md:grid-cols-[350px_1fr] gap-6">
            <PlayerForm
              onAddPlayer={addPlayer}
              editingPlayer={editingPlayer}
              onUpdatePlayer={updatePlayer}
              onCancelEdit={() => setEditingPlayer(null)}
            />
            <div>
              <h2 className="font-display text-2xl text-primary mb-4">
                Jogadores Cadastrados ({players.length})
              </h2>
              <PlayerList
                players={players}
                onEdit={setEditingPlayer}
                onDelete={deletePlayer}
              />
            </div>
          </div>
        )}

        {activeTab === 'teams' && (
          <TeamBuilder players={players} onTeamsCreated={handleTeamsCreated} />
        )}

        {activeTab === 'match' && currentMatch && (
          <MatchControl
            teamA={currentMatch.teamA}
            teamB={currentMatch.teamB}
            onGoal={handleGoal}
            onSave={handleSave}
            onEndMatch={handleEndMatch}
          />
        )}

        {activeTab === 'stats' && <Statistics players={players} />}
      </main>
    </div>
  );
};

export default Index;
