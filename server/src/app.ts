import 'dotenv/config'
import express from 'express'
import type { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'



const prisma = new PrismaClient()
const app = express()

app.use(cors())
app.use(express.json())

// --- Drivers ---
app.get('/drivers', async (req: Request, res: Response) => {
  const drivers = await prisma.driver.findMany({
    orderBy: { created_at: 'desc' }
  })
  res.json(drivers)
})

app.post('/drivers', async (req: Request, res: Response) => {
  const { name, email, phone, license } = req.body
  const driver = await prisma.driver.create({
    data: { name, email, phone, license }
  })
  res.json(driver)
})

// --- Customers ---
app.get('/customers', async (req: Request, res: Response) => {
  const customers = await prisma.customer.findMany({
    orderBy: { created_at: 'desc' }
  })
  res.json(customers)
})

app.post('/customers', async (req: Request, res: Response) => {
  const { name, email, phone, address } = req.body
  const customer = await prisma.customer.create({
    data: { name, email, phone, address }
  })
  res.json(customer)
})

// --- Jobs ---
app.get('/jobs', async (req: Request, res: Response) => {
  const jobs = await prisma.job.findMany({
    include: { driver: true, customer: true },
    orderBy: { created_at: 'desc' }
  })
  res.json(jobs)
})

app.post('/jobs', async (req: Request, res: Response) => {
  const { driver_id, customer_id, origin, destination, commodity } = req.body
  const job = await prisma.job.create({
    data: { driver_id, customer_id, origin, destination, commodity },
    include: { driver: true, customer: true }
  })
  res.json(job)
})

app.patch('/jobs/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string)
  const { status } = req.body
  const job = await prisma.job.update({
    where: { id },
    data: { status },
    include: { driver: true, customer: true }
  })
  res.json(job)
})

app.delete('/jobs/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string)
  await prisma.job.delete({ where: { id } })
  res.json({ success: true })
})

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

export default app
