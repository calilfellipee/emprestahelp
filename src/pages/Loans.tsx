// src/pages/Loans.tsx

import React, { useState } from 'react';
import { Plus, Search, CheckCircle, Clock, AlertTriangle, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLoans } from '../hooks/useLoans';
import { useClients } from '../hooks/useClients';
import { useSettings } from '../hooks/useSettings'; // NOVO: Hook para buscar as configurações
import LoanForm from '../components/LoanForm';
import PaymentForm from '../components/PaymentForm';
import LoanDetailsModal from '../components/LoanDetailsModal';
import { formatCurrency } from '../utils/calculations';
import { generateContractPDF } from '../utils/contractGenerator'; // NOVO: Importa o gerador de PDF
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'react-toastify';

const Loans: React.FC = () => {
  const { user } = useAuth(); // NOVO: Pega o usuário logado
  const { loans, loading, addLoan, addPayment, updateLoan, deleteLoan } = useLoans();
  const { clients } = useClients();
  const { settings } = useSettings(); // NOVO: Pega as configurações salvas
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [showPaymentFormFor, setShowPaymentFormFor] = useState<string | null>(null);
  const [showDetailsFor, setShowDetailsFor] = useState<any | null>(null);

  const filteredLoans = loans.filter(loan => {
    const clientName = loan.client?.name?.toLowerCase() || '';
    const matchesSearch = clientName.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddLoan = async (loanData: any) => {
    await addLoan(loanData);
    setShowLoanForm(false);
  };

  const handleAddPayment = async (paymentData: any) => {
    await addPayment(paymentData);
    setShowPaymentFormFor(null);
  };
  
  // NOVO: Função para gerar o contrato em PDF
  const handleGenerateContract = (loan: any) => {
    const client = clients.find(c => c.id === loan.clientId);
    const contractTerms = settings?.contracts?.terms || "Termos de contrato não definidos. Por favor, configure na página de Configurações.";

    if (user && client && settings) {
      const userDataForContract = { ...user, ...settings };
      generateContractPDF(userDataForContract, client, loan, contractTerms);
    } else {
      toast.error("Dados incompletos para gerar o contrato. Verifique as configurações do perfil e da empresa.");
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active': return { text: 'Ativo', color: 'text-blue-400 bg-blue-400/20', icon: <Clock size={16} /> };
      case 'paid': return { text: 'Pago', color: 'text-green-400 bg-green-400/20', icon: <CheckCircle size={16} /> };
      case 'overdue': return { text: 'Atrasado', color: 'text-red-400 bg-red-400/20', icon: <AlertTriangle size={16} /> };
      default: return { text: 'Desconhecido', color: 'text-gray-400 bg-gray-400/20', icon: <Clock size={16} /> };
    }
  };

  if (loading) {
    return <div className="text-center p-12">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Empréstimos</h1>
        <button onClick={() => setShowLoanForm(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
          <Plus size={20} />
          <span>Novo Empréstimo</span>
        </button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Buscar por cliente..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg text-white px-4 py-3">
          <option value="all">Todos</option>
          <option value="active">Ativos</option>
          <option value="paid">Pagos</option>
          <option value="overdue">Atrasados</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredLoans.map((loan) => {
          const statusInfo = getStatusInfo(loan.status);
          const totalPaid = loan.payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
          const remaining = Number(loan.totalAmount) - totalPaid;

          return (
            <div key={loan.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{loan.client?.name || 'Cliente Removido'}</h3>
                  <span className={`inline-flex items-center gap-2 px-3 py-1 mt-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                    {statusInfo.icon} {statusInfo.text}
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {/* BOTÃO DE CONTRATO ADICIONADO E FUNCIONAL */}
                  <button onClick={() => handleGenerateContract(loan)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm">
                    <FileText size={16} /> Contrato
                  </button>
                  <button onClick={() => setShowPaymentFormFor(loan.id)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm">Pagamento</button>
                  <button onClick={() => setShowDetailsFor(loan)} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm">Ver Detalhes</button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4 pt-4 border-t border-gray-700">
                <div><p className="text-gray-400">Total a Pagar</p><p className="font-medium text-white">{formatCurrency(Number(loan.totalAmount))}</p></div>
                <div><p className="text-gray-400">Total Pago</p><p className="font-medium text-green-400">{formatCurrency(totalPaid)}</p></div>
                <div><p className="text-gray-400">Restante</p><p className="font-medium text-yellow-400">{formatCurrency(remaining)}</p></div>
                <div><p className="text-gray-400">Vencimento</p><p className="font-medium text-white">{loan.dueDate ? format(new Date(loan.dueDate), 'dd/MM/yyyy', { locale: ptBR }) : '-'}</p></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modais */}
      {showLoanForm && <LoanForm clients={clients} onSubmit={handleAddLoan} onCancel={() => setShowLoanForm(false)} />}
      
      {showPaymentFormFor && (
        <PaymentForm 
          loanId={showPaymentFormFor}
          totalAmount={Number(loans.find(l => l.id === showPaymentFormFor)?.totalAmount) || 0}
          totalPaid={loans.find(l => l.id === showPaymentFormFor)?.payments.reduce((s: number, p: any) => s + Number(p.amount), 0) || 0}
          onSubmit={handleAddPayment}
          onCancel={() => setShowPaymentFormFor(null)}
        />
      )}

      {showDetailsFor && (
        <LoanDetailsModal
          loan={showDetailsFor}
          onClose={() => setShowDetailsFor(null)}
          onUpdate={updateLoan}
          onDelete={deleteLoan}
        />
      )}
    </div>
  );
};

export default Loans;