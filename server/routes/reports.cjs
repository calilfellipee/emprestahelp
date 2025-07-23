const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth.cjs');
const { subMonths, format } = require('date-fns');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const sixMonthsAgo = subMonths(new Date(), 6);

    // 1. Métricas Principais
    const loans = await prisma.loan.findMany({ where: { userId } });
    const payments = await prisma.payment.findMany({ where: { userId } });
    const activeClients = await prisma.client.count({ where: { userId, isActive: true } });

    const totalEmprestado = loans.reduce((sum, loan) => sum + Number(loan.amount), 0);
    const totalRecebido = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const lucroLiquido = totalRecebido - totalEmprestado;

    // 2. Distribuição por Status
    const statusDistribution = await prisma.loan.groupBy({
      by: ['status'],
      where: { userId },
      _count: { _all: true },
    });

    const distribuicaoPorStatus = {
      ativos: statusDistribution.find(s => s.status === 'active')?._count._all || 0,
      pagos: statusDistribution.find(s => s.status === 'paid')?._count._all || 0,
      atrasados: statusDistribution.find(s => s.status === 'overdue')?._count._all || 0,
    };

    // 3. Performance Mensal (últimos 6 meses)
    const monthlyLoans = await prisma.loan.findMany({
      where: { userId, createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true, amount: true }
    });
    
    const monthlyPayments = await prisma.payment.findMany({
      where: { userId, createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true, amount: true }
    });

    const performanceMensal = {};
    for (let i = 5; i >= 0; i--) {
      const monthKey = format(subMonths(new Date(), i), 'MMM');
      performanceMensal[monthKey] = { emprestado: 0, recebido: 0 };
    }
    
    monthlyLoans.forEach(loan => {
      const monthKey = format(new Date(loan.createdAt), 'MMM');
      if (performanceMensal[monthKey]) {
        performanceMensal[monthKey].emprestado += Number(loan.amount);
      }
    });

    monthlyPayments.forEach(payment => {
      const monthKey = format(new Date(payment.createdAt), 'MMM');
       if (performanceMensal[monthKey]) {
        performanceMensal[monthKey].recebido += Number(payment.amount);
      }
    });

    // 4. Relatório por Cliente
    const clientsWithLoans = await prisma.client.findMany({
      where: { userId, isActive: true },
      include: {
        loans: {
          select: { totalAmount: true, status: true }
        }
      }
    });

    const relatorioCliente = clientsWithLoans.map(client => {
      const valorTotal = client.loans.reduce((sum, l) => sum + Number(l.totalAmount), 0);
      const hasOverdue = client.loans.some(l => l.status === 'overdue');
      const allPaid = client.loans.every(l => l.status === 'paid');
      let status = 'Ativo';
      if (client.loans.length > 0 && allPaid) status = 'Pago';
      if (hasOverdue) status = 'Atrasado';

      return {
        cliente: client.name,
        emprestimos: client.loans.length,
        valorTotal,
        status
      };
    }).sort((a, b) => b.valorTotal - a.valorTotal);

    res.json({
      metricas: { totalEmprestado, totalRecebido, lucroLiquido, clientesAtivos },
      distribuicaoPorStatus,
      performanceMensal: Object.entries(performanceMensal).map(([name, values]) => ({ name, ...values })),
      relatorioCliente
    });

  } catch (error) {
    console.error("Erro ao buscar dados dos relatórios:", error);
    res.status(500).json({ error: 'Erro ao processar relatórios' });
  }
});

module.exports = router;