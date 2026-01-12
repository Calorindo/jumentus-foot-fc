import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { UserCheck, Users, Mail, Shield, Edit, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { getPendingUsers, approveUser, getAllUsers, updateUser, type User } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';

const UserManagement = () => {
  const { isAdmin } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      const [pending, all] = await Promise.all([
        getPendingUsers(),
        getAllUsers()
      ]);
      setPendingUsers(pending);
      setAllUsers(all);
    } catch (error) {
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (uid: string) => {
    try {
      await approveUser(uid);
      toast.success('Usuário aprovado!');
      await loadUsers();
    } catch (error) {
      toast.error('Erro ao aprovar usuário');
    }
  };

  const handleUpdateUser = async (uid: string, updates: Partial<User>) => {
    try {
      await updateUser(uid, updates);
      toast.success('Usuário atualizado!');
      setEditingUser(null);
      await loadUsers();
    } catch (error) {
      toast.error('Erro ao atualizar usuário');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAdmin) {
    return (
      <div className="card-elevated p-8 text-center">
        <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Acesso restrito a administradores</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card-elevated p-8 text-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card-elevated p-6 gradient-hero text-primary-foreground text-center">
        <Users className="w-12 h-12 mx-auto mb-2 text-gold" />
        <h2 className="font-display text-2xl md:text-3xl">Gerenciar Usuários</h2>
        <p className="text-sm opacity-80 mt-2">Aprovar novos usuários do sistema</p>
      </div>

      <div className="flex gap-2">
        <Button
          variant={activeTab === 'pending' ? 'default' : 'outline'}
          onClick={() => setActiveTab('pending')}
          className="flex-1"
        >
          <UserCheck className="w-4 h-4 mr-2" />
          Pendentes ({pendingUsers.length})
        </Button>
        <Button
          variant={activeTab === 'all' ? 'default' : 'outline'}
          onClick={() => setActiveTab('all')}
          className="flex-1"
        >
          <Users className="w-4 h-4 mr-2" />
          Todos ({allUsers.length})
        </Button>
      </div>

      {activeTab === 'pending' && (
        <div className="card-elevated p-6">
          <h3 className="font-display text-xl text-primary mb-4">
            Usuários Pendentes de Aprovação
          </h3>
          
          {pendingUsers.length === 0 ? (
            <div className="text-center py-8">
              <UserCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum usuário pendente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingUsers.map((user) => (
                <div
                  key={user.uid}
                  className="flex items-center justify-between p-4 bg-secondary rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{user.email}</span>
                      {user.isAdmin && (
                        <Badge className="bg-gold text-foreground text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Cadastrado em: {formatDate(user.createdAt)}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleApprove(user.uid)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Aprovar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'all' && (
        <div className="card-elevated p-6">
          <h3 className="font-display text-xl text-primary mb-4">
            Todos os Usuários
          </h3>
          
          <div className="space-y-3">
            {allUsers.map((user) => (
              <div
                key={user.uid}
                className="flex items-center justify-between p-4 bg-secondary rounded-lg"
              >
                {editingUser?.uid === user.uid ? (
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{user.email}</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={editingUser.isAdmin}
                          onCheckedChange={(checked) => 
                            setEditingUser({...editingUser, isAdmin: checked})
                          }
                        />
                        <span className="text-sm">Administrador</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={editingUser.trusted}
                          onCheckedChange={(checked) => 
                            setEditingUser({...editingUser, trusted: checked})
                          }
                        />
                        <span className="text-sm">Aprovado</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={editingUser.active !== false}
                          onCheckedChange={(checked) => 
                            setEditingUser({...editingUser, active: checked})
                          }
                        />
                        <span className="text-sm">Ativo</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUpdateUser(user.uid, {
                          isAdmin: editingUser.isAdmin,
                          trusted: editingUser.trusted,
                          active: editingUser.active
                        })}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Salvar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingUser(null)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{user.email}</span>
                        {user.isAdmin && (
                          <Badge className="bg-gold text-foreground text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                        <Badge 
                          className={`text-xs ${
                            user.trusted 
                              ? 'bg-green-500 text-white' 
                              : 'bg-orange-500 text-white'
                          }`}
                        >
                          {user.trusted ? 'Aprovado' : 'Pendente'}
                        </Badge>
                        {user.active === false && (
                          <Badge className="bg-red-500 text-white text-xs">
                            <UserX className="w-3 h-3 mr-1" />
                            Inativo
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Cadastrado em: {formatDate(user.createdAt)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingUser(user)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;