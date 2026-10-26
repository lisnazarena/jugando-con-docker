import { useLayoutEffect, useMemo, useRef, useState } from 'react'

const QUESTION = 'Definí Docker en una sola palabra.'

function buildTokens(words) {
  const ranked = [...words].sort(
    (left, right) =>
      right.count - left.count ||
      left.text.localeCompare(right.text, 'es'),
  )
  const maxCount = ranked[0].count

  return ranked.map((word) => ({
    id: word.id,
    text: word.text,
    count: word.count,
    size: Math.round(15 + 16 * (word.count / maxCount)),
  }))
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

function overlaps(current, other, aspect) {
  return (
    Math.abs(current.x - other.x) <
      (current.w + other.w) / 2 + 10 &&
    Math.abs(current.y - other.y) <
      (current.h + other.h) / 2 + 8 * aspect
  )
}

function orderFromCenter(tokens) {
  const ordered = [...tokens]
  let biggest = 0

  ordered.forEach((token, index) => {
    if (token.size > ordered[biggest].size) biggest = index
  })

  const [center] = ordered.splice(biggest, 1)
  return [center, ...ordered]
}

function tokenBox(token, shrink, aspect) {
  const size = token.size * shrink

  return {
    size,
    w: Math.max(size, token.text.length * size * 0.62),
    h: size * 1.15 * aspect,
  }
}

function layoutTokens(tokens, shrink, aspect) {
  const placed = []

  for (const token of orderFromCenter(tokens)) {
    const box = tokenBox(token, shrink, aspect)
    const spot = CANDIDATES.find((point) => {
      const candidate = { x: point.x, y: point.y, w: box.w, h: box.h }
      return !placed.some((other) => overlaps(candidate, other, aspect))
    })

    if (!spot) return null

    placed.push({
      ...token,
      ...box,
      x: spot.x,
      y: spot.y,
    })
  }

  return placed
}

function forceTokens(tokens, shrink, aspect) {
  const sequence = orderFromCenter(tokens)
  const stride = Math.max(
    1,
    Math.floor(CANDIDATES.length / sequence.length),
  )

  return sequence.map((token, index) => {
    const box = tokenBox(token, shrink, aspect)
    const spot = CANDIDATES[Math.min(index * stride, CANDIDATES.length - 1)]

    return {
      ...token,
      ...box,
      x: spot.x,
      y: spot.y,
    }
  })
}

function toStage(placed) {
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

  return placed.map((word) => ({
    id: word.id,
    text: word.text,
    count: word.count,
    size: word.size * scale,
    x: 50 + (word.x - centerX) * scale,
    y: 50 + (word.y - centerY) * scale,
  }))
}

function packTokens(tokens, aspect) {
  if (tokens.length === 0) return []

  let shrink = 1
  let placed = null

  for (let attempt = 0; attempt < 16 && !placed; attempt += 1) {
    placed = layoutTokens(tokens, shrink, aspect)
    shrink *= 0.82
  }

  return toStage(placed ?? forceTokens(tokens, shrink, aspect))
}

function placeInCloud(words, aspect) {
  if (words.length === 0) return []
  return packTokens(buildTokens(words), aspect)
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
  const stageRef = useRef(null)
  const [aspect, setAspect] = useState(1.8)

  useLayoutEffect(() => {
    const node = stageRef.current
    if (!node) return

    const update = () => {
      const next = node.clientWidth / Math.max(node.clientHeight, 1)
      setAspect((current) =>
        Math.abs(current - next) < 0.02 ? current : next,
      )
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  function onSubmit(event) {
    event.preventDefault()

    const text = draft.trim().replace(/\s+/g, ' ')

    if (!text) {
      setError('Escribí una palabra.')
      return
    }

    const existing = words.find((word) => sameWord(word.text, text))
    const count = (existing?.count ?? 0) + 1

    setError('')
    setDraft('')
    setWords(
      existing
        ? words.map((word) =>
            sameWord(word.text, text) ? { ...word, text, count } : word,
          )
        : [...words, { id: crypto.randomUUID(), text, count }],
    )

    const times = count === 1 ? 'vez' : 'veces'
    setNotice(`Se agregó ${text}. Va ${count} ${times}.`)
  }

  const visibleWords = useMemo(
    () => placeInCloud(words, aspect),
    [words, aspect],
  )

  return (
    <main className="desktop">
      <div className="flex min-h-dvh items-center justify-center">
        <section className="window">
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

          <div className="panel flex flex-col">
            <p className="question">{QUESTION}</p>

            <form
              className="word-form flex flex-col sm:flex-row"
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

            <ul className="sr-only" aria-label="Palabras de la nube">
              {visibleWords.map((word) => {
                const times = word.count === 1 ? 'vez' : 'veces'

                return (
                  <li key={word.id}>
                    {word.text}, {word.count} {times}
                  </li>
                )
              })}
            </ul>

            <div className="stage" ref={stageRef}>
              <CloudBackground />

              <div className="cloud-float" aria-hidden="true">
                {visibleWords.map((word) => (
                  <span
                    key={word.id}
                    className="cloud-anchor"
                    style={{
                      '--x': `${word.x}%`,
                      '--y': `${word.y}%`,
                    }}
                  >
                    <span
                      className="cloud-word"
                      style={{ '--size': word.size }}
                    >
                      {word.text}
                    </span>
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
