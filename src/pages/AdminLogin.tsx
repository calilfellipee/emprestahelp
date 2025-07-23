import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Shield, Lock, User } from 'lucide-react';

export default function AdminLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(formData.email, formData.password);
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-red-200">Acesso restrito para administradores</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-red-400"
                placeholder="admin@emprestahelp.com"
                required
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                Senha
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-red-400"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar como Admin'}
            </button>
          </form>

          {/* Quick Setup */}
          <div className="mt-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
            <h4 className="text-red-400 font-medium mb-2">🚀 Setup Rápido</h4>
            <p className="text-gray-300 text-sm mb-3">
              Clique no botão abaixo para criar automaticamente um usuário administrador:
            </p>
            <button
              onClick={async () => {
                setLoading(true);
                try {
                  const response = await fetch('/functions/v1/create-admin-user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                  });
                  const result = await response.json();
                  
                  if (result.success) {
                    toast.success('Usuário admin criado! Use: admin@emprestahelp.com / admin123456');
                    setFormData({
                      email: 'admin@emprestahelp.com',
                      password: 'admin123456'
                    });
                  } else {
                    toast.error('Erro ao criar admin: ' + result.error);
                  }
                } catch (error) {
                  toast.error('Erro na criação do admin');
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm transition-colors"
            >
              Criar Admin Automaticamente
            </button>
            <div className="mt-2 text-xs text-gray-400">
              <p>📧 Email: admin@emprestahelp.com</p>
              <p>🔑 Senha: admin123456</p>
            </div>
          </div>

          {/* Back to login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-red-300 hover:text-white text-sm transition-colors"
            >
              ← Voltar ao login normal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}