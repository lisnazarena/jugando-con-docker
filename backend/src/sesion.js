import crypto from 'node:crypto'
import { pool } from './db.js'

const COOKIE = 'sesion'
const HORAS = 8

function huellaDe(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function claveCoincide(clave) {
  const esperada = process.env.TEACHER_PASSWORD

  if (!esperada || typeof clave !== 'string' || !clave) return false

  const recibida = crypto.createHash('sha256').update(clave).digest()
  const guardada = crypto.createHash('sha256').update(esperada).digest()
  return crypto.timingSafeEqual(recibida, guardada)
}

export function tokenDe(request) {
  const header = request.headers.cookie
  if (!header) return null

  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=')
    if (name === COOKIE) return decodeURIComponent(rest.join('='))
  }

  return null
}

function opcionesCookie() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: HORAS * 60 * 60 * 1000,
  }
}

export async function crearSesion(response) {
  const token = crypto.randomBytes(32).toString('hex')

  await pool.query('DELETE FROM sesiones WHERE vence_en <= now()')
  await pool.query(
    `INSERT INTO sesiones (id, huella, vence_en)
     VALUES ($1, $2, now() + interval '8 hours')`,
    [crypto.randomUUID(), huellaDe(token)],
  )

  response.cookie(COOKIE, token, opcionesCookie())
}

export async function cerrarSesion(request, response) {
  const token = tokenDe(request)

  if (token) {
    await pool.query('DELETE FROM sesiones WHERE huella = $1', [huellaDe(token)])
  }

  response.clearCookie(COOKIE, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  })
}

export async function haySesion(request) {
  const token = tokenDe(request)
  if (!token) return false

  const result = await pool.query(
    'SELECT id FROM sesiones WHERE huella = $1 AND vence_en > now()',
    [huellaDe(token)],
  )

  return result.rowCount > 0
}

export async function exigirProfesor(request, response, next) {
  try {
    if (await haySesion(request)) {
      next()
      return
    }

    response.status(401).json({ error: 'Hace falta la sesión del profesor.' })
  } catch (error) {
    console.error(error)
    response.status(503).json({ error: 'La base no responde.' })
  }
}
