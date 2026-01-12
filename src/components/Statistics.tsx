import { Badge } from '@/components/ui/badge';
import { Trophy, Goal, Shield } from 'lucide-react';
import type { Player } from '@/types/player';

interface StatisticsProps {
  players: Player[];
}

const Statistics = ({ players }: StatisticsProps) => {
  const sortedByGoals = [...players].sort((a, b) => b.goals - a.goals);
  const sortedByAssists = [...players].sort((a, b) => b.assists - a.assists);
  const sortedBySaves = [...players]
    .filter((p) => p.isGoalkeeper)
    .sort((a, b) => b.saves - a.saves);

  const topScorer = sortedByGoals[0];
  const topAssister = sortedByAssists[0];
  const topGoalkeeper = sortedBySaves[0];

  if (players.length === 0) {
    return (
      <div className="card-elevated p-8 text-center animate-fade-in">
        <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Nenhuma estatística ainda.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Jogue algumas partidas para ver os dados!
        </p>
      </div>
    );
  }

  const hasStats = players.some((p) => p.goals > 0 || p.assists > 0 || p.saves > 0);

  if (!hasStats) {
    return (
      <div className="card-elevated p-8 text-center animate-fade-in">
        <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Nenhum gol ou defesa registrado.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Inicie uma partida e registre os eventos!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* MVP Section */}
      {(topScorer?.goals > 0 || topAssister?.assists > 0 || topGoalkeeper?.saves > 0) && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topScorer?.goals > 0 && (
            <div className="card-elevated p-6 text-center gradient-primary text-primary-foreground">
              <Trophy className="w-10 h-10 mx-auto mb-2 text-gold" />
              <p className="text-sm opacity-80">Artilheiro</p>
              <h3 className="font-display text-2xl mt-1 text-white">{topScorer.name}</h3>
              <div className="mt-2 bg-gold text-white font-bold px-3 py-1 rounded-full inline-flex items-center gap-1">
                <Goal className="w-4 h-4" />
                {topScorer.goals} gols
              </div>
            </div>
          )}

          {topAssister?.assists > 0 && (
            <div className="card-elevated p-6 text-center bg-secondary">
              <Trophy className="w-10 h-10 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Garçom</p>
              <h3 className="font-display text-2xl mt-1 text-primary">
                {topAssister.name}
              </h3>
              <Badge className="mt-2 bg-primary text-primary-foreground">
                🎯 {topAssister.assists} assistências
              </Badge>
            </div>
          )}

          {topGoalkeeper?.saves > 0 && (
            <div className="card-elevated p-6 text-center bg-secondary">
              <Shield className="w-10 h-10 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Goleiro Destaque</p>
              <h3 className="font-display text-2xl mt-1 text-primary">
                {topGoalkeeper.name}
              </h3>
              <Badge className="mt-2 bg-primary text-primary-foreground">
                🧤 {topGoalkeeper.saves} defesas
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* Goals Ranking */}
      <div className="card-elevated p-6">
        <h3 className="font-display text-xl text-primary mb-4 flex items-center gap-2">
          <Goal className="w-5 h-5" />
          Ranking de Gols
        </h3>
        <div className="space-y-2">
          {sortedByGoals.slice(0, 10).map((player, index) => (
            <div
              key={player.id}
              className="flex items-center gap-3 p-3 bg-secondary rounded-lg"
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0
                    ? 'bg-gold text-black'
                    : index === 1
                    ? 'bg-gray-400 text-black'
                    : index === 2
                    ? 'bg-amber-600 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {index + 1}
              </span>
              <span className="flex-1 font-medium">{player.name}</span>
              <Badge variant="outline" className="font-bold">
                {player.goals}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Assists Ranking */}
      <div className="card-elevated p-6">
        <h3 className="font-display text-xl text-primary mb-4 flex items-center gap-2">
          🎯 Ranking de Assistências
        </h3>
        <div className="space-y-2">
          {sortedByAssists.slice(0, 10).map((player, index) => (
            <div
              key={player.id}
              className="flex items-center gap-3 p-3 bg-secondary rounded-lg"
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0
                    ? 'bg-gold text-black'
                    : index === 1
                    ? 'bg-gray-400 text-black'
                    : index === 2
                    ? 'bg-amber-600 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {index + 1}
              </span>
              <span className="flex-1 font-medium">{player.name}</span>
              <Badge variant="outline" className="font-bold">
                {player.assists}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Saves Ranking */}
      {sortedBySaves.length > 0 && (
        <div className="card-elevated p-6">
          <h3 className="font-display text-xl text-primary mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Ranking de Defesas
          </h3>
          <div className="space-y-2">
            {sortedBySaves.slice(0, 5).map((player, index) => (
              <div
                key={player.id}
                className="flex items-center gap-3 p-3 bg-secondary rounded-lg"
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0
                      ? 'bg-gold text-black'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index + 1}
                </span>
                <span className="flex-1 font-medium">{player.name}</span>
                <Badge variant="outline" className="font-bold">
                  {player.saves}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;
