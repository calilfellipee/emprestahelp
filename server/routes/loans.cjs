const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticateToken } = require('../middleware/auth.cjs');

const router = express.Router();

// Get all loans (com pagamentos)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const loans = await prisma.loan.findMany({
      where: { userId: req.user.id },
      include: { 
        client: { select: { name: true } },
        payments: true 
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(loans);
  } catch (error) {
    console.error('Erro ao buscar empréstimos:', error);
    res.status(500).json({ error: 'Erro ao buscar empréstimos' });
  }
});

// Create loan
router.post('/', authenticateToken, [
  body('clientId').notEmpty(),
  body('amount').isNumeric(),
  body('interestRate').isNumeric(),
  body('loanDate').isISO8601(),
  body('dueDate').isISO8601(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const lastLoan = await prisma.loan.findFirst({
      where: { userId: req.user.id },
      orderBy: { loanNumber: 'desc' },
    });
    const newLoanNumber = lastLoan ? lastLoan.loanNumber + 1 : 1;
    
    const data = req.body;
    const loanData = {
      ...data,
      loanNumber: newLoanNumber,
      amount: parseFloat(data.amount),
      interestRate: parseFloat(data.interestRate),
      totalAmount: parseFloat(data.totalAmount),
      installmentAmount: parseFloat(data.installmentAmount),
      installments: parseInt(data.installments),
      loanDate: new Date(data.loanDate),
      dueDate: new Date(data.dueDate),
      userId: req.user.id
    };

    const newLoan = await prisma.loan.create({ data: loanData });
    res.status(201).json(newLoan);
  } catch (error) {
    console.error("Erro ao criar empréstimo:", error);
    res.status(500).json({ error: 'Erro ao criar empréstimo' });
  }
});

// Update loan
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const dataToUpdate = {};
        
        if (data.amount !== undefined) dataToUpdate.amount = parseFloat(data.amount);
        if (data.interestRate !== undefined) dataToUpdate.interestRate = parseFloat(data.interestRate);
        if (data.dueDate !== undefined) dataToUpdate.dueDate = new Date(data.dueDate);
        if (data.status !== undefined) dataToUpdate.status = data.status;

        if (data.amount !== undefined || data.interestRate !== undefined) {
          const currentLoan = await prisma.loan.findUnique({ where: { id } });
          const newAmount = dataToUpdate.amount || Number(currentLoan.amount);
          const newInterestRate = dataToUpdate.interestRate || Number(currentLoan.interestRate);
          
          dataToUpdate.totalAmount = newAmount * (1 + newInterestRate / 100);
          dataToUpdate.installmentAmount = dataToUpdate.totalAmount / currentLoan.installments;
        }

        const updatedLoan = await prisma.loan.updateMany({
            where: { id, userId: req.user.id },
            data: dataToUpdate
        });

        if (updatedLoan.count === 0) return res.status(404).json({ error: 'Empréstimo não encontrado' });
        
        const loan = await prisma.loan.findUnique({ where: { id } });
        res.json({ message: 'Empréstimo atualizado com sucesso', loan });
    } catch (error) {
        console.error("Erro ao atualizar empréstimo:", error);
        res.status(500).json({ error: 'Erro ao atualizar empréstimo' });
    }
});

// Delete loan
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.payment.deleteMany({ where: { loanId: id } }); 
        const deletedLoan = await prisma.loan.deleteMany({ where: { id, userId: req.user.id } });
        
        if (deletedLoan.count === 0) return res.status(404).json({ error: 'Empréstimo não encontrado' });
        res.json({ message: 'Empréstimo excluído com sucesso' });
    } catch (error) {
        console.error("Erro ao excluir empréstimo:", error);
        res.status(500).json({ error: 'Erro ao excluir empréstimo' });
    }
});

module.exports = router;