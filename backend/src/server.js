import cors from 'cors'
import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import {
  agregarPalabra,
  borrarPregunta,
  codigoValido,
  crearPregunta,
  editarPregunta,
  finalizarActividad,
  iniciarActividad,
  leerActividad,
  listarActividades,
  listarCategorias,
  listarPreguntas,
  salaDe,
} from './banco.js'
import { pool } from './db.js'
import { cerrarSesion, claveCoincide, crearSesion, exigirProfesor, haySesion } from './sesion.js'

const port = Number(process.env.API_PORT) || 4000
const host = process.env.HOST || '127.0.0.1'
const webPort = process.env.WEB_PORT || '8088'

const origins = [
  'http://127.0.0.1:5173',
  'http://localhost:5173',
  `http://127.0.0.1:${webPort}`,
  `http://localhost:${webPort}`,
]

const app = express()
app.use(cors({ origin: origins, credentials: true }))
app.use(express.json())

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: origins, credentials: true },
})

function publicar(codigo, actividad) {
  io.to(salaDe(codigo)).emit('estado', actividad)
}

async function baseCaida(response, error) {
  console.error(error)
  response.status(503).json({ error: 'La base no responde.' })
}

app.get('/api/sesion', async (request, response) => {
  try {
    response.json({ profesor: await haySesion(request) })
  } catch (error) {
    await baseCaida(response, error)
  }
})

app.post('/api/sesion', async (request, response) => {
  if (!process.env.TEACHER_PASSWORD) {
    response.status(503).json({ error: 'Falta la contraseña del profesor en el servidor.' })
    return
  }

  if (!claveCoincide(request.body?.password)) {
    response.status(401).json({ error: 'La contraseña no coincide.' })
    return
  }

  try {
    await crearSesion(response)
    response.json({ profesor: true })
  } catch (error) {
    await baseCaida(response, error)
  }
})

app.delete('/api/sesion', async (request, response) => {
  try {
    await cerrarSesion(request, response)
    response.json({ profesor: false })
  } catch (error) {
    await baseCaida(response, error)
  }
})

app.get('/api/categorias', exigirProfesor, async (_request, response) => {
  try {
    response.json({ categorias: await listarCategorias() })
  } catch (error) {
    await baseCaida(response, error)
  }
})

app.get('/api/preguntas', exigirProfesor, async (_request, response) => {
  try {
    response.json({ preguntas: await listarPreguntas() })
  } catch (error) {
    await baseCaida(response, error)
  }
})

app.post('/api/preguntas', exigirProfesor, async (request, response) => {
  try {
    const result = await crearPregunta(request.body)
    if (!result.ok) {
      response.status(result.status).json({ error: result.error })
      return
    }
    response.status(201).json({ pregunta: result.pregunta })
  } catch (error) {
    await baseCaida(response, error)
  }
})

app.patch('/api/preguntas/:id', exigirProfesor, async (request, response) => {
  try {
    const result = await editarPregunta(request.params.id, request.body)
    if (!result.ok) {
      response.status(result.status).json({ error: result.error })
      return
    }
    response.json({ pregunta: result.pregunta })
  } catch (error) {
    await baseCaida(response, error)
  }
})

app.delete('/api/preguntas/:id', exigirProfesor, async (request, response) => {
  try {
    const result = await borrarPregunta(request.params.id)
    if (!result.ok) {
      response.status(result.status).json({ error: result.error })
      return
    }
    response.json({ ok: true })
  } catch (error) {
    await baseCaida(response, error)
  }
})

app.get('/api/actividades', exigirProfesor, async (_request, response) => {
  try {
    response.json({ actividades: await listarActividades() })
  } catch (error) {
    await baseCaida(response, error)
  }
})

app.post('/api/actividades', exigirProfesor, async (request, response) => {
  try {
    const result = await iniciarActividad(request.body?.preguntaId)
    if (!result.ok) {
      response.status(result.status).json({ error: result.error })
      return
    }
    publicar(result.actividad.codigo, result.actividad)
    response.status(201).json({ actividad: result.actividad })
  } catch (error) {
    await baseCaida(response, error)
  }
})

app.post('/api/actividades/:id/finalizar', exigirProfesor, async (request, response) => {
  try {
    const result = await finalizarActividad(request.params.id)
    if (!result.ok) {
      response.status(result.status).json({ error: result.error })
      return
    }
    publicar(result.actividad.codigo, result.actividad)
    response.json({ actividad: result.actividad })
  } catch (error) {
    await baseCaida(response, error)
  }
})

app.get('/api/a/:codigo', async (request, response) => {
  try {
    const actividad = await leerActividad(request.params.codigo)
    if (!actividad) {
      response.status(404).json({ error: 'No existe una actividad con ese código.' })
      return
    }
    response.json({ actividad })
  } catch (error) {
    await baseCaida(response, error)
  }
})

app.post('/api/a/:codigo/palabras', async (request, response) => {
  try {
    const result = await agregarPalabra(request.params.codigo, request.body?.text)
    if (!result.ok) {
      response.status(result.status).json({ error: result.error })
      return
    }
    publicar(result.actividad.codigo, result.actividad)
    response.json({ actividad: result.actividad })
  } catch (error) {
    await baseCaida(response, error)
  }
})

io.on('connection', (socket) => {
  socket.on('mirar', async (codigo) => {
    if (!codigoValido(codigo)) {
      socket.emit('estado', { error: 'No existe una actividad con ese código.' })
      return
    }

    socket.join(salaDe(codigo))

    try {
      const actividad = await leerActividad(codigo)
      socket.emit('estado', actividad ?? { error: 'No existe una actividad con ese código.' })
    } catch (error) {
      console.error(error)
      socket.emit('estado', { error: 'La base no responde.' })
    }
  })

  socket.on('abrir', () => {
    socket.emit('rechazo', 'Sin permiso para abrir una actividad.')
  })

  socket.on('cerrar', () => {
    socket.emit('rechazo', 'Sin permiso para cerrar una actividad.')
  })
})

if (!process.env.DATABASE_URL) {
  console.error('Falta DATABASE_URL. Copiá .env.example a .env en la raíz del repositorio.')
  process.exit(1)
}

try {
  await pool.query('SELECT 1')
} catch (error) {
  console.error('No se pudo conectar con PostgreSQL.')
  console.error(error.message)
  process.exit(1)
}

process.on('SIGTERM', () => {
  console.log('Llegó SIGTERM. El proceso termina y Docker puede volver a iniciarlo.')
  process.exit(0)
})

httpServer.listen(port, host, () => {
  console.log(`API en http://${host}:${port}`)
})
