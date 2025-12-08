import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from './LoginForm';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isTrusted, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  if (!isTrusted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Acesso Pendente</h2>
          <p>Sua conta está aguardando aprovação do administrador.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
