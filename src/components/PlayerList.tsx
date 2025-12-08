import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, Shield, Goal, RotateCcw, Search } from 'lucide-react';
import type { Player } from '@/types/player';

interface PlayerListProps {
  players: Player[];
  onEdit: (player: Player) => void;
  onDelete: (id: string) => void;
  onReactivate?: (id: string) => void;
  selectable?: boolean;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  showActions?: boolean;
}

const PlayerList = ({
  players,
  onEdit,
  onDelete,
  onReactivate,
  selectable = false,
  selectedIds = [],
  onToggleSelect,
  showActions = true,
}: PlayerListProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const getSkillColor = (level: number) => {
    if (level >= 8) return 'bg-gold text-foreground';
    if (level >= 5) return 'bg-primary text-primary-foreground';
    return 'bg-muted text-muted-foreground';
  };

  const filteredPlayers = players.filter(player => 
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar jogador..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {filteredPlayers.length === 0 ? (
        <div className="card-elevated p-6 text-center">
          <p className="text-muted-foreground text-sm">Nenhum jogador encontrado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredPlayers.map((player, index) => (
        <div
          key={player.id}
          className={`card-elevated p-4 flex items-center gap-4 animate-slide-up transition-all ${
            selectable && selectedIds.includes(player.id)
              ? 'ring-2 ring-primary bg-secondary'
              : ''
          } ${
            player.active === false ? 'opacity-50' : ''
          } ${
            selectable && player.active !== false ? 'cursor-pointer' : ''
          }`}
          style={{ animationDelay: `${index * 50}ms` }}
          onClick={() => selectable && player.active !== false && onToggleSelect?.(player.id)}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground truncate">
                {player.name}
              </span>
              <Badge variant="outline" className="text-xs border-primary text-primary">
                {player.position === 'Goleiro' && '🧤'}
                {player.position === 'Zagueiro' && '🛡️'}
                {player.position === 'Meio Campo' && '⚙️'}
                {player.position === 'Atacante' && '⚽'}
                {' '}{player.position}
              </Badge>
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Goal className="w-3 h-3" /> {player.goals}
              </span>
              <span className="flex items-center gap-1">
                🎯 {player.assists}
              </span>
              {player.isGoalkeeper && (
                <span className="flex items-center gap-1">
                  🧤 {player.saves}
                </span>
              )}
            </div>
          </div>

          <Badge className={`${getSkillColor(player.skillLevel)} font-bold`}>
            {player.skillLevel}
          </Badge>

          {!selectable && showActions && (
            <div className="flex gap-1">
              {player.active === false ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReactivate?.(player.id);
                  }}
                  className="h-8 w-8 text-muted-foreground hover:text-green-600"
                  title="Reativar jogador"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              ) : (
                <>
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
                </>
              )}
            </div>
          )}
        </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlayerList;
