import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // CORREÇÃO 1: Removido 'profile', pois ele não existe no seu AuthContext.
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  // CORREÇÃO 2: A verificação agora é feita apenas no 'user'.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se o usuário existe e não está carregando, a página é exibida.
  return <>{children}</>;
};

export default ProtectedRoute;