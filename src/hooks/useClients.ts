import { useState, useEffect, useCallback } from 'react';
import { clientsAPI } from '../lib/api';
import { toast } from 'react-toastify';

export const useClients = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      const data = await clientsAPI.getClients(); // CORREÇÃO: Nome da função
      setClients(data || []);
    } catch (error: any) {
      console.error('Error loading clients:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const addClient = async (clientData: any) => {
    try {
      await clientsAPI.createClient(clientData); // CORREÇÃO: Nome da função
      await loadClients(); // Recarrega a lista para mostrar o novo cliente
      toast.success('Cliente cadastrado com sucesso!');
    } catch (error: any) {
      console.error('Error creating client:', error);
      toast.error(error.response?.data?.error || 'Erro ao cadastrar cliente');
      throw error;
    }
  };

  const updateClient = async (id: string, updates: any) => {
    try {
      await clientsAPI.updateClient(id, updates); // CORREÇÃO: Nome da função
      await loadClients(); // Recarrega a lista
      toast.success('Cliente atualizado com sucesso!');
    } catch (error: any) {
      console.error('Error updating client:', error);
      toast.error(error.response?.data?.error || 'Erro ao atualizar cliente');
      throw error;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      await clientsAPI.deleteClient(id); // CORREÇÃO: Nome da função
      await loadClients(); // Recarrega a lista
      toast.success('Cliente excluído com sucesso!');
    } catch (error: any) {
      console.error('Error deleting client:', error);
      toast.error(error.response?.data?.error || 'Erro ao excluir cliente');
      throw error;
    }
  };

  return {
    clients,
    loading,
    addClient,
    updateClient,
    deleteClient,
    refreshClients: loadClients,
  };
};