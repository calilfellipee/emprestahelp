import express from 'express'
import { 
  createUser, 
  getUserByEmail, 
  comparePassword, 
  generateToken,
  getUserById 
} from '../../lib/database.js'

const router = express.Router()

// Registro
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body

    // Validações
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' })
    }

    // Verificar se usuário já existe
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return res.status(400).json({ error: 'E-mail já cadastrado' })
    }

    // Criar usuário
    const user = await createUser(email, password, name)
    const token = generateToken(user.id)

    // Remover senha da resposta
    const { password: _, ...userWithoutPassword } = user

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: userWithoutPassword,
      token
    })
  } catch (error) {
    console.error('Erro no registro:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Validações
    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios' })
    }

    // Buscar usuário
    const user = await getUserByEmail(email)
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }

    // Verificar senha
    const isValidPassword = await comparePassword(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }

    // Gerar token
    const token = generateToken(user.id)

    // Remover senha da resposta
    const { password: _, ...userWithoutPassword } = user

    res.json({
      message: 'Login realizado com sucesso',
      user: userWithoutPassword,
      token
    })
  } catch (error) {
    console.error('Erro no login:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// Verificar token
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return res.status(401).json({ error: 'Token inválido' })
    }

    const user = await getUserById(decoded.userId)
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' })
    }

    // Remover senha da resposta
    const { password: _, ...userWithoutPassword } = user

    res.json({ user: userWithoutPassword })
  } catch (error) {
    console.error('Erro na verificação do token:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

export default router