import express from 'express';
import bcrypt  from 'bcryptjs';
import { db } from '../db.js';
import { sendApprovalEmail } from '../mailer.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { fullName, email, password } = req.body

  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'Nome e e-mail são obrigatórios' })
  }

  try {
    const hash = await bcrypt.hash(password, 10)
    await db.execute('INSERT INTO users_table (fullName, email, password, status) VALUES (?, ?, ?, ?)', [fullName, email, hash, 'pending'])

    await sendApprovalEmail(email, fullName, password)

    return res.status(201).json({ success: true, message: 'Usuário cadastrado e e-mail enviado' })
  } catch (error) {
    console.error('Erro no signup:', error)
    return res.status(500).json({ error: 'Erro ao cadastrar ou enviar e-mail' })
  }
})

router.post('/login', asyncc (req, res) => {
  const {email, password, status} = req.body

  if(!email || !password) {
    return res.status(403).json({error: 'O uso das credenciais são obrigatórias'})
  }

})

router.get('/pending', async (_, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, full_name, email, created_at FROM users_table WHERE status='pending'"
    );
    return res.json(rows);
  } catch (err) {
    console.error('Erro /pending:', err);
    return res.status(500).json({ error: 'Erro interno.' });
  }
});

export default router;
