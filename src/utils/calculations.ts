import { differenceInDays, parseISO } from 'date-fns';

// Nenhuma alteração necessária aqui, mas mantido para referência
export const calculateLoanDetails = (
  amount: number,
  interestRate: number,
  installments: number = 1
) => {
  const totalAmount = amount * (1 + interestRate / 100);
  const installmentAmount = totalAmount / installments;
  
  return {
    totalAmount,
    installmentAmount,
    totalInterest: totalAmount - amount,
  };
};

export const calculateDailyInterest = (
  principal: number,
  dailyRate: number,
  days: number
) => {
  return principal * (dailyRate / 100) * days;
};

export const calculateLateFee = (
  amount: number,
  lateFeePercentage: number
) => {
  return amount * (lateFeePercentage / 100);
};

export const calculateOverdueAmount = (
  loan: any,
  dailyInterestRate: number = 0.1,
  lateFeePercentage: number = 2
) => {
  // CORREÇÃO 1: Adicionada verificação para evitar erro com datas nulas
  if (!loan || !loan.dueDate) {
    return {
      daysOverdue: 0,
      dailyInterest: 0,
      lateFee: 0,
      totalOverdue: 0,
    };
  }

  const today = new Date();
  const dueDate = parseISO(loan.dueDate); // CORREÇÃO 2: Usa camelCase (dueDate)
  const daysOverdue = differenceInDays(today, dueDate);
  
  if (daysOverdue <= 0) {
    return {
      daysOverdue: 0,
      dailyInterest: 0,
      lateFee: 0,
      totalOverdue: 0,
    };
  }
  
  // CORREÇÃO 3: Usa camelCase (totalAmount)
  const totalPaid = loan.payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
  const remainingAmount = Number(loan.totalAmount) - totalPaid;

  if (remainingAmount <= 0) return { daysOverdue, dailyInterest: 0, lateFee: 0, totalOverdue: 0 };

  const dailyInterest = calculateDailyInterest(remainingAmount, dailyInterestRate, daysOverdue);
  const lateFee = calculateLateFee(remainingAmount, lateFeePercentage);
  
  return {
    daysOverdue,
    dailyInterest,
    lateFee,
    totalOverdue: remainingAmount + dailyInterest + lateFee,
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount || 0); // Adicionado || 0 para segurança
};

export const formatPercentage = (value: number): string => {
  return `${(value || 0).toFixed(1)}%`; // Adicionado || 0 para segurança
};