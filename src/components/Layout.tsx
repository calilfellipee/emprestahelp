import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  DollarSign, 
  BarChart3, 
  Settings, 
  Menu,
  X,
  Bell,
  Building2,
  LogOut // Ícone de Sair
} from 'lucide-react';
import { useState } from 'react';
import NotificationCenter from './NotificationCenter';
import { useLoans } from '../hooks/useLoans';
import { useAuth } from '../contexts/AuthContext'; // Importar useAuth

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { loans } = useLoans();
  const { logout } = useAuth(); // Pegar a função de logout

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const getNotificationCount = () => {
    if (!loans) return 0;
    const today = new Date();
    return loans.filter(loan => {
      if (loan.status === 'paid' || !loan.dueDate) return false;
      const dueDate = new Date(loan.dueDate);
      const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDue <= 3;
    }).length;
  };

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Clientes', path: '/clients' },
    { icon: DollarSign, label: 'Empréstimos', path: '/loans' },
    { icon: BarChart3, label: 'Relatórios', path: '/reports' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-blue-400">LoanSaaS</h1>
            <p className="text-gray-400 text-xs">Plataforma Multi-tenant</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button key={item.path} onClick={() => { navigate(item.path); setSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      {/* BOTÃO DE SAIR ADICIONADO AQUI */}
      <div className="p-4">
        <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-800/50 hover:text-white transition-colors">
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      <div className="fixed top-4 right-4 z-50">
        <button onClick={() => setNotificationOpen(true)} className="relative p-2 rounded-lg bg-gray-800 hover:bg-gray-700">
          <Bell size={24} className="text-white" />
          {getNotificationCount() > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {getNotificationCount()}
            </span>
          )}
        </button>
      </div>
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <SidebarContent />
      </div>
      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className="lg:ml-64 min-h-screen">
        <main className="p-6 pt-20 lg:pt-6">{children}</main>
      </div>
      <NotificationCenter isOpen={notificationOpen} onClose={() => setNotificationOpen(false)} />
    </div>
  );
};

export default Layout;