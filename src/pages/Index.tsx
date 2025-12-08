/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { useFirebaseData } from '@/hooks/useFirebase';
import { useAuth } from '@/contexts/AuthContext';
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
  const { isAdmin } = useAuth();
  const { data: playersData } = useFirebaseData<Record<string, any>>('players');
  const allPlayers = playersData ? Object.values(playersData).map(mapFirebaseToPlayer) : [];
  const activePlayers = allPlayers.filter(p => p.active !== false);
  const [activeTab, setActiveTab] = useState('players');
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [currentMatch, setCurrentMatch] = useState<{ teamA: Team; teamB: Team } | null>(null);

  const addPlayer = useCallback(
    async (playerData: Omit<Player, 'id' | 'goals' | 'saves'>) => {
      try {
        await createPlayer(
          playerData.name, 
          playerData.skillLevel, 
          playerData.isGoalkeeper, 
          playerData.position,
          playerData.weight,
          playerData.height,
          playerData.preferredFoot
        );
        toast.success(`${playerData.name} adicionado!`);
      } catch (error) {
        toast.error('Erro ao adicionar jogador');
      }
    },
    []
  );

  const updatePlayer = useCallback(
    async (player: Player) => {
      if (!isAdmin) {
        toast.error('Apenas administradores podem editar jogadores');
        return;
      }
      try {
        await updatePlayerStats(player.id, {
          name: player.name,
          skill_level: player.skillLevel,
          is_goalkeeper: player.isGoalkeeper,
          position: player.position,
          weight: player.weight,
          height: player.height,
          preferred_foot: player.preferredFoot,
          active: player.active,
          goals: player.goals,
          assists: player.assists,
          saves: player.saves
        });
        setEditingPlayer(null);
        toast.success(`${player.name} atualizado!`);
      } catch (error) {
        toast.error('Erro ao atualizar jogador');
      }
    },
    [isAdmin]
  );

  const deletePlayer = useCallback(
    async (id: string) => {
      if (!isAdmin) {
        toast.error('Apenas administradores podem desativar jogadores');
        return;
      }
      try {
        const player = allPlayers.find((p) => p.id === id);
        await deletePlayerFromDB(id);
        toast.success(`${player?.name} desativado!`);
      } catch (error) {
        toast.error('Erro ao desativar jogador');
      }
    },
    [allPlayers, isAdmin]
  );

  const handleReactivatePlayer = useCallback(
    async (id: string) => {
      if (!isAdmin) {
        toast.error('Apenas administradores podem reativar jogadores');
        return;
      }
      try {
        const player = allPlayers.find((p) => p.id === id);
        await reactivatePlayer(id);
        toast.success(`${player?.name} reativado!`);
      } catch (error) {
        toast.error('Erro ao reativar jogador');
      }
    },
    [allPlayers, isAdmin]
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

  const handleAssist = useCallback(
    async (teamName: string, playerId: string) => {
      const player = allPlayers.find((p) => p.id === playerId);
      if (player) {
        await updatePlayerStats(playerId, { assists: player.assists + 1 });
      }

      toast.success(`🎯 Assistência! ${player?.name}`);
    },
    [allPlayers]
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

  const handleAdjustGoals = useCallback(
    async (playerId: string, delta: number) => {
      if (!isAdmin || !currentMatch) return;
      
      const player = allPlayers.find((p) => p.id === playerId);
      if (player) {
        const newGoals = Math.max(0, player.goals + delta);
        await updatePlayerStats(playerId, { goals: newGoals });
        
        // Atualizar placar da partida
        setCurrentMatch((prev) => {
          if (!prev) return null;
          
          const isInTeamA = prev.teamA.players.some(p => p.id === playerId);
          const isInTeamB = prev.teamB.players.some(p => p.id === playerId);
          
          if (isInTeamA) {
            return {
              ...prev,
              teamA: { ...prev.teamA, score: Math.max(0, prev.teamA.score + delta) }
            };
          } else if (isInTeamB) {
            return {
              ...prev,
              teamB: { ...prev.teamB, score: Math.max(0, prev.teamB.score + delta) }
            };
          }
          return prev;
        });
        
        toast.success(`Gols de ${player.name}: ${newGoals}`);
      }
    },
    [allPlayers, isAdmin, currentMatch]
  );

  const handleAdjustAssists = useCallback(
    async (playerId: string, delta: number) => {
      if (!isAdmin) return;
      
      const player = allPlayers.find((p) => p.id === playerId);
      if (player) {
        const newAssists = Math.max(0, player.assists + delta);
        await updatePlayerStats(playerId, { assists: newAssists });
        toast.success(`Assistências de ${player.name}: ${newAssists}`);
      }
    },
    [allPlayers, isAdmin]
  );

  const handleAdjustSaves = useCallback(
    async (playerId: string, delta: number) => {
      if (!isAdmin) return;
      
      const player = allPlayers.find((p) => p.id === playerId);
      if (player) {
        const newSaves = Math.max(0, player.saves + delta);
        await updatePlayerStats(playerId, { saves: newSaves });
        toast.success(`Defesas de ${player.name}: ${newSaves}`);
      }
    },
    [allPlayers, isAdmin]
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

      <main className="container mx-auto py-4 sm:py-6 px-4">
        {activeTab === 'players' && (
          <div className="grid lg:grid-cols-[350px_1fr] gap-4 sm:gap-6">
            <PlayerForm
              onAddPlayer={addPlayer}
              editingPlayer={editingPlayer}
              onUpdatePlayer={updatePlayer}
              onCancelEdit={() => setEditingPlayer(null)}
            />
            <div className="min-w-0">
              <h2 className="font-display text-xl sm:text-2xl text-primary mb-4">
                Jogadores Cadastrados ({allPlayers.length})
              </h2>
              <PlayerList
                players={allPlayers}
                onEdit={setEditingPlayer}
                onDelete={deletePlayer}
                onReactivate={handleReactivatePlayer}
                showActions={isAdmin}
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
            onAssist={handleAssist}
            onSave={handleSave}
            onEndMatch={handleEndMatch}
            onAdjustGoals={handleAdjustGoals}
            onAdjustAssists={handleAdjustAssists}
            onAdjustSaves={handleAdjustSaves}
          />
        )}

        {activeTab === 'stats' && <Statistics players={activePlayers} />}
      </main>
    </div>
  );
};

export default Index;
