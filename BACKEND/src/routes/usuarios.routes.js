const express = require('express')
const router = express.Router()
const { getUsuarios, getDeliveries, updateUsuario, getPerfil } = require('../controllers/usuarios.controller')
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware')

router.get('/perfil', verificarToken, getPerfil)
router.get('/delivery', verificarToken, soloAdmin, getDeliveries)
router.get('/', verificarToken, soloAdmin, getUsuarios)
router.patch('/:id', verificarToken, soloAdmin, updateUsuario)

module.exports = router