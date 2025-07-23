// server/routes/payments.cjs
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticateToken } = require('../middleware/auth.cjs');
const router = express.Router();

// Criar um novo pagamento
router.post('/', authenticateToken, async (req, res) => {
    const { loanId, amount, notes, paymentDate } = req.body;
    
    if (!loanId || !amount || !paymentDate) {
        return res.status(400).json({ error: "Campos obrigatórios faltando." });
    }

    try {
        const payment = await prisma.payment.create({
            data: {
                loanId,
                userId: req.user.id,
                amount: parseFloat(amount),
                notes,
                paymentDate: new Date(paymentDate),
            }
        });

        // Opcional: Recalcular e atualizar status do empréstimo
        const loan = await prisma.loan.findUnique({
            where: { id: loanId },
            include: { payments: true }
        });

        if (loan) {
            const totalPaid = loan.payments.reduce((sum, p) => sum + Number(p.amount), 0);
            if (totalPaid >= Number(loan.totalAmount)) {
                await prisma.loan.update({
                    where: { id: loanId },
                    data: { status: 'paid' }
                });
            }
        }

        res.status(201).json(payment);
    } catch (error) {
        console.error("Erro ao criar pagamento:", error);
        res.status(500).json({ error: "Erro ao criar pagamento" });
    }
});

module.exports = router;