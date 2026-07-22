const express = require('express')
const router = express.Router()
const {
  getProductos, getProductoById, getProductosByCategoria,
  createProducto, updateProducto, deleteProducto
} = require('../controllers/productos.controller')
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware')

// Rutas públicas
router.get('/', getProductos)
router.get('/:id', getProductoById)
router.get('/categoria/:categoriaId', getProductosByCategoria)

// Rutas protegidas
router.post('/', verificarToken, soloAdmin, createProducto)
router.put('/:id', verificarToken, soloAdmin, updateProducto)
router.delete('/:id', verificarToken, soloAdmin, deleteProducto)

module.exports = router