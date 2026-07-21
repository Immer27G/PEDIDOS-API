const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

require('./src/config/db'); // aqui importamos la configuración de la base de datos


app.use(express.json()); // Middleware para parsear el cuerpo de las solicitudes como JSON


// Rutas
app.get('/', (req, res) => {
  res.send('Api funcionando correctamente');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});


