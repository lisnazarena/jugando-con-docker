import cors from 'cors'
import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import { addWord, listWords } from './words.js'

const port = Number(process.env.API_PORT) || 4000

const origins = ['http://127.0.0.1:5173', 'http://localhost:5173']

const app = express()
app.use(cors({ origin: origins }))
app.use(express.json())

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: origins },
})

function publish() {
  io.emit('words', listWords())
}

app.get('/api/words', (_request, response) => {
  response.json({ words: listWords() })
})

app.post('/api/words', (request, response) => {
  const result = addWord(request.body?.text)

  if (!result.ok) {
    response.status(400).json({ error: result.error })
    return
  }

  publish()
  response.json({ words: result.words })
})

io.on('connection', (socket) => {
  socket.emit('words', listWords())
})

httpServer.listen(port, '127.0.0.1', () => {
  console.log(`API en http://127.0.0.1:${port}`)
})
