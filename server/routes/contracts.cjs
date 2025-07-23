const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticateToken } = require('../middleware/auth.cjs'); // CORREÇÃO DE CAMINHO
const router = express.Router();

// Rota de exemplo para listar documentos do tipo 'contract'
router.get('/', authenticateToken, async (req, res) => {
  try {
    const contracts = await prisma.loanDocument.findMany({
      where: {
        type: 'contract',
        loan: { userId: req.user.id }
      },
      include: { loan: { include: { client: true } } }
    });
    res.json(contracts);
  } catch (error) {
    console.error("Erro ao buscar contratos:", error);
    res.status(500).json({ error: "Erro ao buscar contratos" });
  }
});

module.exports = router;