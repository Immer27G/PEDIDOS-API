const pool = require('../config/db')
const bcrypt = require('bcryptjs')

// GET /api/usuarios → solo admin
const getUsuarios = async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT id, nombre, email, rol, activo, creado_en
      FROM usuarios ORDER BY id ASC
    `)
    res.json(resultado.rows)
  } catch (error) {
    console.error('ERROR GET USUARIOS:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// GET /api/usuarios/delivery → listar repartidores disponibles
const getDeliveries = async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT id, nombre, email FROM usuarios
      WHERE rol = 'delivery' AND activo = true
    `)
    res.json(resultado.rows)
  } catch (error) {
    console.error('ERROR GET DELIVERIES:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// PATCH /api/usuarios/:id → actualizar rol o estado
const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params
    const { rol, activo } = req.body

    const resultado = await pool.query(`
      UPDATE usuarios
      SET rol    = COALESCE($1, rol),
          activo = COALESCE($2, activo)
      WHERE id = $3
      RETURNING id, nombre, email, rol, activo
    `, [rol, activo, id])

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }
    res.json(resultado.rows[0])
  } catch (error) {
    console.error('ERROR UPDATE USUARIO:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// GET /api/usuarios/perfil → el usuario ve su propio perfil
const getPerfil = async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT id, nombre, email, rol, creado_en
      FROM usuarios WHERE id = $1
    `, [req.usuario.id])
    res.json(resultado.rows[0])
  } catch (error) {
    console.error('ERROR GET PERFIL:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

module.exports = { getUsuarios, getDeliveries, updateUsuario, getPerfil }