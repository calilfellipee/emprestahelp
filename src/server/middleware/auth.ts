import { Request, Response, NextFunction } from 'express'
import { verifyToken, getUserById } from '../../lib/database.js'

// Estender interface do Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        name: string
        plan: string
        isAdmin: boolean
      }
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: 'Token de acesso requerido' })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return res.status(401).json({ error: 'Token inválido' })
    }

    const user = await getUserById(decoded.userId)
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' })
    }

    // Adicionar usuário ao request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      isAdmin: user.isAdmin
    }

    next()
  } catch (error) {
    console.error('Erro na autenticação:', error)
    res.status(401).json({ error: 'Token inválido' })
  }
}

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Acesso negado. Privilégios de administrador necessários.' })
  }
  next()
}

export const requirePlan = (requiredPlan: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const planHierarchy = { free: 0, pro: 1, premium: 2 }
    const userPlanLevel = planHierarchy[req.user?.plan as keyof typeof planHierarchy] || 0
    const requiredPlanLevel = planHierarchy[requiredPlan as keyof typeof planHierarchy] || 0

    if (userPlanLevel < requiredPlanLevel) {
      return res.status(403).json({ 
        error: `Plano ${requiredPlan.toUpperCase()} ou superior necessário para esta funcionalidade` 
      })
    }
    next()
  }
}