const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, isAdmin: true }
    });
    if (!user) return res.status(401).json({ error: 'Usuário não encontrado.' });
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
  next();
};

module.exports = { authenticateToken, requireAdmin };