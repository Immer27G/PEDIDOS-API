const dotenv = require('dotenv')
dotenv.config()

require('./config/db')

const express = require('express')
const app = express()

app.use(express.json())

// Rutas
app.use('/api/auth', require('./routes/auth.routes'))

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: '🍽️ Restaurant API funcionando' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})