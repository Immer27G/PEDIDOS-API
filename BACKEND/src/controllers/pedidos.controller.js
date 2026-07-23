const pool = require('../config/db')

const createPedido = async (req, res) => {
  const client = await pool.connect()
  try {
    const { mesa_id, tipo, direccion_entrega, notas, productos } = req.body
    const usuario_id = req.usuario.id

    // productos
    if (!productos || productos.length === 0) {
      return res.status(400).json({ error: 'El pedido debe tener al menos un producto' })
    }

    await client.query('BEGIN')

    // 1. Crear el pedido
    const pedidoRes = await client.query(`
      INSERT INTO pedidos (mesa_id, usuario_id, tipo, direccion_entrega, notas)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [mesa_id, usuario_id, tipo || 'local', direccion_entrega, notas])

    const pedido = pedidoRes.rows[0]

    // 2. Insertar cada producto en detalle_pedidos
    let total = 0
    for (const item of productos) {
    
      const productoRes = await client.query(
        'SELECT id, precio, disponible FROM productos WHERE id = $1', [item.producto_id]
      )
      if (productoRes.rows.length === 0) {
        await client.query('ROLLBACK')
        return res.status(404).json({ error: `Producto ${item.producto_id} no encontrado` })
      }
      const producto = productoRes.rows[0]
      if (!producto.disponible) {
        await client.query('ROLLBACK')
        return res.status(400).json({ error: `Producto ${item.producto_id} no disponible` })
      }

      const precio_unitario = producto.precio
      total += precio_unitario * item.cantidad

      await client.query(`
        INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad, precio_unitario)
        VALUES ($1, $2, $3, $4)
      `, [pedido.id, item.producto_id, item.cantidad, precio_unitario])
    }

    // 3. Actualizar el total del pedido
    await client.query(
      'UPDATE pedidos SET total = $1 WHERE id = $2', [total, pedido.id]
    )

    await client.query('COMMIT')

    res.status(201).json({
      mensaje: 'Pedido creado correctamente',
      pedido: { ...pedido, total }
    })

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('ERROR CREATE PEDIDO:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  } finally {
    client.release()
  }
}

// admin ve todos, cliente ve los suyos, delivery ve los asignados
const getPedidos = async (req, res) => {
  try {
    const { id, rol } = req.usuario
    let query = ''
    let params = []

    if (rol === 'administrador') {
      query = `
        SELECT p.*, u.nombre AS cliente_nombre, d.nombre AS delivery_nombre
        FROM pedidos p
        LEFT JOIN usuarios u ON p.usuario_id = u.id
        LEFT JOIN usuarios d ON p.delivery_id = d.id
        ORDER BY p.creado_en DESC
      `
    } else if (rol === 'delivery') {
      query = `
        SELECT p.*, u.nombre AS cliente_nombre
        FROM pedidos p
        LEFT JOIN usuarios u ON p.usuario_id = u.id
        WHERE p.delivery_id = $1
        ORDER BY p.creado_en DESC
      `
      params = [id]
    } else {
      query = `
        SELECT * FROM pedidos
        WHERE usuario_id = $1
        ORDER BY creado_en DESC
      `
      params = [id]
    }

    const resultado = await pool.query(query, params)
    res.json(resultado.rows)
  } catch (error) {
    console.error('ERROR GET PEDIDOS:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// detalle completo del pedido
const getPedidoById = async (req, res) => {
  try {
    const { id } = req.params
    const { id: userId, rol } = req.usuario

    const pedidoRes = await pool.query('SELECT * FROM pedidos WHERE id = $1', [id])
    if (pedidoRes.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' })
    }
    const pedido = pedidoRes.rows[0]

    // Un cliente solo puede ver sus propios pedidos
    if (rol === 'cliente' && pedido.usuario_id !== userId) {
      return res.status(403).json({ error: 'No tienes acceso a este pedido' })
    }

    // Traer el detalle
    const detalleRes = await pool.query(`
      SELECT dp.*, pr.nombre AS producto_nombre
      FROM detalle_pedidos dp
      JOIN productos pr ON dp.producto_id = pr.id
      WHERE dp.pedido_id = $1
    `, [id])

    res.json({ ...pedido, detalle: detalleRes.rows })
  } catch (error) {
    console.error('ERROR GET PEDIDO:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// cambiar estado
const updateEstadoPedido = async (req, res) => {
  try {
    const { id } = req.params
    const { estado } = req.body
    const { rol } = req.usuario

    const estadosAdmin = ['pendiente', 'en_preparacion', 'listo', 'cancelado']
    const estadosDelivery = ['en_preparacion', 'entregado']

    const estadosPermitidos = rol === 'administrador' ? estadosAdmin : estadosDelivery

    if (!estadosPermitidos.includes(estado)) {
      return res.status(403).json({ error: `No puedes cambiar a ese estado` })
    }

    const resultado = await pool.query(`
      UPDATE pedidos SET estado = $1 WHERE id = $2 RETURNING *
    `, [estado, id])

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' })
    }

    res.json({ mensaje: 'Estado actualizado', pedido: resultado.rows[0] })
  } catch (error) {
    console.error('ERROR UPDATE ESTADO:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}


const asignarDelivery = async (req, res) => {
  try {
    const { id } = req.params
    const { delivery_id } = req.body

    // Verificar que el usuario sea delivery
    const userRes = await pool.query(
      'SELECT id FROM usuarios WHERE id = $1 AND rol = $2', [delivery_id, 'delivery']
    )
    if (userRes.rows.length === 0) {
      return res.status(400).json({ error: 'El usuario no es un repartidor válido' })
    }

    const resultado = await pool.query(`
      UPDATE pedidos SET delivery_id = $1 WHERE id = $2 RETURNING *
    `, [delivery_id, id])

    res.json({ mensaje: 'Repartidor asignado', pedido: resultado.rows[0] })
  } catch (error) {
    console.error('ERROR ASIGNAR DELIVERY:', error.message)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

module.exports = { createPedido, getPedidos, getPedidoById, updateEstadoPedido, asignarDelivery }