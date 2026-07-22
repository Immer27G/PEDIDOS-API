const pool = require('../config/db')

const getCategorias = async(req, res)=>{
    try{
        const resultado = await pool.query(
            'SELECT * FROM categorias ORDER BY id ASC'

        )
        res.json(resultado.rows)

    }
    catch(error){
        console.error('ERROR GET CATOGORIAS',error.message)
        res.status(500).json({error: 'Error interno del servidor'})
    }
}

const getCategoriaById = async (req, res) => {
  try {
    const { id } = req.params
    const resultado = await pool.query(
      'SELECT * FROM categorias WHERE id = $1', [id]
    )
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' })
    }
    res.json(resultado.rows[0])
  } catch (error) {
    console.error('ERROR GET CATEGORIA:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// POST 
const createCategoria = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es obligatorio' })
    }
    const resultado = await pool.query(
      `INSERT INTO categorias (nombre, descripcion)
       VALUES ($1, $2)
       RETURNING *`,
      [nombre, descripcion]
    )
    res.status(201).json(resultado.rows[0])
  } catch (error) {
    console.error('ERROR CREATE CATEGORIA:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// PUT 
const updateCategoria = async (req, res) => {
  try {
    const { id } = req.params
    const { nombre, descripcion, activo } = req.body
    const resultado = await pool.query(
      `UPDATE categorias
       SET nombre = COALESCE($1, nombre),
           descripcion = COALESCE($2, descripcion),
           activo = COALESCE($3, activo)
       WHERE id = $4
       RETURNING *`,
      [nombre, descripcion, activo, id]
    )
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' })
    }
    res.json(resultado.rows[0])
  } catch (error) {
    console.error('ERROR UPDATE CATEGORIA:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// DELETE 
const deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params
    const resultado = await pool.query(
      'DELETE FROM categorias WHERE id = $1 RETURNING *', [id]
    )
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' })
    }
    res.json({ mensaje: 'Categoría eliminada', categoria: resultado.rows[0] })
  } catch (error) {
    console.error('ERROR DELETE CATEGORIA:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

module.exports = { getCategorias, getCategoriaById, createCategoria, updateCategoria, deleteCategoria }