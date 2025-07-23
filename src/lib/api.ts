// src/lib/api.ts

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api'; 

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// --- API de Autenticação ---
export const authAPI = {
  login: (credentials: any) => api.post('/auth/login', credentials).then(res => res.data),
  register: (userData: any) => api.post('/auth/register', userData).then(res => res.data),
  getCurrentUser: () => api.get('/auth/me').then(res => res.data),
  changePassword: (passwordData: any) => api.patch('/auth/change-password', passwordData).then(res => res.data),
};

// --- API de Usuários ---
export const usersAPI = {
  updateProfile: (profileData: any) => api.patch('/users/profile', profileData).then(res => res.data),
};

// --- API de Clientes ---
export const clientsAPI = {
  getClients: () => api.get('/clients').then(res => res.data),
  createClient: (clientData: any) => api.post('/clients', clientData).then(res => res.data),
  updateClient: (id: string, clientData: any) => api.put(`/clients/${id}`, clientData).then(res => res.data),
  deleteClient: (id: string) => api.delete(`/clients/${id}`).then(res => res.data),
};

// --- API de Empréstimos ---
export const loansAPI = {
  getLoans: () => api.get('/loans').then(res => res.data),
  createLoan: (loanData: any) => api.post('/loans', loanData).then(res => res.data),
  updateLoan: (id: string, loanData: any) => api.put(`/loans/${id}`, loanData).then(res => res.data),
  deleteLoan: (id: string) => api.delete(`/loans/${id}`).then(res => res.data),
};

// --- API de Pagamentos ---
export const paymentsAPI = {
  createPayment: (paymentData: any) => api.post('/payments', paymentData).then(res => res.data),
};

// --- API de Relatórios ---
export const reportsAPI = {
  getReports: () => api.get('/reports').then(res => res.data),
};

// --- API de Notificações ---
export const notificationsAPI = {
  getNotifications: () => api.get('/notifications').then(res => res.data),
};

// --- API do Dashboard (Adicionada) ---
export const dashboardAPI = {
  getDashboardStats: () => api.get('/dashboard').then(res => res.data),
};

// NOVO: API de Configurações
export const settingsAPI = {
  getSettings: () => api.get('/settings').then(res => res.data),
  updateSettings: (settingsData: any) => api.patch('/settings', settingsData).then(res => res.data),
};