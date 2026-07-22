const express = require('express')
const router = express.Router()
const { getCategorias, getCategoriaById, createCategoria, updateCategoria, deleteCategoria } = require('../controllers/categorias.controller')
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware')

// Rutas públicas (cualquiera puede ver el menú)
router.get('/', getCategorias)
router.get('/:id', getCategoriaById)

// Rutas protegidas 
router.post('/', verificarToken, soloAdmin, createCategoria)
router.put('/:id', verificarToken, soloAdmin, updateCategoria)
router.delete('/:id', verificarToken, soloAdmin, deleteCategoria)

module.exports = router