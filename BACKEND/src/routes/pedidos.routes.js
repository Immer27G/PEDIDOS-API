const express = require('express')
const router = express.Router()
const {
  createPedido, getPedidos, getPedidoById,
  updateEstadoPedido, asignarDelivery
} = require('../controllers/pedidos.controller')
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware')

// Todas requieren token
router.post('/', verificarToken, createPedido)
router.get('/', verificarToken, getPedidos)
router.get('/:id', verificarToken, getPedidoById)
router.patch('/:id/estado', verificarToken, updateEstadoPedido)
router.patch('/:id/asignar-delivery', verificarToken, soloAdmin, asignarDelivery)

module.exports = router