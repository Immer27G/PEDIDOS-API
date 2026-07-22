const jwt = require('jsonwebtoken')

const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // formato: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado, token requerido' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.usuario = decoded 
    next()
  } catch (error) {
    res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

const soloAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'administrador') {
    return res.status(403).json({ error: 'Acceso solo para administradores' })
  }
  next()
}

const soloDelivery = (req, res, next) => {
  if (!['administrador', 'delivery'].includes(req.usuario.rol)) {
    return res.status(403).json({ error: 'Acceso no autorizado' })
  }
  next()
}

module.exports = { verificarToken, soloAdmin, soloDelivery }