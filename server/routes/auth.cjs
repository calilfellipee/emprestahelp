const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth.cjs');

const prisma = new PrismaClient();
const router = express.Router();

// Registrar usuário
router.post('/register', [
  body('name').trim().isLength({ min: 2 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email já cadastrado' });
    
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword, isAdmin: false },
      select: { id: true, name: true, email: true, isAdmin: true }
    });

    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ message: 'Usuário criado com sucesso', user: newUser, token });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Login do usuário
router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ error: 'Credenciais inválidas' });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const { password: _, ...userWithoutPassword } = user;
    res.json({ message: 'Login realizado com sucesso', user: userWithoutPassword, token });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para pegar dados do usuário logado
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// --- ROTA NOVA PARA ALTERAR SENHA ---
router.patch('/change-password', authenticateToken, [
    body('currentPassword').notEmpty().withMessage('Senha atual é obrigatória'),
    body('newPassword').isLength({ min: 6 }).withMessage('Nova senha deve ter pelo menos 6 caracteres')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        // 1. Buscar o usuário completo (com a senha) do banco
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // 2. Verificar se a senha atual está correta
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Senha atual incorreta' });
        }

        // 3. Criptografar a nova senha
        const hashedNewPassword = await bcrypt.hash(newPassword, 12);

        // 4. Atualizar o usuário no banco com a nova senha
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword }
        });

        res.json({ message: 'Senha alterada com sucesso!' });

    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;