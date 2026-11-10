import crypto from 'node:crypto'
import { pool } from './db.js'

const ALFABETO = 'abcdefghjkmnpqrstuvwxyz23456789'
const CODIGO = /^[abcdefghjkmnpqrstuvwxyz23456789]{6}$/
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function salaDe(codigo) {
  return `actividad:${codigo}`
}

export function codigoValido(codigo) {
  return typeof codigo === 'string' && CODIGO.test(codigo)
}

export function idValido(id) {
  return typeof id === 'string' && UUID.test(id)
}

function parseTexto(raw) {
  if (typeof raw !== 'string') {
    return { ok: false, error: 'Escribí la pregunta.' }
  }

  const texto = raw.trim().replace(/\s+/g, ' ')

  if (!texto) return { ok: false, error: 'Escribí la pregunta.' }
  if (texto.length > 200) {
    return { ok: false, error: 'La pregunta puede tener hasta 200 caracteres.' }
  }

  return { ok: true, texto }
}

function parsePalabra(raw) {
  if (typeof raw !== 'string') {
    return { ok: false, error: 'Escribí una palabra.' }
  }

  const text = raw.trim().replace(/\s+/g, ' ')

  if (!text) return { ok: false, error: 'Escribí una palabra.' }
  if (text.length > 32) {
    return { ok: false, error: 'La palabra puede tener hasta 32 caracteres.' }
  }

  return { ok: true, text, normalized: text.toLocaleLowerCase('es') }
}

function aPalabras(rows) {
  return rows.map((row) => ({
    id: row.id,
    text: row.texto,
    count: Number(row.cantidad),
  }))
}

function aPregunta(row) {
  return {
    id: row.id,
    texto: row.texto,
    categoriaId: row.categoria_id,
    categoria: row.categoria,
  }
}

async function palabrasDe(client, actividadId) {
  const result = await client.query(
    `SELECT id, texto, cantidad
     FROM palabras
     WHERE actividad_id = $1
     ORDER BY created_at, id`,
    [actividadId],
  )
  return aPalabras(result.rows)
}

function vistaAlumno(row, palabras) {
  return {
    codigo: row.codigo,
    texto: row.texto_pregunta,
    categoria: row.categoria_nombre,
    estado: row.estado,
    palabras,
  }
}

export async function listarCategorias() {
  const result = await pool.query(
    'SELECT id, nombre FROM categorias ORDER BY nombre',
  )
  return result.rows.map((row) => ({ id: row.id, nombre: row.nombre }))
}

export async function listarPreguntas() {
  const result = await pool.query(
    `SELECT preguntas.id, preguntas.texto, preguntas.categoria_id, categorias.nombre AS categoria
     FROM preguntas
     JOIN categorias ON categorias.id = preguntas.categoria_id
     ORDER BY preguntas.created_at, preguntas.id`,
  )
  return result.rows.map(aPregunta)
}

export async function crearPregunta(body) {
  const texto = parseTexto(body?.texto)
  if (!texto.ok) return { ok: false, status: 400, error: texto.error }
  if (!idValido(body?.categoriaId)) {
    return { ok: false, status: 400, error: 'Elegí una categoría.' }
  }

  const categoria = await pool.query('SELECT id FROM categorias WHERE id = $1', [
    body.categoriaId,
  ])
  if (categoria.rowCount === 0) {
    return { ok: false, status: 400, error: 'Elegí una categoría.' }
  }

  const id = crypto.randomUUID()
  const result = await pool.query(
    `INSERT INTO preguntas (id, categoria_id, texto)
     VALUES ($1, $2, $3)
     RETURNING id, texto, categoria_id`,
    [id, body.categoriaId, texto.texto],
  )
  const nombre = await pool.query('SELECT nombre FROM categorias WHERE id = $1', [
    body.categoriaId,
  ])

  return {
    ok: true,
    pregunta: aPregunta({
      ...result.rows[0],
      categoria: nombre.rows[0].nombre,
    }),
  }
}

export async function editarPregunta(id, body) {
  if (!idValido(id)) return { ok: false, status: 400, error: 'La pregunta no existe.' }

  const texto = parseTexto(body?.texto)
  if (!texto.ok) return { ok: false, status: 400, error: texto.error }
  if (!idValido(body?.categoriaId)) {
    return { ok: false, status: 400, error: 'Elegí una categoría.' }
  }

  const result = await pool.query(
    `UPDATE preguntas
     SET categoria_id = categorias.id, texto = $3, updated_at = now()
     FROM categorias
     WHERE preguntas.id = $1 AND categorias.id = $2
     RETURNING preguntas.id, preguntas.texto, preguntas.categoria_id, categorias.nombre AS categoria`,
    [id, body.categoriaId, texto.texto],
  )

  if (result.rowCount === 0) {
    const existe = await pool.query('SELECT id FROM preguntas WHERE id = $1', [id])
    return {
      ok: false,
      status: existe.rowCount === 0 ? 404 : 400,
      error: existe.rowCount === 0 ? 'La pregunta no existe.' : 'Elegí una categoría.',
    }
  }

  return { ok: true, pregunta: aPregunta(result.rows[0]) }
}

export async function borrarPregunta(id) {
  if (!idValido(id)) return { ok: false, status: 400, error: 'La pregunta no existe.' }

  const result = await pool.query('DELETE FROM preguntas WHERE id = $1', [id])
  if (result.rowCount === 0) {
    return { ok: false, status: 404, error: 'La pregunta no existe.' }
  }

  return { ok: true }
}

