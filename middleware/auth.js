import jwt from 'jsonwebtoken'

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' })
  }

  const [scheme, token] = authHeader.split(' ')
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Formato de token inválido' })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = {
      name: payload.name,
      email: payload.email
    }
    next()
  } catch (err) {
    console.error('Erro no authMiddleware:', err)
    return res.status(401).json({ error: 'Token expirado ou inválido' })
  }
}
