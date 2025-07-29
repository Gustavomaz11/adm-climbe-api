import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authrouter from './routes/auth.js'

dotenv.config()
const app = express()
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())
app.use('/api/auth', authrouter)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`))
