import { useRef, useState } from 'react'

const QUESTION = 'Definí Docker en una sola palabra.'
function buildTokens(words) {
  const ranked = [...words].sort(
    (left, right) => right.count - left.count || left.text.localeCompare(right.text, 'es'),
  )
  const total = ranked.reduce((sum, word) => sum + word.count, 0)
  const target = ranked.length >= 12 ? ranked.length : Math.max(ranked.length, 18)
  const quota = ranked.map((word) => ({
    text: word.text,
    size: Math.round(15 + 16 * (word.count / ranked[0].count)),
    left: Math.max(1, Math.round((word.count / total) * target)),
  }))

  let assigned = quota.reduce((sum, item) => sum + item.left, 0)
  let cursor = 0
  while (assigned < target) {
    quota[cursor % quota.length].left += 1
    assigned += 1
    cursor += 1
  }
  while (assigned > target) {
    const donor = quota.find((item) => item.left > 1)
    if (!donor) break
    donor.left -= 1
    assigned -= 1
  }

  const tokens = []
  let pending = true
  while (pending) {
    pending = false
    for (const item of quota) {
      if (item.left > 0) {
        tokens.push({ text: item.text, size: item.size })
        item.left -= 1
        pending = true
      }
    }
  }
  return tokens
}

function makeCandidates() {
  const points = [{ x: 0, y: 0 }]
  for (let ring = 1; ring <= 26; ring += 1) {
    const count = 6 + ring * 2
    for (let step = 0; step < count; step += 1) {
      const angle = (step / count) * Math.PI * 2 + ring * 0.35
      points.push({
        x: Math.cos(angle) * ring * 16,
        y: Math.sin(angle) * ring * 10,
      })
    }
  }
  return points
}

const CANDIDATES = makeCandidates()

function overlaps(current, other) {
  return (
    Math.abs(current.x - other.x) < (current.w + other.w) / 2 + 10 &&
    Math.abs(current.y - other.y) < (current.h + other.h) / 2 + 8
  )
}

function packTokens(tokens) {
  const ordered = [...tokens]
  let biggest = 0
  ordered.forEach((token, index) => {
    if (token.size > ordered[biggest].size) biggest = index
  })
  const [center] = ordered.splice(biggest, 1)
  const placed = []

  for (const token of [center, ...ordered]) {
    const width = Math.max(token.size, token.text.length * token.size * 0.62)
    const height = token.size
    const spot = CANDIDATES.find((point) => {
      const candidate = { x: point.x, y: point.y, w: width, h: height }
      return !placed.some((other) => overlaps(candidate, other))
    })
    if (!spot) continue
    placed.push({ ...token, x: spot.x, y: spot.y, w: width, h: height })
  }

  const minX = Math.min(...placed.map((word) => word.x - word.w / 2))
  const maxX = Math.max(...placed.map((word) => word.x + word.w / 2))
  const minY = Math.min(...placed.map((word) => word.y - word.h / 2))
  const maxY = Math.max(...placed.map((word) => word.y + word.h / 2))
  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2
  const scale = Math.min(86 / (maxX - minX || 1), 78 / (maxY - minY || 1))

  return placed.map((word, index) => ({
    key: `${index}-${word.text}`,
    text: word.text,
    size: word.size * scale,
    x: 50 + (word.x - centerX) * scale,
    y: 50 + (word.y - centerY) * scale,
  }))
}

function placeInCloud(words) {
  if (words.length === 0) return []
  return packTokens(buildTokens(words))
}

function sameWord(left, right) {
  return left.toLocaleLowerCase('es') === right.toLocaleLowerCase('es')
}

export default function App() {
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('Todavía no hay palabras.')
  const [words, setWords] = useState([])
  const countsRef = useRef({})

  function onSubmit(event) {
    event.preventDefault()
    const text = draft.trim().replace(/\s+/g, ' ')
    if (!text) {
      setError('Escribí una palabra.')
      return
    }

    const key = text.toLocaleLowerCase('es')
    const count = (countsRef.current[key] ?? 0) + 1
    countsRef.current[key] = count

    setError('')
    setDraft('')
    setWords((current) => {
      const exists = current.some((word) => sameWord(word.text, text))
      if (!exists) {
        return [...current, { id: crypto.randomUUID(), text, count }]
      }
      return current.map((word) =>
        sameWord(word.text, text) ? { ...word, text, count } : word,
      )
    })
    const times = count === 1 ? 'vez' : 'veces'
    setNotice(`Se agregó ${text}. Va ${count} ${times}.`)
  }

  const visibleWords = placeInCloud(words)

  return (
    <main className="desktop">
      <div className="flex min-h-dvh items-center justify-center p-4">
        <section className="window p-3">
          <div className="titlebar" aria-hidden="true">
            <span className="title-button">
              <span className="mark-min" />
            </span>
            <span className="title-button">
              <span className="mark-max" />
            </span>
            <span className="title-button">
              <span className="mark-close" />
            </span>
          </div>

          <div className="flex flex-col gap-3 p-2">
            <p className="question">{QUESTION}</p>

            <form className="flex flex-col gap-2 sm:flex-row" onSubmit={onSubmit}>
              <label className="sr-only" htmlFor="palabra">
                Palabra o frase corta
              </label>
              <input
                id="palabra"
                className="field sm:flex-1"
                value={draft}
                maxLength={32}
                autoComplete="off"
                spellCheck={false}
                placeholder="una palabra"
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'error-palabra' : undefined}
                onChange={(event) => {
                  setDraft(event.target.value)
                  if (error) setError('')
                }}
              />
              <button className="ok" type="submit">
                Enviar
              </button>
            </form>

            <p id="error-palabra" className="form-error" role="status">
              {error}
            </p>

            <p className="sr-only" aria-live="polite">
              {notice}
            </p>

            <div className="stage">
              <div className="cloud-float" aria-hidden="true">
                {visibleWords.map((word) => (
                  <span
                    key={word.key}
                    className="cloud-word"
                    style={{
                      '--x': `${word.x}%`,
                      '--y': `${word.y}%`,
                      '--size': word.size,
                    }}
                  >
                    {word.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
