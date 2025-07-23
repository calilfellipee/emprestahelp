// src/components/PaymentForm.tsx

import React, { useState } from 'react';
import { X, DollarSign, Calendar, MessageSquare } from 'lucide-react';
import { toast } from 'react-toastify';

interface PaymentFormProps {
  loanId: string;
  totalAmount: number;
  totalPaid: number;
  onSubmit: (paymentData: any) => Promise<void>;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ loanId, totalAmount, totalPaid, onSubmit, onCancel }) => {
  const remainingAmount = totalAmount - totalPaid;
  const [amount, setAmount] = useState(remainingAmount > 0 ? remainingAmount.toFixed(2) : '0.00');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast.error('O valor do pagamento deve ser maior que zero.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        loanId,
        amount: paymentAmount,
        paymentDate,
        notes,
      });
      onCancel(); // Fecha o modal após o sucesso
    } catch (error) {
      // O erro já é tratado no hook, aqui apenas paramos o loading
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Registrar Pagamento</h2>
          <button onClick={onCancel} className="p-2 text-gray-400 hover:text-white rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Valor do Pagamento *</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="0,00"
                required
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Restante: R$ {remainingAmount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Data do Pagamento *</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Anotações (Opcional)</label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-4 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="Ex: Pagamento parcial, adiantamento..."
              />
            </div>
          </div>
          <div className="flex space-x-4 pt-4">
            <button type="button" onClick={onCancel} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white py-3 rounded-lg">
              {isSubmitting ? 'Salvando...' : 'Salvar Pagamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;