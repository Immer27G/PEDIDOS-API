const pool = require('../config/db')

const getMesas = async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM mesas ORDER BY numero ASC')
    res.json(resultado.rows)
  } catch (error) {
    console.error('ERROR GET MESAS:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const createMesa = async (req, res) => {
  try {
    const { numero, capacidad } = req.body
    if (!numero || !capacidad) {
      return res.status(400).json({ error: 'Número y capacidad son obligatorios' })
    }
    const resultado = await pool.query(`
      INSERT INTO mesas (numero, capacidad)
      VALUES ($1, $2) RETURNING *
    `, [numero, capacidad])
    res.status(201).json(resultado.rows[0])
  } catch (error) {
    console.error('ERROR CREATE MESA:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const updateEstadoMesa = async (req, res) => {
  try {
    const { id } = req.params
    const { estado } = req.body
    const resultado = await pool.query(`
      UPDATE mesas SET estado = $1 WHERE id = $2 RETURNING *
    `, [estado, id])
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Mesa no encontrada' })
    }
    res.json(resultado.rows[0])
  } catch (error) {
    console.error('ERROR UPDATE MESA:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const deleteMesa = async (req, res) => {
  try {
    const { id } = req.params
    const resultado = await pool.query('DELETE FROM mesas WHERE id = $1 RETURNING *', [id])
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Mesa no encontrada' })
    }
    res.json({ mensaje: 'Mesa eliminada' })
  } catch (error) {
    console.error('ERROR DELETE MESA:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

module.exports = { getMesas, createMesa, updateEstadoMesa, deleteMesa }