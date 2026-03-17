import {Request, Response, NextFunction} from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'field-frame-secret'

//Register
export async function register(req: Request, res: Response) {
    const {email, password, role} = req.body

    const existing = await prisma.user.findUnique({where: {email} })
    if (existing) {
        return res.status(400).json({error: 'User already exists'})
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
        data: {email, password: hashed, role: role || 'scheduler'}
    })

    const token = jwt.sign({userId: user.id, role: user.role}, JWT_SECRET)
    res.json({token, role: user.role})
}
//login
export async function login(req: Request, res: Response) {
    const {email, password} = req.body

    const user = await prisma.user.findUnique({where: {email}})
    if (!user) {
        return res.status(401).json({error: 'Invalid credentials'})
    }

    const token = jwt.sign({userId: user.id, role: user.role}, JWT_SECRET)
    res.json({token, role: user.role})
}

//authenticate
export async function authenticate(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization
    if (!header) {
        return res.status(401).json({error: 'No Token provided'})
    }

    const token = header.split(' ')[1]
    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        ; (req as any).user = decoded
        next()
    } catch {
        return res.status(401).json({ error: 'Invalid token'})
    }
}