const pool = require('../config/db')

// GET 
const getProductos = async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT p.*, c.nombre AS categoria
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      ORDER BY p.id ASC
    `)
    res.json(resultado.rows)
  } catch (error) {
    console.error('ERROR GET PRODUCTOS:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// GET 
const getProductoById = async (req, res) => {
  try {
    const { id } = req.params
    const resultado = await pool.query(`
      SELECT p.*, c.nombre AS categoria
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.id = $1
    `, [id])

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }
    res.json(resultado.rows[0])
  } catch (error) {
    console.error('ERROR GET PRODUCTO:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// GET 
const getProductosByCategoria = async (req, res) => {
  try {
    const { categoriaId } = req.params
    const resultado = await pool.query(`
      SELECT p.*, c.nombre AS categoria
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.categoria_id = $1 AND p.disponible = true
    `, [categoriaId])
    res.json(resultado.rows)
  } catch (error) {
    console.error('ERROR GET PRODUCTOS CATEGORIA:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// POST /api/productos
const createProducto = async (req, res) => {
  try {
    const { categoria_id, nombre, descripcion, precio } = req.body

    if (!nombre || !precio) {
      return res.status(400).json({ error: 'Nombre y precio son obligatorios' })
    }

    const resultado = await pool.query(`
      INSERT INTO productos (categoria_id, nombre, descripcion, precio)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [categoria_id, nombre, descripcion, precio])

    res.status(201).json(resultado.rows[0])
  } catch (error) {
    console.error('ERROR CREATE PRODUCTO:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// PUT 
const updateProducto = async (req, res) => {
  try {
    const { id } = req.params
    const { categoria_id, nombre, descripcion, precio, disponible } = req.body

    const resultado = await pool.query(`
      UPDATE productos
      SET categoria_id = COALESCE($1, categoria_id),
          nombre       = COALESCE($2, nombre),
          descripcion  = COALESCE($3, descripcion),
          precio       = COALESCE($4, precio),
          disponible   = COALESCE($5, disponible)
      WHERE id = $6
      RETURNING *
    `, [categoria_id, nombre, descripcion, precio, disponible, id])

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }
    res.json(resultado.rows[0])
  } catch (error) {
    console.error('ERROR UPDATE PRODUCTO:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// DELETE
const deleteProducto = async (req, res) => {
  try {
    const { id } = req.params
    const resultado = await pool.query(
      'DELETE FROM productos WHERE id = $1 RETURNING *', [id]
    )
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }
    res.json({ mensaje: 'Producto eliminado', producto: resultado.rows[0] })
  } catch (error) {
    console.error('ERROR DELETE PRODUCTO:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

module.exports = { getProductos, getProductoById, getProductosByCategoria, createProducto, updateProducto, deleteProducto }