import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { db } from './db.js'
import { sendApprovalEmail } from './mailer.js'

dotenv.config()
const app = express()

// Libera CORS para qualquer origem
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())

app.get('/', (req, res) => {
  res.send('API Climbe Online')
})

// ✅ Rota para criar conta
app.post('/api/auth/signup', async (req, res) => {
  const { fullName, email, password } = req.body

  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'Nome e e-mail são obrigatórios' })
  }

  try {
    // Inserir no banco
    await db.execute('INSERT INTO users (fullName, email, password) VALUES (?, ?, ?)', [fullName, email, password])

    // Enviar e-mail de boas-vindas
    await sendApprovalEmail(email, fullName, password)

    return res.status(201).json({ success: true, message: 'Usuário cadastrado e e-mail enviado' })
  } catch (error) {
    console.error('Erro no signup:', error)
    return res.status(500).json({ error: 'Erro ao cadastrar ou enviar e-mail' })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`✅ Servidor rodando em http://localhost:${PORT}`))
