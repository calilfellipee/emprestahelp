import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Singleton do Prisma Client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Tipos
export interface User {
  id: string
  email: string
  name: string
  plan: string
  isAdmin: boolean
  companyName?: string
  companyCnpj?: string
  companyAddress?: string
  whatsappApiToken?: string
  createdAt: Date
  updatedAt: Date
}

export interface Client {
  id: string
  userId: string
  name: string
  cpf?: string
  rg?: string
  phone: string
  whatsapp?: string
  email?: string
  address: string
  city?: string
  state?: string
  zipCode?: string
  observations?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Loan {
  id: string
  clientId: string
  userId: string
  type: string
  amount: number
  interestRate: number
  loanDate: Date
  dueDate: Date
  installments: number
  installmentAmount: number
  totalAmount: number
  status: string
  dailyInterestRate: number
  lateFeePercentage: number
  collateralDescription?: string
  collateralValue?: number
  notes?: string
  contractGenerated: boolean
  contractUrl?: string
  contractSignedAt?: Date
  createdAt: Date
  updatedAt: Date
  client?: Client
  payments?: Payment[]
}

export interface Payment {
  id: string
  loanId: string
  userId: string
  amount: number
  paymentDate: Date
  installmentNumber: number
  lateFee: number
  dailyInterest: number
  paymentMethod?: string
  notes?: string
  createdAt: Date
}

export interface Notification {
  id: string
  userId: string
  clientId?: string
  loanId?: string
  type: string
  channel?: string
  title: string
  message: string
  recipientPhone?: string
  recipientEmail?: string
  status: string
  sentAt?: Date
  deliveredAt?: Date
  readAt?: Date
  failedAt?: Date
  errorMessage?: string
  providerId?: string
  providerResponse?: any
  createdAt: Date
}

// Limites por plano
export const PLAN_LIMITS = {
  free: {
    clients: 5,
    loans: 10,
    features: {
      export: false,
      whatsapp_manual: false,
      whatsapp_auto: false,
      contracts: false,
      admin_panel: false,
    }
  },
  pro: {
    clients: 100,
    loans: 500,
    features: {
      export: true,
      whatsapp_manual: true,
      whatsapp_auto: false,
      contracts: false,
      admin_panel: false,
    }
  },
  premium: {
    clients: Infinity,
    loans: Infinity,
    features: {
      export: true,
      whatsapp_manual: true,
      whatsapp_auto: true,
      contracts: true,
      admin_panel: false,
    }
  }
}

// Funções de autenticação
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12)
}

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash)
}

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '7d' })
}

export const verifyToken = (token: string): { userId: string } | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
  } catch {
    return null
  }
}

// Funções de usuário
export const createUser = async (email: string, password: string, name: string): Promise<User> => {
  const hashedPassword = await hashPassword(password)
  
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      plan: 'free'
    }
  })
  
  return user
}

export const getUserByEmail = async (email: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { email }
  })
}

export const getUserById = async (id: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { id }
  })
}

export const updateUser = async (id: string, data: Partial<User>): Promise<User> => {
  return prisma.user.update({
    where: { id },
    data
  })
}

// Funções de cliente
export const getClients = async (userId: string): Promise<Client[]> => {
  return prisma.client.findMany({
    where: { 
      userId,
      isActive: true 
    },
    orderBy: { createdAt: 'desc' }
  })
}

export const createClient = async (userId: string, data: Omit<Client, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Client> => {
  // Verificar limites do plano
  const user = await getUserById(userId)
  if (!user) throw new Error('Usuário não encontrado')
  
  const clientCount = await prisma.client.count({
    where: { userId, isActive: true }
  })
  
  const limit = PLAN_LIMITS[user.plan as keyof typeof PLAN_LIMITS].clients
  if (clientCount >= limit) {
    throw new Error(`Limite de ${limit} clientes atingido para o plano ${user.plan.toUpperCase()}`)
  }
  
  return prisma.client.create({
    data: {
      ...data,
      userId
    }
  })
}

export const updateClient = async (id: string, data: Partial<Client>): Promise<Client> => {
  return prisma.client.update({
    where: { id },
    data
  })
}

export const deleteClient = async (id: string): Promise<void> => {
  await prisma.client.update({
    where: { id },
    data: { isActive: false }
  })
}

// Funções de empréstimo
export const getLoans = async (userId: string): Promise<Loan[]> => {
  return prisma.loan.findMany({
    where: { userId },
    include: {
      client: true,
      payments: true
    },
    orderBy: { createdAt: 'desc' }
  })
}

export const createLoan = async (userId: string, data: Omit<Loan, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Loan> => {
  // Verificar limites do plano
  const user = await getUserById(userId)
  if (!user) throw new Error('Usuário não encontrado')
  
  const loanCount = await prisma.loan.count({
    where: { userId }
  })
  
  const limit = PLAN_LIMITS[user.plan as keyof typeof PLAN_LIMITS].loans
  if (loanCount >= limit) {
    throw new Error(`Limite de ${limit} empréstimos atingido para o plano ${user.plan.toUpperCase()}`)
  }
  
  return prisma.loan.create({
    data: {
      ...data,
      userId
    },
    include: {
      client: true,
      payments: true
    }
  })
}

export const updateLoan = async (id: string, data: Partial<Loan>): Promise<Loan> => {
  return prisma.loan.update({
    where: { id },
    data,
    include: {
      client: true,
      payments: true
    }
  })
}

// Funções de pagamento
export const addPayment = async (userId: string, loanId: string, data: Omit<Payment, 'id' | 'loanId' | 'userId' | 'createdAt'>): Promise<Payment> => {
  const payment = await prisma.payment.create({
    data: {
      ...data,
      loanId,
      userId
    }
  })
  
  // Verificar se o empréstimo foi totalmente pago
  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    include: { payments: true }
  })
  
  if (loan) {
    const totalPaid = loan.payments.reduce((sum, p) => sum + Number(p.amount), 0)
    if (totalPaid >= Number(loan.totalAmount)) {
      await updateLoan(loanId, { status: 'paid' })
    }
  }
  
  return payment
}

// Funções de notificação
export const getNotifications = async (userId: string): Promise<Notification[]> => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })
}

export const createNotification = async (userId: string, data: Omit<Notification, 'id' | 'userId' | 'createdAt'>): Promise<Notification> => {
  return prisma.notification.create({
    data: {
      ...data,
      userId
    }
  })
}

// Estatísticas do dashboard
export const getDashboardStats = async (userId: string) => {
  const [clients, loans] = await Promise.all([
    getClients(userId),
    getLoans(userId)
  ])
  
  const totalLoaned = loans.reduce((sum, loan) => sum + Number(loan.amount), 0)
  const totalReceived = loans.reduce((sum, loan) => {
    const payments = loan.payments || []
    return sum + payments.reduce((pSum, p) => pSum + Number(p.amount), 0)
  }, 0)
  const totalPending = loans.reduce((sum, loan) => {
    const payments = loan.payments || []
    const paid = payments.reduce((pSum, p) => pSum + Number(p.amount), 0)
    return sum + Math.max(0, Number(loan.totalAmount) - paid)
  }, 0)
  
  const activeLoans = loans.filter(l => l.status === 'active').length
  const paidLoans = loans.filter(l => l.status === 'paid').length
  const overdueLoans = loans.filter(l => l.status === 'overdue').length
  
  return {
    totalClients: clients.length,
    totalLoans: loans.length,
    activeLoans,
    paidLoans,
    overdueLoans,
    totalLoaned,
    totalReceived,
    totalPending,
    netProfit: totalReceived - totalLoaned
  }
}