function nuevoCodigo() {
  const bytes = crypto.randomBytes(6)
  let codigo = ''

  for (const byte of bytes) {
    codigo += ALFABETO[byte % ALFABETO.length]
  }

  return codigo
}

export async function listarActividades() {
  const result = await pool.query(
    `SELECT actividades.id, actividades.codigo, actividades.texto_pregunta,
            actividades.categoria_nombre, actividades.estado,
            actividades.iniciada_en, actividades.finalizada_en,
            COALESCE(SUM(palabras.cantidad), 0)::int AS respuestas
     FROM actividades
     LEFT JOIN palabras ON palabras.actividad_id = actividades.id
     GROUP BY actividades.id
     ORDER BY actividades.created_at DESC`,
  )

  return result.rows.map((row) => ({
    id: row.id,
    codigo: row.codigo,
    texto: row.texto_pregunta,
    categoria: row.categoria_nombre,
    estado: row.estado,
    respuestas: Number(row.respuestas),
  }))
}

export async function iniciarActividad(preguntaId) {
  if (!idValido(preguntaId)) {
    return { ok: false, status: 400, error: 'Elegí una pregunta.' }
  }

  const pregunta = await pool.query(
    `SELECT preguntas.texto, categorias.nombre AS categoria
     FROM preguntas
     JOIN categorias ON categorias.id = preguntas.categoria_id
     WHERE preguntas.id = $1`,
    [preguntaId],
  )

  if (pregunta.rowCount === 0) {
    return { ok: false, status: 404, error: 'Elegí una pregunta.' }
  }

  for (let intento = 0; intento < 5; intento += 1) {
    try {
      const result = await pool.query(
        `INSERT INTO actividades (
           id, pregunta_id, codigo, texto_pregunta, categoria_nombre, estado, iniciada_en
         )
         VALUES ($1, $2, $3, $4, $5, 'abierta', now())
         RETURNING id, codigo, texto_pregunta, categoria_nombre, estado`,
        [
          crypto.randomUUID(),
          preguntaId,
          nuevoCodigo(),
          pregunta.rows[0].texto,
          pregunta.rows[0].categoria,
        ],
      )

      return { ok: true, actividad: vistaAlumno(result.rows[0], []) }
    } catch (error) {
      if (error.code !== '23505') throw error
    }
  }

  return { ok: false, status: 503, error: 'No se pudo crear el código. Intentá de nuevo.' }
}

export async function finalizarActividad(id) {
  if (!idValido(id)) return { ok: false, status: 400, error: 'La actividad no existe.' }

  const result = await pool.query(
    `UPDATE actividades
     SET estado = 'cerrada', finalizada_en = now()
     WHERE id = $1 AND estado = 'abierta'
     RETURNING id, codigo, texto_pregunta, categoria_nombre, estado`,
    [id],
  )

  if (result.rowCount === 0) {
    const existe = await pool.query('SELECT estado FROM actividades WHERE id = $1', [id])
    return {
      ok: false,
      status: existe.rowCount === 0 ? 404 : 409,
      error: existe.rowCount === 0 ? 'La actividad no existe.' : 'La actividad ya está cerrada.',
    }
  }

  const palabras = await palabrasDe(pool, result.rows[0].id)
  return { ok: true, actividad: vistaAlumno(result.rows[0], palabras) }
}

export async function leerActividad(codigo) {
  if (!codigoValido(codigo)) return null

  const result = await pool.query(
    `SELECT id, codigo, texto_pregunta, categoria_nombre, estado
     FROM actividades
     WHERE codigo = $1`,
    [codigo],
  )

  if (result.rowCount === 0) return null

  const palabras = await palabrasDe(pool, result.rows[0].id)
  return vistaAlumno(result.rows[0], palabras)
}

export async function agregarPalabra(codigo, raw) {
  if (!codigoValido(codigo)) {
    return { ok: false, status: 404, error: 'No existe una actividad con ese código.' }
  }

  const parsed = parsePalabra(raw)
  if (!parsed.ok) return { ok: false, status: 400, error: parsed.error }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    const actividad = await client.query(
      `SELECT id, codigo, texto_pregunta, categoria_nombre, estado
       FROM actividades
       WHERE codigo = $1
       FOR UPDATE`,
      [codigo],
    )

    if (actividad.rowCount === 0) {
      await client.query('ROLLBACK')
      return { ok: false, status: 404, error: 'No existe una actividad con ese código.' }
    }

    if (actividad.rows[0].estado !== 'abierta') {
      await client.query('ROLLBACK')
      return { ok: false, status: 409, error: 'Esta actividad ya está cerrada.' }
    }

    await client.query(
      `INSERT INTO palabras (id, actividad_id, texto, normalizado, cantidad)
       VALUES ($1, $2, $3, $4, 1)
       ON CONFLICT (actividad_id, normalizado)
       DO UPDATE SET texto = EXCLUDED.texto, cantidad = palabras.cantidad + 1`,
      [crypto.randomUUID(), actividad.rows[0].id, parsed.text, parsed.normalized],
    )

    const palabras = await palabrasDe(client, actividad.rows[0].id)
    await client.query('COMMIT')
    return { ok: true, actividad: vistaAlumno(actividad.rows[0], palabras) }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
