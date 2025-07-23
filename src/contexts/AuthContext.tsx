// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../lib/api'; 

// A interface User correta com 'isAdmin'
interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean; 
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await authAPI.getCurrentUser();
          setUser(response.user);
        } catch (error) {
          console.log('Sessão expirada ou token inválido. Limpando...');
          localStorage.removeItem('authToken');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authAPI.login({ email, password });
    
    // --- LOGS PARA DEBUG ---
    console.log("DADOS RECEBIDOS DA API:", response); 
    // ---------------------
    
    localStorage.setItem('authToken', response.token);
    setUser(response.user);
    
    // --- LOGS PARA DEBUG ---
    console.log("USUÁRIO DEFINIDO NO CONTEXTO!", response.user);
    // ---------------------
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await authAPI.register({ name, email, password });
    localStorage.setItem('authToken', response.token);
    setUser(response.user);
  };

  const logout = () => {
    authAPI.logout(); 
    localStorage.removeItem('authToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};