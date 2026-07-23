const express = require('express')
const router = express.Router()
const { getMesas, createMesa, updateEstadoMesa, deleteMesa } = require('../controllers/mesas.controller')
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware')

router.get('/', verificarToken, getMesas)
router.post('/', verificarToken, soloAdmin, createMesa)
router.patch('/:id/estado', verificarToken, soloAdmin, updateEstadoMesa)
router.delete('/:id', verificarToken, soloAdmin, deleteMesa)

module.exports = router