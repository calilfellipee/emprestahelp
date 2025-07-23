import { useState, useEffect, useCallback } from 'react';
import { loansAPI, paymentsAPI } from '../lib/api';
import { toast } from 'react-toastify';

export const useLoans = () => {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLoans = useCallback(async () => {
    try {
      setLoading(true);
      const data = await loansAPI.getLoans(); // CORREÇÃO: Nome da função
      setLoans(data || []);
    } catch (error: any) {
      console.error('Error loading loans:', error);
      toast.error('Erro ao carregar empréstimos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLoans();
  }, [loadLoans]);

  const addLoan = async (loanData: any) => {
    try {
      await loansAPI.createLoan(loanData); // CORREÇÃO: Nome da função
      await loadLoans();
      toast.success('Empréstimo criado com sucesso!');
    } catch (error: any) {
      console.error('Error creating loan:', error);
      toast.error(error.response?.data?.error || 'Erro ao criar empréstimo');
      throw error;
    }
  };

  const addPayment = async (paymentData: any) => {
    try {
      await paymentsAPI.createPayment(paymentData); // CORREÇÃO: API e nome da função
      await loadLoans();
      toast.success('Pagamento registrado com sucesso!');
    } catch (error: any) {
      console.error('Error adding payment:', error);
      toast.error(error.response?.data?.error || 'Erro ao registrar pagamento');
      throw error;
    }
  };

  const updateLoanStatus = async (loanId: string, status: string) => {
    try {
      await loansAPI.updateLoanStatus(loanId, status); // CORREÇÃO: Nome da função
      await loadLoans();
      toast.success('Status atualizado com sucesso!');
    } catch (error: any) {
      console.error('Error updating loan status:', error);
      toast.error(error.response?.data?.error || 'Erro ao atualizar status');
      throw error;
    }
  };

  return {
    loans,
    loading,
    addLoan,
    addPayment,
    updateLoanStatus,
    refreshLoans: loadLoans,
  };
};