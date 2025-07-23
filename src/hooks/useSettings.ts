// src/hooks/useSettings.ts
import { useState, useEffect, useCallback } from 'react';
import { settingsAPI } from '../lib/api';
import { toast } from 'react-toastify';

export const useSettings = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await settingsAPI.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Erro ao carregar configurações do usuário.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return { settings, loading, refreshSettings: loadSettings };
};