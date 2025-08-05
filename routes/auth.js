import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'                   
import { db } from '../db.js'
import { sendApprovalEmail, sendRejectionEmail } from '../mailer.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.post('/signup', async (req, res) => {
  const { fullName, email, password } = req.body
  if (!fullName || !email || !password) {
    return res
      .status(400)
      .json({ error: 'O preenchimento de todos os dados é obrigatório!' })
  }

  try {
    const hash = await bcrypt.hash(password, 10)
    await db.execute(
      'INSERT INTO users_table (fullName, email, password, status) VALUES (?, ?, ?, ?)',
      [fullName, email, hash, 'pending']
    )
    await sendApprovalEmail(email, fullName)
    return res
      .status(201)
      .json({ success: true, message: 'Usuário cadastrado e e‑mail enviado' })
  } catch (err) {
    console.error('Erro no signup:', err)
    return res
      .status(500)
      .json({ error: 'Erro ao cadastrar ou enviar e‑mail' })
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res
      .status(400)
      .json({ error: 'Preencha os campos de email e senha para acessar o sistema' })
  }

  try {
    const [rows] = await db.execute(
      'SELECT id, fullName, email, password, status FROM users_table WHERE email = ?',
      [email]
    )
    if (rows.length === 0) {
      return res.status(401).json({ error: 'E‑mail ou senha inválidos' })
    }
    const user = rows[0]

    if (user.status !== 'approved') {
      return res
        .status(403)
        .json({ error: 'Seu cadastro ainda não foi aprovado.' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ error: 'E‑mail ou senha inválidos' })
    }

    const token = jwt.sign(
      { name: user.fullName, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    )

    return res.json({
      success: true,
      user: { id: user.id, fullName: user.fullName, email: user.email },
      token
    })
  } catch (error) {
    console.error('Erro no login:', error)       
    return res
      .status(500)
      .json({ error: 'Erro interno, favor contatar o setor de TI' })
  }
})

router.use((req, res, next) => {
  if (req.method === 'GET') {
    return next()
  }
  return authMiddleware(req, res, next)
})

router.patch('/users/:id/status', async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status inválido' })
  }

  try {
    const [rows] = await db.execute(
      'SELECT email, fullName FROM users_table WHERE id = ?',
      [id]
    )
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }
    const { email, fullName } = rows[0]

    await db.execute(
      'UPDATE users_table SET status = ? WHERE id = ?',
      [status, id]
    )

    if (status === 'approved') {
      await sendApprovalEmail(email, fullName)
    } else {
      await sendRejectionEmail(email, fullName)
    }

    return res.json({
      success: true,
      message: `Usuário ${fullName} agora está '${status}'.`
    })
  } catch (err) {
    console.error('Erro ao alterar status:', err)
    return res.status(500).json({ error: 'Erro interno no servidor' })
  }
})



router.get('/pending', async (_, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT id, fullName, email FROM users_table WHERE status='pending'"
    );
    return res.json(rows);
  } catch (err) {
    console.error('Erro /pending:', err);
    return res.status(500).json({ error: 'Erro interno.' });
  }
});

export default router

