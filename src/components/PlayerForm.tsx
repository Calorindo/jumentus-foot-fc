import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { Player, PlayerPosition } from '@/types/player';

interface PlayerFormProps {
  onAddPlayer: (player: Omit<Player, 'id' | 'goals' | 'saves'>) => void;
  editingPlayer?: Player | null;
  onUpdatePlayer?: (player: Player) => void;
  onCancelEdit?: () => void;
}

const PlayerForm = ({ onAddPlayer, editingPlayer, onUpdatePlayer, onCancelEdit }: PlayerFormProps) => {
  const { isAdmin } = useAuth();
  const [name, setName] = useState('');
  const [skillLevel, setSkillLevel] = useState(5);
  const [isGoalkeeper, setIsGoalkeeper] = useState(false);
  const [position, setPosition] = useState<PlayerPosition>('Atacante');
  const [isActive, setIsActive] = useState(true);
  const [goals, setGoals] = useState(0);
  const [assists, setAssists] = useState(0);
  const [saves, setSaves] = useState(0);

  useEffect(() => {
    if (editingPlayer) {
      setName(editingPlayer.name);
      setSkillLevel(editingPlayer.skillLevel);
      setIsGoalkeeper(editingPlayer.isGoalkeeper);
      setPosition(editingPlayer.position);
      setIsActive(editingPlayer.active ?? true);
      setGoals(editingPlayer.goals);
      setAssists(editingPlayer.assists);
      setSaves(editingPlayer.saves);
    } else {
      setName('');
      setSkillLevel(5);
      setIsGoalkeeper(false);
      setPosition('Atacante');
      setIsActive(true);
      setGoals(0);
      setAssists(0);
      setSaves(0);
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
        position,
        active: isActive,
        goals,
        assists,
        saves,
      });
    } else {
      onAddPlayer({
        name: name.trim(),
        skillLevel,
        isGoalkeeper,
        position,
      });
    }

    setName('');
    setSkillLevel(5);
    setIsGoalkeeper(false);
    setPosition('Atacante');
    setIsActive(true);
    setGoals(0);
    setAssists(0);
    setSaves(0);
  };

  return (
    <form onSubmit={handleSubmit} className="card-elevated p-4 sm:p-6 animate-fade-in">
      <h2 className="font-display text-xl sm:text-2xl text-primary mb-4">
        {editingPlayer ? 'Editar Jogador' : 'Novo Jogador'}
      </h2>
      
      <div className="space-y-3 sm:space-y-4">
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

        <div>
          <Label className="text-foreground font-medium">Posição</Label>
          <Select value={position} onValueChange={(value) => {
            setPosition(value as PlayerPosition);
            setIsGoalkeeper(value === 'Goleiro');
          }}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Goleiro">🧤 Goleiro</SelectItem>
              <SelectItem value="Zagueiro">🛡️ Zagueiro</SelectItem>
              <SelectItem value="Meio Campo">⚙️ Meio Campo</SelectItem>
              <SelectItem value="Atacante">⚽ Atacante</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {editingPlayer && (
          <>
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

            {isAdmin && (
              <>
                <div>
                  <Label htmlFor="goals" className="text-foreground font-medium">⚽ Gols</Label>
                  <Input
                    id="goals"
                    type="number"
                    min="0"
                    value={goals}
                    onChange={(e) => setGoals(parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="assists" className="text-foreground font-medium">🎯 Assistências</Label>
                  <Input
                    id="assists"
                    type="number"
                    min="0"
                    value={assists}
                    onChange={(e) => setAssists(parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="saves" className="text-foreground font-medium">🧤 Defesas</Label>
                  <Input
                    id="saves"
                    type="number"
                    min="0"
                    value={saves}
                    onChange={(e) => setSaves(parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
              </>
            )}
          </>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <Button type="submit" className="flex-1 btn-primary">
            <UserPlus className="w-4 h-4 mr-2" />
            {editingPlayer ? 'Salvar' : 'Adicionar'}
          </Button>
          {editingPlayer && onCancelEdit && (
            <Button type="button" variant="outline" onClick={onCancelEdit} className="w-full sm:w-auto">
              Cancelar
            </Button>
          )}
        </div>
      </div>
    </form>
  );
};

export default PlayerForm;
