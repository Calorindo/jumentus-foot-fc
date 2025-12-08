import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { UserPlus } from 'lucide-react';
import type { Player } from '@/types/player';

interface PlayerFormProps {
  onAddPlayer: (player: Omit<Player, 'id' | 'goals' | 'saves'>) => void;
  editingPlayer?: Player | null;
  onUpdatePlayer?: (player: Player) => void;
  onCancelEdit?: () => void;
}

const PlayerForm = ({ onAddPlayer, editingPlayer, onUpdatePlayer, onCancelEdit }: PlayerFormProps) => {
  const [name, setName] = useState('');
  const [skillLevel, setSkillLevel] = useState(5);
  const [isGoalkeeper, setIsGoalkeeper] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (editingPlayer) {
      setName(editingPlayer.name);
      setSkillLevel(editingPlayer.skillLevel);
      setIsGoalkeeper(editingPlayer.isGoalkeeper);
      setIsActive(editingPlayer.active ?? true);
    } else {
      setName('');
      setSkillLevel(5);
      setIsGoalkeeper(false);
      setIsActive(true);
    }
  }, [editingPlayer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingPlayer && onUpdatePlayer) {
      onUpdatePlayer({
        ...editingPlayer,
        name: name.trim(),
        skillLevel,
        isGoalkeeper,
        active: isActive,
      });
    } else {
      onAddPlayer({
        name: name.trim(),
        skillLevel,
        isGoalkeeper,
      });
    }

    setName('');
    setSkillLevel(5);
    setIsGoalkeeper(false);
    setIsActive(true);
  };

  return (
    <form onSubmit={handleSubmit} className="card-elevated p-6 animate-fade-in">
      <h2 className="font-display text-2xl text-primary mb-4">
        {editingPlayer ? 'Editar Jogador' : 'Novo Jogador'}
      </h2>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-foreground font-medium">Nome</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Digite o nome do jogador"
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-foreground font-medium">
            Nível de Habilidade: <span className="text-primary font-bold">{skillLevel}</span>
          </Label>
          <div className="mt-3 px-1">
            <Slider
              value={[skillLevel]}
              onValueChange={(value) => setSkillLevel(value[0])}
              min={1}
              max={10}
              step={1}
              className="cursor-pointer"
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Iniciante</span>
            <span>Craque</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
          <Label htmlFor="goalkeeper" className="text-foreground font-medium cursor-pointer">
            🧤 Goleiro
          </Label>
          <Switch
            id="goalkeeper"
            checked={isGoalkeeper}
            onCheckedChange={setIsGoalkeeper}
          />
        </div>

        {editingPlayer && (
          <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
            <Label htmlFor="active" className="text-foreground font-medium cursor-pointer">
              ✅ Ativo
            </Label>
            <Switch
              id="active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
        )}

        <div className="flex gap-2">
          <Button type="submit" className="flex-1 btn-primary">
            <UserPlus className="w-4 h-4 mr-2" />
            {editingPlayer ? 'Salvar' : 'Adicionar'}
          </Button>
          {editingPlayer && onCancelEdit && (
            <Button type="button" variant="outline" onClick={onCancelEdit}>
              Cancelar
            </Button>
          )}
        </div>
      </div>
    </form>
  );
};

export default PlayerForm;
