import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  FileText,
  CheckCircle
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { useDashboard } from '../hooks/useDashboard';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { stats, loading } = useDashboard();

  const StatCard: React.FC<{
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
    trend?: string;
    trendColor?: string;
  }> = ({ title, value, icon, color, trend, trendColor = 'text-green-400' }) => (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {trend && (
            <p className={`text-sm mt-1 flex items-center ${trendColor}`}>
              <TrendingUp size={16} className="mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  const pieData = [
    { name: 'Ativos', value: stats?.activeLoans || 0, color: '#3B82F6' },
    { name: 'Quitados', value: stats?.closedLoans || 0, color: '#10B981' },
    { name: 'Atrasados', value: stats?.overdueLoans || 0, color: '#EF4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Olá, {user?.name}! 👋
          </h1>
          <p className="text-gray-400">
            Aqui está o resumo do seu negócio
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Emprestado"
          value={`R$ ${(stats?.totalLoaned || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<DollarSign className="w-6 h-6 text-white" />}
          color="bg-blue-600"
        />
        <StatCard
          title="Total Recebido"
          value={`R$ ${(stats?.totalReceived || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          color="bg-green-600"
        />
        <StatCard
          title="Lucro Líquido"
          value={`R$ ${(stats?.netProfit || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          color="bg-purple-600"
        />
        <StatCard
          title="Empréstimos Ativos"
          value={(stats?.activeLoans || 0).toString()}
          icon={<FileText className="w-6 h-6 text-white" />}
          color="bg-indigo-600"
        />
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Empréstimos Atrasados"
          value={(stats?.overdueLoans || 0).toString()}
          icon={<AlertTriangle className="w-6 h-6 text-white" />}
          color="bg-red-600"
          trend={stats?.overdueLoans ? "Requer atenção" : "Nenhum atraso"}
          trendColor={stats?.overdueLoans ? "text-red-400" : "text-green-400"}
        />
        <StatCard
          title="Total de Clientes"
          value={(stats?.totalClients || 0).toString()}
          icon={<Users className="w-6 h-6 text-white" />}
          color="bg-teal-600"
        />
        <StatCard
          title="Empréstimos Quitados"
          value={(stats?.closedLoans || 0).toString()}
          icon={<CheckCircle className="w-6 h-6 text-white" />}
          color="bg-green-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-semibold text-white mb-4">
            Distribuição dos Empréstimos
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#374151',
                    border: '1px solid #4B5563',
                    borderRadius: '8px',
                    color: '#F9FAFB',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-300 text-sm">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Performance */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-semibold text-white mb-4">
            Performance Mensal
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.monthlyData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="month" 
                  stroke="#9CA3AF"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { month: 'short' })}
                />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#374151',
                    border: '1px solid #4B5563',
                    borderRadius: '8px',
                    color: '#F9FAFB',
                  }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                />
                <Bar dataKey="loaned" fill="#3B82F6" name="Emprestado" radius={[4, 4, 0, 0]} />
                <Bar dataKey="received" fill="#10B981" name="Recebido" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <h3 className="text-xl font-semibold text-white mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/clients"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-4 rounded-xl transition-all duration-200 transform hover:scale-105 text-left"
          >
            <Users className="w-6 h-6 mb-2" />
            <div className="font-medium">Novo Cliente</div>
            <div className="text-sm opacity-80">Cadastrar cliente</div>
          </Link>
          <Link
            to="/loans"
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white p-4 rounded-xl transition-all duration-200 transform hover:scale-105 text-left"
          >
            <FileText className="w-6 h-6 mb-2" />
            <div className="font-medium">Novo Empréstimo</div>
            <div className="text-sm opacity-80">Criar empréstimo</div>
          </Link>
          <Link
            to="/reports"
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white p-4 rounded-xl transition-all duration-200 transform hover:scale-105 text-left"
          >
            <TrendingUp className="w-6 h-6 mb-2" />
            <div className="font-medium">Relatórios</div>
            <div className="text-sm opacity-80">Ver análises</div>
          </Link>
          <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white p-4 rounded-xl text-left opacity-75">
            <DollarSign className="w-6 h-6 mb-2" />
            <div className="font-medium">Sistema Local</div>
            <div className="text-sm opacity-80">PostgreSQL</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;