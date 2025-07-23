// server/routes/settings.cjs

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth.cjs');

const router = express.Router();
const prisma = new PrismaClient();

// Rota para BUSCAR todas as configurações do usuário
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, companyName: true, companyCnpj: true, companyAddress: true, whatsappApiToken: true }
    });
    
    const systemSettings = await prisma.systemSetting.findMany({
      where: { userId: userId }
    });

    const settingsObject = systemSettings.reduce((obj, item) => {
      obj[item.key] = item.value;
      return obj;
    }, {});
    
    const allSettings = { ...userProfile, ...settingsObject };
    res.json(allSettings);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar configurações' });
  }
});

// Rota para SALVAR todas as configurações
router.patch('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const allSettings = req.body;

    const { name, email, companyName, companyCnpj, companyAddress, whatsappApiToken, ...systemSettings } = allSettings;

    // Atualiza os dados na tabela User
    await prisma.user.update({
      where: { id: userId },
      data: { name, email, companyName, companyCnpj, companyAddress, whatsappApiToken }
    });

    // Atualiza os dados na tabela SystemSetting
    const settingPromises = Object.entries(systemSettings).map(([key, value]) => {
      return prisma.systemSetting.upsert({
        where: { userId_key: { userId, key } },
        update: { value: value ?? {} },
        create: { userId, key, value: value ?? {} }
      });
    });

    await Promise.all(settingPromises);
    res.json({ message: 'Configurações salvas com sucesso!' });
  } catch (error) {
    console.error("Erro ao salvar configurações:", error);
    res.status(500).json({ error: 'Erro ao salvar configurações' });
  }
});

module.exports = router;