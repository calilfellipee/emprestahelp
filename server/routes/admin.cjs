const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireAdmin } = require('../middleware/auth.cjs'); // CORREÇÃO DE CAMINHO

const router = express.Router();
const prisma = new PrismaClient();

// Get all users (admin only)
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        isAdmin: true,
        createdAt: true,
        _count: {
          select: {
            clients: true,
            loans: true,
            payments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// Get platform statistics
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalClients,
      totalLoans,
      totalPaymentsSum
    ] = await Promise.all([
      prisma.user.count(),
      prisma.client.count(),
      prisma.loan.count(),
      prisma.payment.aggregate({ _sum: { amount: true } })
    ]);
    res.json({
      users: { total: totalUsers },
      platform: {
        totalClients,
        totalLoans,
        totalRevenue: totalPaymentsSum._sum.amount || 0
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// Update user plan (admin only)
router.patch('/users/:id/plan', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { plan } = req.body;
    if (!['free', 'pro', 'premium'].includes(plan)) {
      return res.status(400).json({ error: 'Plano inválido' });
    }
    const user = await prisma.user.update({
      where: { id },
      data: { plan },
      select: { id: true, name: true, email: true, plan: true }
    });
    res.json({ message: 'Plano do usuário atualizado', user });
  } catch (error) {
    console.error('Update user plan error:', error);
    res.status(500).json({ error: 'Erro ao atualizar plano do usuário' });
  }
});

module.exports = router;