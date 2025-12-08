import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, ThumbsUp, Star } from 'lucide-react';
import { toast } from 'sonner';
import { getMatch, voteForPlayer, type MatchData } from '@/services/matchService';
import { useFirebaseData } from '@/hooks/useFirebase';
import { mapFirebaseToPlayer } from '@/utils/playerMapper';
import type { Player } from '@/types/player';

interface MatchVotingProps {
  matchId: string;
  onClose: () => void;
}

const MatchVoting = ({ matchId, onClose }: MatchVotingProps) => {
  const [match, setMatch] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState(false);
  const { data: playersData } = useFirebaseData<Record<string, any>>('players');
  const allPlayers = playersData ? Object.values(playersData).map(mapFirebaseToPlayer) : [];

  useEffect(() => {
    loadMatch();
  }, [matchId]);

  const loadMatch = async () => {
    try {
      const matchData = await getMatch(matchId);
      setMatch(matchData);
    } catch (error) {
      toast.error('Erro ao carregar partida');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (playerId: string) => {
    if (voted) {
      toast.error('Você já votou!');
      return;
    }

    try {
      await voteForPlayer(matchId, playerId);
      setVoted(true);
      toast.success('Voto registrado!');
      await loadMatch();
    } catch (error) {
      toast.error('Erro ao registrar voto');
    }
  };

  if (loading) {
    return (
      <div className="card-elevated p-8 text-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="card-elevated p-8 text-center">
        <p className="text-muted-foreground">Partida não encontrada</p>
      </div>
    );
  }

  const matchPlayers = allPlayers.filter(p => 
    match.teamA.playerIds.includes(p.id) || match.teamB.playerIds.includes(p.id)
  );

  const sortedByVotes = [...matchPlayers].sort((a, b) => {
    const votesA = match.votes?.[a.id] || 0;
    const votesB = match.votes?.[b.id] || 0;
    return votesB - votesA;
  });

  const topPlayer = sortedByVotes[0];
  const topVotes = match.votes?.[topPlayer?.id] || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card-elevated p-6 gradient-hero text-primary-foreground text-center">
        <Trophy className="w-12 h-12 mx-auto mb-2 text-gold" />
        <h2 className="font-display text-2xl md:text-3xl mb-2">Vote no Melhor da Partida</h2>
        <p className="text-sm opacity-80">
          {match.teamA.name} {match.teamA.score} × {match.teamB.score} {match.teamB.name}
        </p>
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
            const votes = match.votes?.[player.id] || 0;
            const isInTeamA = match.teamA.playerIds.includes(player.id);
            
            return (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 bg-secondary rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{player.name}</span>
                    <Badge variant="outline" className={`text-xs ${isInTeamA ? 'border-primary' : 'border-gold'}`}>
                      {isInTeamA ? match.teamA.name : match.teamB.name}
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
                  disabled={voted}
                  className="bg-primary hover:bg-primary/80"
                >
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  Votar
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      <Button
        onClick={onClose}
        variant="outline"
        className="w-full"
      >
        Fechar
      </Button>
    </div>
  );
};

export default MatchVoting;
