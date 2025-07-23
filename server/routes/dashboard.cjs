const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticateToken } = require('../middleware/auth.cjs'); // CORREÇÃO DE CAMINHO
const router = express.Router();

// Rota para estatísticas do dashboard
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const totalClients = await prisma.client.count({ where: { userId } });
    const totalLoans = await prisma.loan.count({ where: { userId } });
    const activeLoans = await prisma.loan.count({ where: { userId, status: 'active' } });

    const stats = { totalClients, totalLoans, activeLoans };
    res.json(stats);
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    res.status(500).json({ error: 'Erro ao buscar dados do dashboard' });
  }
});

module.exports = router;