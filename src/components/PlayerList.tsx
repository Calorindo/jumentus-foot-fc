import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Shield, Goal } from 'lucide-react';
import type { Player } from '@/types/player';

interface PlayerListProps {
  players: Player[];
  onEdit: (player: Player) => void;
  onDelete: (id: string) => void;
  selectable?: boolean;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
}

const PlayerList = ({
  players,
  onEdit,
  onDelete,
  selectable = false,
  selectedIds = [],
  onToggleSelect,
}: PlayerListProps) => {
  const getSkillColor = (level: number) => {
    if (level >= 8) return 'bg-gold text-foreground';
    if (level >= 5) return 'bg-primary text-primary-foreground';
    return 'bg-muted text-muted-foreground';
  };

  if (players.length === 0) {
    return (
      <div className="card-elevated p-8 text-center animate-fade-in">
        <p className="text-muted-foreground">Nenhum jogador cadastrado ainda.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Adicione jogadores para começar!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {players.map((player, index) => (
        <div
          key={player.id}
          className={`card-elevated p-4 flex items-center gap-4 animate-slide-up cursor-pointer transition-all ${
            selectable && selectedIds.includes(player.id)
              ? 'ring-2 ring-primary bg-secondary'
              : ''
          }`}
          style={{ animationDelay: `${index * 50}ms` }}
          onClick={() => selectable && onToggleSelect?.(player.id)}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground truncate">
                {player.name}
              </span>
              {player.isGoalkeeper && (
                <Badge variant="outline" className="text-xs border-primary text-primary">
                  <Shield className="w-3 h-3 mr-1" />
                  Goleiro
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Goal className="w-3 h-3" /> {player.goals} gols
              </span>
              {player.isGoalkeeper && (
                <span className="flex items-center gap-1">
                  🧤 {player.saves} defesas
                </span>
              )}
            </div>
          </div>

          <Badge className={`${getSkillColor(player.skillLevel)} font-bold`}>
            {player.skillLevel}
          </Badge>

          {!selectable && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(player);
                }}
                className="h-8 w-8 text-muted-foreground hover:text-primary"
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(player.id);
                }}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PlayerList;
