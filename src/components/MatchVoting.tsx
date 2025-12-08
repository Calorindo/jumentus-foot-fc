import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, ThumbsUp, Star, Clock, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { getRecentMatches, getMatch, voteForPlayer, canVote, hasUserVoted, type MatchData } from '@/services/matchService';
import { useFirebaseData } from '@/hooks/useFirebase';
import { useAuth } from '@/contexts/AuthContext';
import { mapFirebaseToPlayer } from '@/utils/playerMapper';
import type { Player } from '@/types/player';

interface MatchVotingProps {}

const MatchVoting = ({}: MatchVotingProps) => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const { data: playersData } = useFirebaseData<Record<string, any>>('players');
  const allPlayers = playersData ? Object.values(playersData).map(mapFirebaseToPlayer) : [];

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const recentMatches = await getRecentMatches();
      setMatches(recentMatches);
    } catch (error) {
      toast.error('Erro ao carregar partidas');
    } finally {
      setLoading(false);
    }
  };

  const loadMatch = async (matchId: string) => {
    try {
      const matchData = await getMatch(matchId);
      setSelectedMatch(matchData);
      
      // Check if user already voted
      if (user?.uid) {
        const voted = await hasUserVoted(matchId, user.uid);
        setHasVoted(voted);
      }
    } catch (error) {
      toast.error('Erro ao carregar partida');
    }
  };

  const handleVote = async (playerId: string) => {
    if (!selectedMatch || !user?.uid) return;
    
    if (hasVoted) {
      toast.error('Você já votou nesta partida!');
      return;
    }

    if (!canVote(selectedMatch)) {
      toast.error('Prazo de votação encerrado (2 horas)');
      return;
    }

    try {
      await voteForPlayer(selectedMatch.id, playerId, user.uid);
      setHasVoted(true);
      toast.success('Voto registrado!');
      await loadMatch(selectedMatch.id);
    } catch (error: any) {
      if (error.message === 'User already voted') {
        toast.error('Você já votou nesta partida!');
        setHasVoted(true);
      } else {
        toast.error('Erro ao registrar voto');
      }
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTimeRemaining = (match: MatchData) => {
    const twoHoursInMs = 2 * 60 * 60 * 1000;
    const remaining = twoHoursInMs - (Date.now() - match.endedAt);
    if (remaining <= 0) return 'Encerrado';
    
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="card-elevated p-8 text-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (selectedMatch) {
    const matchPlayers = allPlayers.filter(p => 
      selectedMatch.teamA.playerIds.includes(p.id) || selectedMatch.teamB.playerIds.includes(p.id)
    );

    const sortedByVotes = [...matchPlayers].sort((a, b) => {
      const votesA = selectedMatch.votes?.[a.id] || 0;
      const votesB = selectedMatch.votes?.[b.id] || 0;
      return votesB - votesA;
    });

    const topPlayer = sortedByVotes[0];
    const topVotes = selectedMatch.votes?.[topPlayer?.id] || 0;
    const votingOpen = canVote(selectedMatch);

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="card-elevated p-6 gradient-hero text-primary-foreground">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedMatch(null)}
            className="text-primary-foreground hover:bg-primary-foreground/10 mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="text-center">
            <Trophy className="w-12 h-12 mx-auto mb-2 text-gold" />
            <h2 className="font-display text-2xl md:text-3xl mb-2">Vote no Melhor da Partida</h2>
            <p className="text-sm opacity-80">
              {selectedMatch.teamA.name} {selectedMatch.teamA.score} × {selectedMatch.teamB.score} {selectedMatch.teamB.name}
            </p>
            <Badge className={`mt-2 ${votingOpen ? 'bg-green-500' : 'bg-red-500'}`}>
              <Clock className="w-3 h-3 mr-1" />
              {votingOpen ? `Tempo: ${getTimeRemaining(selectedMatch)}` : 'Votação encerrada'}
            </Badge>
          </div>
        </div>

      {topVotes > 0 && (
        <div className="card-elevated p-6 text-center bg-gold/10 border-2 border-gold">
          <Star className="w-10 h-10 mx-auto mb-2 text-gold" />
          <p className="text-sm text-muted-foreground">Líder em Votos</p>
          <h3 className="font-display text-2xl text-gold mt-1">{topPlayer.name}</h3>
          <Badge className="mt-2 bg-gold text-foreground">
            <ThumbsUp className="w-4 h-4 mr-1" />
            {topVotes} votos
          </Badge>
        </div>
      )}

      <div className="card-elevated p-6">
        <h3 className="font-display text-xl text-primary mb-4">Jogadores da Partida</h3>
        <div className="space-y-2">
          {sortedByVotes.map((player) => {
            const votes = selectedMatch.votes?.[player.id] || 0;
            const isInTeamA = selectedMatch.teamA.playerIds.includes(player.id);
            
            return (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 bg-secondary rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{player.name}</span>
                    <Badge variant="outline" className={`text-xs ${isInTeamA ? 'border-primary' : 'border-gold'}`}>
                      {isInTeamA ? selectedMatch.teamA.name : selectedMatch.teamB.name}
                    </Badge>
                  </div>
                  {votes > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <ThumbsUp className="w-3 h-3" />
                      {votes} {votes === 1 ? 'voto' : 'votos'}
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => handleVote(player.id)}
                  disabled={hasVoted || !votingOpen}
                  className="bg-primary hover:bg-primary/80"
                >
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  {hasVoted ? 'Votado' : 'Votar'}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card-elevated p-6 gradient-hero text-primary-foreground text-center">
        <Trophy className="w-12 h-12 mx-auto mb-2 text-gold" />
        <h2 className="font-display text-2xl md:text-3xl">Votação - Melhores da Partida</h2>
        <p className="text-sm opacity-80 mt-2">Selecione uma partida para votar</p>
      </div>

      {matches.length === 0 ? (
        <div className="card-elevated p-8 text-center">
          <p className="text-muted-foreground">Nenhuma partida disponível</p>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => {
            const votingOpen = canVote(match);
            const totalVotes = Object.values(match.votes || {}).reduce((sum: number, v) => sum + (v as number), 0);
            
            return (
              <div
                key={match.id}
                onClick={() => loadMatch(match.id)}
                className="card-elevated p-4 cursor-pointer hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-display text-lg">
                        {match.teamA.name} {match.teamA.score} × {match.teamB.score} {match.teamB.name}
                      </span>
                      {votingOpen && (
                        <Badge className="bg-green-500 text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          Aberto
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{formatDate(match.endedAt)}</span>
                      <span>•</span>
                      <span>
                        <ThumbsUp className="w-3 h-3 inline mr-1" />
                        {totalVotes} {totalVotes === 1 ? 'voto' : 'votos'}
                      </span>
                      {votingOpen && (
                        <>
                          <span>•</span>
                          <span>{getTimeRemaining(match)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MatchVoting;
