// server/index.cjs

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Importação de TODAS as rotas
const authRoutes = require('./routes/auth.cjs');
const userRoutes = require('./routes/users.cjs');
const clientRoutes = require('./routes/clients.cjs');
const loanRoutes = require('./routes/loans.cjs');
const paymentRoutes = require('./routes/payments.cjs');
const dashboardRoutes = require('./routes/dashboard.cjs');
const reportRoutes = require('./routes/reports.cjs');
const notificationRoutes = require('./routes/notifications.cjs');
const settingsRoutes = require('./routes/settings.cjs'); // NOVO

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir o front-end buildado
app.use(express.static(path.join(__dirname, '../../dist')));

// Registro de TODAS as rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes); // NOVO

// Rota coringa para o front-end (deve vir por último)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor EmprestaFácil rodando na porta ${PORT}`);
});