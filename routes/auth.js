// routes/auth.js
import express from 'express';
import bcrypt  from 'bcryptjs';
import { pool } from '../db.js';
import { sendMail } from '../mailer.js';

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)',
      [fullName, email, hash]
    );

    // e‑mail usuário
    await sendMail({
      to: email,
      subject: 'Sua inscrição chegou!',
      html: `<p>Olá ${fullName},</p>
             <p>Sua solicitação está em análise. Retornaremos em até <strong>24h</strong>.</p>`
    });

    // e‑mail gestor/master
    await sendMail({
      to: process.env.MASTER_EMAIL,
      subject: 'Novo sócio pendente',
      html: `<p>Nome: ${fullName}<br/>E‑mail: ${email}</p>`
    });

    return res.status(201).json({ message: 'Solicitação registrada.' });
  } catch (err) {
    console.error('Erro /signup:', err);
    return res.status(500).json({ error: 'Erro interno.' });
  }
});

// GET /api/auth/pending
router.get('/pending', async (_, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, full_name, email, created_at FROM users WHERE status='pending'"
    );
    return res.json(rows);
  } catch (err) {
    console.error('Erro /pending:', err);
    return res.status(500).json({ error: 'Erro interno.' });
  }
});

export default router;
