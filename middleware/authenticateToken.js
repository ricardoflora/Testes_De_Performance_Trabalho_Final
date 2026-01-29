const jwt = require('jsonwebtoken')

const SECRET = process.env.JWT_SECRET || 'secretdemo'

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Token de autenticação é obrigatório.' })
  }

  jwt.verify(token, SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token de acesso expirado ou inválido.' })
    }
    req.user = user
    next()
  })
}

module.exports = authenticateToken
