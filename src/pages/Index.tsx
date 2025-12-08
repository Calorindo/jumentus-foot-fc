import { useState, useCallback } from 'react';
import { useFirebaseData } from '@/hooks/useFirebase';
import { createPlayer, updatePlayerStats, deletePlayer as deletePlayerFromDB, incrementPlayerGoal } from '@/services/addPlayer';
import { reactivatePlayer } from '@/services/reactivatePlayer';
import { mapFirebaseToPlayer } from '@/utils/playerMapper';
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
  const { data: playersData } = useFirebaseData<Record<string, any>>('players');
  const allPlayers = playersData ? Object.values(playersData).map(mapFirebaseToPlayer) : [];
  const activePlayers = allPlayers.filter(p => p.active !== false);
  const [activeTab, setActiveTab] = useState('players');
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [currentMatch, setCurrentMatch] = useState<{ teamA: Team; teamB: Team } | null>(null);

  const addPlayer = useCallback(
    async (playerData: Omit<Player, 'id' | 'goals' | 'saves'>) => {
      try {
        await createPlayer(playerData.name, playerData.skillLevel, playerData.isGoalkeeper);
        toast.success(`${playerData.name} adicionado!`);
      } catch (error) {
        toast.error('Erro ao adicionar jogador');
      }
    },
    []
  );

  const updatePlayer = useCallback(
    async (player: Player) => {
      try {
        await updatePlayerStats(player.id, {
          name: player.name,
          skill_level: player.skillLevel,
          is_goalkeeper: player.isGoalkeeper,
          active: player.active
        });
        setEditingPlayer(null);
        toast.success(`${player.name} atualizado!`);
      } catch (error) {
        toast.error('Erro ao atualizar jogador');
      }
    },
    []
  );

  const deletePlayer = useCallback(
    async (id: string) => {
      try {
        const player = allPlayers.find((p) => p.id === id);
        await deletePlayerFromDB(id);
        toast.success(`${player?.name} desativado!`);
      } catch (error) {
        toast.error('Erro ao desativar jogador');
      }
    },
    [allPlayers]
  );

  const handleReactivatePlayer = useCallback(
    async (id: string) => {
      try {
        const player = allPlayers.find((p) => p.id === id);
        await reactivatePlayer(id);
        toast.success(`${player?.name} reativado!`);
      } catch (error) {
        toast.error('Erro ao reativar jogador');
      }
    },
    [allPlayers]
  );

  const handleTeamsCreated = useCallback((teamA: Team, teamB: Team) => {
    setCurrentMatch({ teamA, teamB });
    setActiveTab('match');
    toast.success('Partida iniciada! Boa pelada! ⚽');
  }, []);

  const handleGoal = useCallback(
    async (teamName: string, playerId: string) => {
      if (!currentMatch) return;

      const player = allPlayers.find((p) => p.id === playerId);
      if (player) {
        await incrementPlayerGoal(playerId, player.goals + 1);
      }

      setCurrentMatch((prev) => {
        if (!prev) return null;
        if (teamName === prev.teamA.name) {
          return { ...prev, teamA: { ...prev.teamA, score: prev.teamA.score + 1 } };
        }
        return { ...prev, teamB: { ...prev.teamB, score: prev.teamB.score + 1 } };
      });

      toast.success(`⚽ GOL! ${player?.name}`);
    },
    [currentMatch, allPlayers]
  );

  const handleSave = useCallback(
    async (teamName: string, playerId: string) => {
      const player = allPlayers.find((p) => p.id === playerId);
      if (player) {
        await updatePlayerStats(playerId, { saves: player.saves + 1 });
      }

      toast.success(`🧤 Defesa! ${player?.name}`);
    },
    [allPlayers]
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
                Jogadores Cadastrados ({allPlayers.length})
              </h2>
              <PlayerList
                players={allPlayers}
                onEdit={setEditingPlayer}
                onDelete={deletePlayer}
                onReactivate={handleReactivatePlayer}
              />
            </div>
          </div>
        )}

        {activeTab === 'teams' && (
          <TeamBuilder players={activePlayers} onTeamsCreated={handleTeamsCreated} />
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

        {activeTab === 'stats' && <Statistics players={activePlayers} />}
      </main>
    </div>
  );
};

export default Index;
