// server/routes/notifications.cjs

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth.cjs');

const router = express.Router();
const prisma = new PrismaClient();

// Rota para buscar todas as notificações do usuário logado
router.get('/', authenticateToken, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 100 // Limita às 100 notificações mais recentes para performance
    });
    res.json(notifications);
  } catch (error) {
    console.error("Erro ao buscar notificações:", error);
    res.status(500).json({ error: "Erro ao buscar notificações" });
  }
});

module.exports = router;