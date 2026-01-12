import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { UserPlus, Check, ChevronsUpDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFirebaseData } from '@/hooks/useFirebase';
import { cn } from '@/lib/utils';
import type { Player, PlayerPosition, PreferredFoot } from '@/types/player';

interface PlayerFormProps {
  onAddPlayer: (player: Omit<Player, 'id' | 'goals' | 'saves'>) => void;
  editingPlayer?: Player | null;
  onUpdatePlayer?: (player: Player) => void;
  onCancelEdit?: () => void;
}

const PlayerForm = ({ onAddPlayer, editingPlayer, onUpdatePlayer, onCancelEdit }: PlayerFormProps) => {
  const { isAdmin, user } = useAuth();
  const { data: usersData } = useFirebaseData<Record<string, any>>('users');
  const [emailDropdownOpen, setEmailDropdownOpen] = useState(false);
  
  // Verificar se o usuário pode editar este jogador
  const canEditPlayer = isAdmin || (editingPlayer?.linkedUserEmail === user?.email);
  const isLinkedUser = editingPlayer?.linkedUserEmail === user?.email && !isAdmin;
  
  // Lista de emails dos usuários cadastrados
  const userEmails = usersData ? Object.values(usersData).map((userData: any) => userData.email).filter(Boolean) : [];
  const [name, setName] = useState('');
  const [skillLevel, setSkillLevel] = useState(5);
  const [isGoalkeeper, setIsGoalkeeper] = useState(false);
  const [position, setPosition] = useState<PlayerPosition>('Atacante');
  const [weight, setWeight] = useState<number>();
  const [height, setHeight] = useState<number>();
  const [preferredFoot, setPreferredFoot] = useState<PreferredFoot>('Direito');
  const [isActive, setIsActive] = useState(true);
  const [goals, setGoals] = useState(0);
  const [assists, setAssists] = useState(0);
  const [saves, setSaves] = useState(0);
  const [mvpCount, setMvpCount] = useState(0);
  const [linkedUserEmail, setLinkedUserEmail] = useState('');

  useEffect(() => {
    if (editingPlayer) {
      setName(editingPlayer.name);
      setSkillLevel(editingPlayer.skillLevel);
      setIsGoalkeeper(editingPlayer.isGoalkeeper);
      setPosition(editingPlayer.position);
      setWeight(editingPlayer.weight);
      setHeight(editingPlayer.height);
      setPreferredFoot(editingPlayer.preferredFoot || 'Direito');
      setIsActive(editingPlayer.active ?? true);
      setGoals(editingPlayer.goals);
      setAssists(editingPlayer.assists);
      setSaves(editingPlayer.saves);
      setMvpCount(editingPlayer.mvpCount || 0);
      setLinkedUserEmail(editingPlayer.linkedUserEmail || '');
    } else {
      setName('');
      setSkillLevel(5);
      setIsGoalkeeper(false);
      setPosition('Atacante');
      setWeight(undefined);
      setHeight(undefined);
      setPreferredFoot('Direito');
      setIsActive(true);
      setGoals(0);
      setAssists(0);
      setSaves(0);
      setMvpCount(0);
      setLinkedUserEmail('');
    }
  }, [editingPlayer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingPlayer && onUpdatePlayer) {
      if (!canEditPlayer) {
        toast.error('Você não tem permissão para editar este jogador');
        return;
      }
      
      onUpdatePlayer({
        ...editingPlayer,
        name: name.trim(),
        skillLevel: isLinkedUser ? editingPlayer.skillLevel : skillLevel,
        isGoalkeeper: isLinkedUser ? editingPlayer.isGoalkeeper : isGoalkeeper,
        position: position,
        weight,
        height,
        preferredFoot,
        active: isLinkedUser ? editingPlayer.active : isActive,
        goals: isLinkedUser ? editingPlayer.goals : goals,
        assists: isLinkedUser ? editingPlayer.assists : assists,
        saves: isLinkedUser ? editingPlayer.saves : saves,
        mvpCount: isLinkedUser ? editingPlayer.mvpCount : mvpCount,
        linkedUserEmail: isLinkedUser ? editingPlayer.linkedUserEmail : (linkedUserEmail.trim() || undefined),
      });
    } else {
      onAddPlayer({
        name: name.trim(),
        skillLevel,
        isGoalkeeper,
        position,
        weight,
        height,
        preferredFoot,
      });
    }

    setName('');
    setSkillLevel(5);
    setIsGoalkeeper(false);
    setPosition('Atacante');
    setWeight(undefined);
    setHeight(undefined);
    setPreferredFoot('Direito');
    setIsActive(true);
    setGoals(0);
    setAssists(0);
    setSaves(0);
    setMvpCount(0);
    setLinkedUserEmail('');
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
            disabled={isLinkedUser}
          />
        </div>

        {isAdmin && (
          <div>
            <Label className="text-foreground font-medium">Email do Usuário Vinculado</Label>
            <Popover open={emailDropdownOpen} onOpenChange={setEmailDropdownOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={emailDropdownOpen}
                  className="w-full justify-between mt-1"
                >
                  {linkedUserEmail || "Selecionar email..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Buscar email..." />
                  <CommandEmpty>Nenhum email encontrado.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value=""
                      onSelect={() => {
                        setLinkedUserEmail('');
                        setEmailDropdownOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          linkedUserEmail === '' ? "opacity-100" : "opacity-0"
                        )}
                      />
                      Nenhum usuário
                    </CommandItem>
                    {userEmails.map((email) => (
                      <CommandItem
                        key={email}
                        value={email}
                        onSelect={(currentValue) => {
                          setLinkedUserEmail(currentValue === linkedUserEmail ? '' : currentValue);
                          setEmailDropdownOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            linkedUserEmail === email ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {email}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground mt-1">
              Usuário poderá editar peso, altura e posição
            </p>
          </div>
        )}

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
              disabled={isLinkedUser}
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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="weight" className="text-foreground font-medium">Peso (kg)</Label>
            <Input
              id="weight"
              type="number"
              min="40"
              max="150"
              value={weight || ''}
              onChange={(e) => setWeight(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="70"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="height" className="text-foreground font-medium">Altura (cm)</Label>
            <Input
              id="height"
              type="number"
              min="150"
              max="220"
              value={height || ''}
              onChange={(e) => setHeight(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="175"
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label className="text-foreground font-medium">Pé Preferido</Label>
          <Select value={preferredFoot} onValueChange={(value) => setPreferredFoot(value as PreferredFoot)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Direito">🦿 Direito</SelectItem>
              <SelectItem value="Esquerdo">🦾 Esquerdo</SelectItem>
              <SelectItem value="Ambidestro">⚖️ Ambidestro</SelectItem>
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
                disabled={isLinkedUser}
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

                <div>
                  <Label htmlFor="mvpCount" className="text-foreground font-medium">⭐ Melhor da Partida</Label>
                  <Input
                    id="mvpCount"
                    type="number"
                    min="0"
                    value={mvpCount}
                    onChange={(e) => setMvpCount(parseInt(e.target.value) || 0)}
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
