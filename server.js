// server.js
import express  from 'express';
import cors     from 'cors';
import dotenv   from 'dotenv';
import authRoutes from './routes/auth.js';

dotenv.config();
const app = express();

// 1) CORS aberto (qualquer origem / qualquer método / qualquer header)
app.use(cors());
// app.options('*', cors());

// 2) Body parser JSON
app.use(express.json());

// 3) Monta as rotas de auth em /api/auth
app.use('/api/auth', authRoutes);


// 5) Inicia servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
});
