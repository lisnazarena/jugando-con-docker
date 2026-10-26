import { useRef, useState } from 'react'

const QUESTION = 'Definí Docker en una sola palabra.'

function buildTokens(words) {
  const ranked = [...words].sort(
    (left, right) =>
      right.count - left.count ||
      left.text.localeCompare(right.text, 'es'),
  )

  const total = ranked.reduce((sum, word) => sum + word.count, 0)
  const target =
    ranked.length >= 12 ? ranked.length : Math.max(ranked.length, 18)

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
  const points = []
  const step = 12

  function insideCloud(x, y) {
    const body = (x / 300) ** 2 + (y / 145) ** 2 <= 1

    const lobes = [
      [-175, -48, 92, 83],
      [-90, -100, 105, 100],
      [25, -112, 112, 108],
      [145, -75, 105, 95],
      [220, -22, 65, 70],
    ]

    return (
      body ||
      lobes.some(
        ([cx, cy, rx, ry]) =>
          ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1,
      )
    )
  }

  for (let y = -205; y <= 175; y += step) {
    for (let x = -340; x <= 340; x += step) {
      if (insideCloud(x, y)) {
        points.push({ x, y })
      }
    }
  }

  points.sort(
    (a, b) =>
      a.x ** 2 + a.y ** 2 - (b.x ** 2 + b.y ** 2),
  )

  return points
}

const CANDIDATES = makeCandidates()

function overlaps(current, other) {
  return (
    Math.abs(current.x - other.x) <
      (current.w + other.w) / 2 + 10 &&
    Math.abs(current.y - other.y) <
      (current.h + other.h) / 2 + 8
  )
}

function packTokens(tokens) {
  if (tokens.length === 0) return []

  const ordered = [...tokens]
  let biggest = 0

  ordered.forEach((token, index) => {
    if (token.size > ordered[biggest].size) biggest = index
  })

  const [center] = ordered.splice(biggest, 1)
  const placed = []

  for (const token of [center, ...ordered]) {
    const width = Math.max(
      token.size,
      token.text.length * token.size * 0.62,
    )
    const height = token.size

    const spot = CANDIDATES.find((point) => {
      const candidate = {
        x: point.x,
        y: point.y,
        w: width,
        h: height,
      }

      return !placed.some((other) => overlaps(candidate, other))
    })

    if (!spot) continue

    placed.push({
      ...token,
      x: spot.x,
      y: spot.y,
      w: width,
      h: height,
    })
  }

  if (placed.length === 0) return []

  const minX = Math.min(...placed.map((word) => word.x - word.w / 2))
  const maxX = Math.max(...placed.map((word) => word.x + word.w / 2))
  const minY = Math.min(...placed.map((word) => word.y - word.h / 2))
  const maxY = Math.max(...placed.map((word) => word.y + word.h / 2))

  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2

  const scale = Math.min(
    86 / (maxX - minX || 1),
    78 / (maxY - minY || 1),
  )

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

function CloudBackground() {
  return (
    <svg
      className="cloud-background"
      viewBox="0 0 600 340"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient
          id="cloudColor"
          x1="0"
          y1="0"
          x2="0.2"
          y2="1"
        >
          <stop offset="0%" stopColor="#a4ffdc" stopOpacity="0.36" />
          <stop offset="55%" stopColor="#53d8b5" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#188f77" stopOpacity="0.16" />
        </linearGradient>

        <filter
          id="cloudShadow"
          x="-30%"
          y="-35%"
          width="160%"
          height="180%"
        >
          <feGaussianBlur stdDeviation="17" />
        </filter>
      </defs>

      <path
        d="M115 250
          C65 250 42 220 48 184
          C53 151 81 130 119 135
          C108 91 140 57 181 61
          C207 14 273 17 301 66
          C340 32 395 49 409 94
          C456 77 502 105 503 148
          C547 151 567 184 552 216
          C542 241 519 250 482 250 Z"
        fill="#55e5bd"
        opacity="0.75"
        filter="url(#cloudShadow)"
      />

      <path
        d="M115 245
          C75 245 54 222 59 190
          C63 159 91 141 125 145
          C113 108 143 76 180 78
          C207 35 266 37 294 79
          C330 47 384 59 399 101
          C442 86 484 111 487 150
          C525 148 547 178 536 207
          C528 233 505 245 472 245 Z"
        fill="url(#cloudColor)"
        stroke="#75f0c3"
        strokeOpacity="0.65"
        strokeWidth="2"
      />

      <path
        d="M115 235
          C80 235 66 215 70 190
          C75 166 96 152 130 156
          C120 119 147 88 182 89
          C211 47 261 49 289 88
          C325 57 375 69 389 109
          C432 94 473 119 476 157"
        fill="none"
        stroke="#e0fff3"
        strokeOpacity="0.10"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
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

            <form
              className="flex flex-col gap-2 sm:flex-row"
              onSubmit={onSubmit}
            >
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
              <CloudBackground />

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
