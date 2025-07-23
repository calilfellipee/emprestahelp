import React, { useState, useMemo } from 'react';
import { X, DollarSign, Percent, Calendar, User, CreditCard } from 'lucide-react';

interface LoanFormProps {
  clients: any[];
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

const LoanForm: React.FC<LoanFormProps> = ({ clients, onSubmit, onCancel }) => {
  // CORREÇÃO 1: Nomes dos campos alterados para camelCase
  const [formData, setFormData] = useState({
    clientId: '',
    type: 'loan',
    amount: '',
    interestRate: '30',
    loanDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    installments: '1',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const quickRates = [20, 30, 40, 50];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const setQuickRate = (rate: number) => {
    setFormData(prev => ({ ...prev, interestRate: rate.toString() }));
    if (errors.interestRate) {
      setErrors(prev => ({ ...prev, interestRate: '' }));
    }
  };

  // Usando useMemo para evitar recálculos desnecessários
  const loanDetails = useMemo(() => {
    const amount = parseFloat(formData.amount) || 0;
    const interestRate = parseFloat(formData.interestRate) || 0;
    const installments = parseInt(formData.installments) || 1;

    const totalAmount = amount * (1 + interestRate / 100);
    const installmentAmount = totalAmount / installments;
    const totalInterest = totalAmount - amount;

    return { totalAmount, installmentAmount, totalInterest };
  }, [formData.amount, formData.interestRate, formData.installments]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.clientId) newErrors.clientId = 'Cliente é obrigatório';
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Valor deve ser maior que zero';
    if (!formData.interestRate || parseFloat(formData.interestRate) < 0) newErrors.interestRate = 'Taxa de juros é obrigatória';
    if (!formData.loanDate) newErrors.loanDate = 'Data do empréstimo é obrigatória';
    if (!formData.dueDate) newErrors.dueDate = 'Data de vencimento é obrigatória';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // CORREÇÃO 2: Objeto enviado para a API agora usa camelCase
      const loanData = {
        clientId: formData.clientId,
        type: formData.type,
        amount: parseFloat(formData.amount),
        interestRate: parseFloat(formData.interestRate),
        loanDate: formData.loanDate,
        dueDate: formData.dueDate,
        installments: parseInt(formData.installments),
        totalAmount: loanDetails.totalAmount,
        installmentAmount: loanDetails.installmentAmount,
        status: 'active', // O schema espera minúsculas
      };
      
      await onSubmit(loanData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Novo Empréstimo</h2>
          <button onClick={onCancel} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Cliente *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                {/* CORREÇÃO 3: 'name' do input alterado para camelCase */}
                <select name="clientId" value={formData.clientId} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Selecione um cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              {errors.clientId && <p className="text-red-400 text-sm mt-1">{errors.clientId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tipo *</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select name="type" value={formData.type} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="loan">Empréstimo</option>
                  <option value="pawn">Penhora</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Valor Emprestado *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="number" name="amount" value={formData.amount} onChange={handleChange} step="0.01" className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white" placeholder="0,00" />
              </div>
              {errors.amount && <p className="text-red-400 text-sm mt-1">{errors.amount}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Taxa de Juros (%) *</label>
              <div className="space-y-2">
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="number" name="interestRate" value={formData.interestRate} onChange={handleChange} step="0.1" className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white" placeholder="30" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickRates.map((rate) => (
                    <button key={rate} type="button" onClick={() => setQuickRate(rate)} className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm">
                      {rate}%
                    </button>
                  ))}
                </div>
              </div>
              {errors.interestRate && <p className="text-red-400 text-sm mt-1">{errors.interestRate}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Data do Empréstimo *</label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="date" name="loanDate" value={formData.loanDate} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white" />
                </div>
                {errors.loanDate && <p className="text-red-400 text-sm mt-1">{errors.loanDate}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Data de Vencimento *</label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white" />
                </div>
                {errors.dueDate && <p className="text-red-400 text-sm mt-1">{errors.dueDate}</p>}
            </div>
          </div>

          <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Número de Parcelas *</label>
              <input type="number" name="installments" value={formData.installments} onChange={handleChange} min="1" className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white" placeholder="1" />
          </div>

          {formData.amount && formData.interestRate && (
            <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
              <h3 className="text-white font-medium mb-3">Resumo do Cálculo</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Total a Pagar:</p>
                  <p className="text-green-400 font-medium">R$ {loanDetails.totalAmount.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                </div>
                <div>
                  <p className="text-gray-400">Valor da Parcela:</p>
                  <p className="text-blue-400 font-medium">R$ {loanDetails.installmentAmount.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <button type="button" onClick={onCancel} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white py-3 px-4 rounded-lg">
              {isSubmitting ? 'Salvando...' : 'Salvar Empréstimo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanForm;