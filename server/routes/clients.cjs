const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticateToken } = require('../middleware/auth.cjs'); // CORREÇÃO DE CAMINHO

const router = express.Router();

// Get all clients for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { loans: true }
        }
      }
    });
    res.json(clients);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

// Create client
router.post('/', authenticateToken, [
  body('name').trim().isLength({ min: 2 }),
  body('phone').notEmpty(),
  body('address').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const clientData = { ...req.body, userId: req.user.id };
    const newClient = await prisma.client.create({ data: clientData });
    res.status(201).json(newClient);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ error: 'Erro ao criar cliente' });
  }
});

// Update client
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const updatedClient = await prisma.client.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: req.body
    });
    if (updatedClient.count === 0) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json({ message: 'Cliente atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
});

// Delete client
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const deletedClient = await prisma.client.deleteMany({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (deletedClient.count === 0) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json({ message: 'Cliente excluído com sucesso' });
  } catch (error) {
    if (error.code === 'P2003') { // Erro de restrição de chave estrangeira
       return res.status(400).json({ error: 'Não é possível excluir cliente com empréstimos ou outros registros associados.' });
    }
    console.error('Erro ao excluir cliente:', error);
    res.status(500).json({ error: 'Erro ao excluir cliente' });
  }
});

module.exports = router;