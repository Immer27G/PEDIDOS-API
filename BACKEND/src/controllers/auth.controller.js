const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../config/db')

// REGISTRO
const register = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body

    // Validar que vengan los campos
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y password son obligatorios' })
    }

    // Verificar si el email ya existe
    const existe = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email])
    if (existe.rows.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' })
    }

    // Encriptar la contraseña (10 = nivel de seguridad)
    const hash = await bcrypt.hash(password, 10)

    // Guardar en BD
    const resultado = await pool.query(
      `INSERT INTO usuarios (nombre, email, password, rol)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre, email, rol`,
      [nombre, email, hash, rol || 'cliente']
    )

    res.status(201).json({
      mensaje: 'Usuario registrado correctamente',
      usuario: resultado.rows[0]
    })

  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y password son obligatorios' })
    }

   
    const resultado = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email])
    const usuario = resultado.rows[0]

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

   
    const passwordValido = await bcrypt.compare(password, usuario.password)
    if (!passwordValido) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    })

  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

module.exports = { register, login }