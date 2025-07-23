import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Lock, Bell, Database, Shield, MessageSquare, FileText, DollarSign } from 'lucide-react';
import { toast } from 'react-toastify';
import { authAPI, settingsAPI } from '../lib/api';

// --- Componente Principal ---
const Settings: React.FC = () => {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [settingsData, setSettingsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Carrega as configurações do backend
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const data = await settingsAPI.getSettings();
        setSettingsData({
          ...data,
          notifications: data.notifications || {},
          financial: data.financial || {},
          contracts: data.contracts || {},
          whatsapp: data.whatsapp || {},
          system: data.system || {},
        });
      } catch (error) {
        toast.error('Erro ao carregar configurações.');
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  // Função genérica para atualizar o estado
  const handleChange = (path: string, value: any) => {
    setSettingsData((prev: any) => {
      const keys = path.split('.');
      if (keys.length === 1) {
        return { ...prev, [keys[0]]: value };
      } else {
        return { ...prev, [keys[0]]: { ...(prev[keys[0]] || {}), [keys[1]]: value } };
      }
    });
  };

  const handleSave = async () => {
    if (!settingsData) return;
    setLoading(true);
    try {
      const response = await settingsAPI.updateSettings(settingsData);
      const { name, email, companyName, companyCnpj, companyAddress } = settingsData;
      setUser(prev => prev ? { ...prev, name, email, companyName, companyCnpj, companyAddress } : null);
      toast.success(response.message);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar.');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !settingsData) {
    return <div className="text-center p-12">Carregando...</div>;
  }
  
  const tabs = [
    { id: 'profile', label: 'Perfil e Empresa', icon: User },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'contracts', label: 'Contratos', icon: FileText },
    { id: 'financial', label: 'Financeiro', icon: DollarSign },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
    { id: 'system', label: 'Sistema', icon: Database },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return <ProfileTab settings={settingsData} onChange={(k,v) => handleChange(k,v)} />;
      case 'security': return <SecurityTab />;
      case 'contracts': return <ContractsTab />;
      case 'financial': return <FinancialTab settings={settingsData.financial} onChange={(k,v) => handleChange('financial.'+k, v)} />;
      case 'notifications': return <NotificationsTab settings={settingsData.notifications} onChange={(k,v) => handleChange('notifications.'+k, v)} />;
      case 'whatsapp': return <WhatsAppTab settings={{...settingsData.whatsapp, whatsappApiToken: settingsData.whatsappApiToken}} onChange={(k,v) => handleChange(k,v)} />;
      case 'system': return <SystemTab settings={settingsData.system} onChange={(k,v) => handleChange('system.'+k, v)} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Configurações</h1>
          <p className="text-gray-400">Gerencie suas preferências e configurações do sistema</p>
        </div>
        <button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
          {loading ? 'Salvando...' : 'Salvar Todas as Configurações'}
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 bg-gray-800 rounded-xl p-4 border border-gray-700 self-start">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                  <tab.icon size={20} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
        </div>
        <div className="lg:col-span-3 bg-gray-800 rounded-xl p-6 border border-gray-700">
            {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

// --- Componentes das Abas ---

const ProfileTab: React.FC<{ settings: any, onChange: (k: string, v: any) => void }> = ({ settings, onChange }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold text-white">Perfil e Empresa</h3>
    <p className="text-sm text-gray-400">As informações preenchidas aqui serão usadas para gerar os contratos.</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div><label className="block text-sm text-gray-300 mb-1">Seu Nome Completo</label><input name="name" type="text" value={settings.name || ''} onChange={(e) => onChange(e.target.name, e.target.value)} className="w-full bg-gray-700 p-2 rounded" /></div>
      <div><label className="block text-sm text-gray-300 mb-1">Seu E-mail</label><input name="email" type="email" value={settings.email || ''} onChange={(e) => onChange(e.target.name, e.target.value)} className="w-full bg-gray-700 p-2 rounded" /></div>
      <div><label className="block text-sm text-gray-300 mb-1">Nome da Empresa/Credor</label><input name="companyName" type="text" value={settings.companyName || ''} onChange={(e) => onChange(e.target.name, e.target.value)} className="w-full bg-gray-700 p-2 rounded" /></div>
      <div><label className="block text-sm text-gray-300 mb-1">CNPJ/CPF</label><input name="companyCnpj" type="text" value={settings.companyCnpj || ''} onChange={(e) => onChange(e.target.name, e.target.value)} className="w-full bg-gray-700 p-2 rounded" /></div>
      <div className="md:col-span-2"><label className="block text-sm text-gray-300 mb-1">Endereço Completo</label><input name="companyAddress" type="text" value={settings.companyAddress || ''} onChange={(e) => onChange(e.target.name, e.target.value)} className="w-full bg-gray-700 p-2 rounded" /></div>
    </div>
  </div>
);

const SecurityTab: React.FC = () => {
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setPasswords({ ...passwords, [e.target.name]: e.target.value });
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (passwords.newPassword !== passwords.confirmPassword) return toast.error('As novas senhas não coincidem.');
      setLoading(true);
      try {
        const response = await authAPI.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
        toast.success(response.message);
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Erro ao alterar a senha.');
      } finally {
        setLoading(false);
      }
    };
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <h3 className="text-xl font-semibold text-white">Alterar Senha</h3>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-300 mb-2">Senha Atual</label><input type="password" name="currentPassword" value={passwords.currentPassword} onChange={handleChange} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white" required /></div>
          <div><label className="block text-sm font-medium text-gray-300 mb-2">Nova Senha</label><input type="password" name="newPassword" value={passwords.newPassword} onChange={handleChange} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white" required /></div>
          <div><label className="block text-sm font-medium text-gray-300 mb-2">Confirmar Nova Senha</label><input type="password" name="confirmPassword" value={passwords.confirmPassword} onChange={handleChange} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white" required /></div>
        </div>
        <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
          {loading ? 'Salvando...' : 'Alterar Senha'}
        </button>
      </form>
    );
};

const ContractsTab: React.FC = () => (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold text-white">Modelo de Contrato</h3>
    <p className="text-gray-300">O sistema utiliza um modelo de contrato padrão. As informações da sua empresa, preenchidas na aba **"Perfil e Empresa"**, serão usadas como os dados do "CREDOR" no contrato.</p>
  </div>
);

const FinancialTab: React.FC<{ settings: any, onChange: (k: string, v: any) => void }> = ({ settings, onChange }) => (
  <div className="space-y-6">
     <h3 className="text-xl font-semibold text-white">Financeiro</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className="block text-sm text-gray-300 mb-1">Juros Padrão (%)</label><input name="defaultInterestRate" type="number" value={settings.defaultInterestRate || ''} onChange={(e) => onChange(e.target.name, e.target.value)} className="w-full bg-gray-700 p-2 rounded" /></div>
        <div><label className="block text-sm text-gray-300 mb-1">Juros Atraso (%/dia)</label><input name="dailyInterestRate" type="number" value={settings.dailyInterestRate || ''} onChange={(e) => onChange(e.target.name, e.target.value)} className="w-full bg-gray-700 p-2 rounded" /></div>
        <div><label className="block text-sm text-gray-300 mb-1">Multa Atraso (%)</label><input name="lateFeePercentage" type="number" value={settings.lateFeePercentage || ''} onChange={(e) => onChange(e.target.name, e.target.value)} className="w-full bg-gray-700 p-2 rounded" /></div>
      </div>
  </div>
);

const NotificationsTab: React.FC<{ settings: any, onChange: (k: string, v: any) => void }> = ({ settings, onChange }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold text-white">Notificações</h3>
      <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
        <div><h4 className="text-white font-medium">Alertas de Vencimento</h4><p className="text-gray-400 text-sm">Receber alertas para empréstimos vencendo</p></div>
        <input type="checkbox" checked={settings.dueSoonAlerts ?? true} onChange={(e) => onChange('dueSoonAlerts', e.target.checked)} />
     </div>
  </div>
);

const WhatsAppTab: React.FC<{ settings: any, onChange: (k: string, v: any) => void }> = ({ settings, onChange }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold text-white">WhatsApp</h3>
    <div>
      <label className="block text-sm text-gray-300 mb-1">Token da API do WhatsApp (opcional)</label>
      <input name="whatsappApiToken" type="password" value={settings.whatsappApiToken || ''} onChange={(e) => onChange(e.target.name, e.target.value)} className="w-full bg-gray-700 p-2 rounded" />
    </div>
  </div>
);

const SystemTab: React.FC<{ settings: any, onChange: (k: string, v: any) => void }> = ({ settings, onChange }) => (
    <div className="space-y-6">
        <h3 className="text-xl font-semibold text-white">Sistema</h3>
        <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
            <div><h4 className="text-white font-medium">Modo Escuro</h4></div>
            <input type="checkbox" checked={settings.darkMode ?? true} onChange={(e) => onChange('darkMode', e.target.checked)} />
        </div>
        <div className="space-x-2">
            <button onClick={() => toast.info("Funcionalidade em desenvolvimento")} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">Fazer Backup</button>
            <button onClick={() => toast.info("Funcionalidade em desenvolvimento")} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">Resetar Sistema</button>
        </div>
    </div>
);

export default Settings;