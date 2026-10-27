import pg from 'pg'

const QUESTION = 'Definí Docker en una sola palabra.'

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
})

function normalize(text) {
  return text.toLocaleLowerCase('es')
}

function parseWord(raw) {
  if (typeof raw !== 'string') {
    return { ok: false, error: 'Escribí una palabra.' }
  }

  const text = raw.trim().replace(/\s+/g, ' ')

  if (!text) {
    return { ok: false, error: 'Escribí una palabra.' }
  }

  if (text.length > 32) {
    return { ok: false, error: 'La palabra puede tener hasta 32 caracteres.' }
  }

  return { ok: true, text, normalized: normalize(text) }
}

function toWords(rows) {
  return rows.map((row) => ({
    id: row.id,
    text: row.text,
    count: Number(row.count),
  }))
}

export async function listWords() {
  const result = await pool.query(
    'SELECT id, text, count FROM words ORDER BY created_at, id',
  )
  return toWords(result.rows)
}

export async function addWord(raw) {
  const parsed = parseWord(raw)
  if (!parsed.ok) return parsed

  await pool.query(
    `INSERT INTO words (id, text, normalized, count, question)
     VALUES ($1, $2, $3, 1, $4)
     ON CONFLICT (normalized)
     DO UPDATE SET text = EXCLUDED.text, count = words.count + 1`,
    [crypto.randomUUID(), parsed.text, parsed.normalized, QUESTION],
  )

  return { ok: true, words: await listWords() }
}
