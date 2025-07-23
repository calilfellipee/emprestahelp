import { useState, useEffect, useCallback } from 'react';
import { notificationsAPI } from '../lib/api';
import { differenceInDays } from 'date-fns';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificationsAPI.getNotifications(); // CORREÇÃO: Nome da função
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const generateLoanNotifications = (loans: any[]) => {
    const today = new Date();
    const generatedNotifications: any[] = [];
    if (!loans) return [];

    loans.forEach(loan => {
      if (loan.status === 'paid') return;
      
      // CORREÇÃO: Nome do campo no schema é 'dueDate'
      const dueDate = new Date(loan.dueDate); 
      const daysUntilDue = differenceInDays(dueDate, today);
      
      let type = '';
      let message = '';

      if (daysUntilDue < 0) {
        type = 'overdue_alert';
        message = `Empréstimo atrasado há ${Math.abs(daysUntilDue)} dias`;
      } else if (daysUntilDue <= 3) {
        type = 'due_reminder';
        message = daysUntilDue === 0 ? 'Empréstimo vence hoje' : `Empréstimo vence em ${daysUntilDue} dias`;
      }

      if (type) {
        generatedNotifications.push({
          id: `${loan.id}-${type}`,
          loan_id: loan.id,
          type,
          message,
          client: loan.client,
          loan,
          priority: daysUntilDue < 0 ? 'high' : 'medium',
        });
      }
    });

    return generatedNotifications.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  };

  return {
    notifications,
    loading,
    generateLoanNotifications,
    refreshNotifications: loadNotifications,
  };
};