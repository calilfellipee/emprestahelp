const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth.cjs');
const router = express.Router();
const prisma = new PrismaClient();

router.patch('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, companyName, companyCnpj, companyAddress } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Nome e E-mail são obrigatórios.' });
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, email, companyName, companyCnpj, companyAddress },
      select: { id: true, name: true, email: true, isAdmin: true, companyName: true, companyCnpj: true, companyAddress: true }
    });
    res.json({ message: 'Perfil atualizado com sucesso!', user: updatedUser });
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Este e-mail já está em uso.' });
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

module.exports = router;