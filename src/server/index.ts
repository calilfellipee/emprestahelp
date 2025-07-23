import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Importar rotas
import authRoutes from './routes/auth.js'
import clientRoutes from './routes/clients.ts'
import loanRoutes from './routes/loans.js'
import paymentRoutes from './routes/payments.js'
import notificationRoutes from './routes/notifications.js'
import dashboardRoutes from './routes/dashboard.js'
import uploadRoutes from './routes/upload.js'

// Configuração para ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Carregar variáveis de ambiente
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Rotas da API
app.use('/api/auth', authRoutes)
app.use('/api/clients', clientRoutes)
app.use('/api/loans', loanRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/upload', uploadRoutes)

// Servir frontend em produção
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../dist')))
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'))
  })
}

// Middleware de tratamento de erros
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ 
    error: 'Algo deu errado!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno do servidor'
  })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
  console.log(`📊 Dashboard: http://localhost:${PORT}`)
  console.log(`🔗 API: http://localhost:${PORT}/api`)
})