import cors from 'cors'
import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import { addWord, listWords, pool } from './words.js'

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
app.use(cors({ origin: origins }))
app.use(express.json())

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: origins },
})

app.get('/api/words', async (_request, response) => {
  try {
    response.json({ words: await listWords() })
  } catch (error) {
    console.error(error)
    response.status(503).json({ error: 'La base no responde.' })
  }
})

app.post('/api/words', async (request, response) => {
  try {
    const result = await addWord(request.body?.text)

    if (!result.ok) {
      response.status(400).json({ error: result.error })
      return
    }

    io.emit('words', result.words)
    response.json({ words: result.words })
  } catch (error) {
    console.error(error)
    response.status(503).json({ error: 'La base no responde.' })
  }
})

io.on('connection', (socket) => {
  listWords()
    .then((words) => socket.emit('words', words))
    .catch((error) => console.error(error))
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

httpServer.listen(port, host, () => {
  console.log(`API en http://${host}:${port}`)
})
