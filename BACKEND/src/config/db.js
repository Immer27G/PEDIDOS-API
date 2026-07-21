const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.BD_HOST,
  port: process.env.BD_PORT,
  database: process.env.DB_NAME,
  user: process.env.BD_USER,
  password: process.env.BD_PASSWORD,
})

//funcion para conectarse a la base de datos
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error al conectar a PostgreSQL:', err);
    } else {
        console.log('Conectado a PostgreSQL');
    }
});

module.exports = pool;