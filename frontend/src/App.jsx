import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import WordCloud from './WordCloud.jsx'

const QUESTION = 'Definí Docker en una sola palabra.'
const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:4000'
const SERVER_DOWN = 'El servidor no responde. Revisá que la aplicación esté en marcha.'

function timesLabel(count) {
  return count === 1 ? 'vez' : 'veces'
}

function noticeFor(words) {
  if (words.length === 0) return 'Todavía no hay palabras.'

  const parts = words.map(
    (word) => `${word.text}, ${word.count} ${timesLabel(word.count)}`,
  )
  return `Palabras en la nube: ${parts.join('. ')}.`
}

function noticeForChange(previous, next) {
  const changed = next.find((word) => {
    const before = previous.find((item) => item.id === word.id)
    return !before || before.count !== word.count
  })

  if (!changed) return null
  return `Se agregó ${changed.text}. Va ${changed.count} ${timesLabel(changed.count)}.`
}

export default function App() {
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('Todavía no hay palabras.')
  const [words, setWords] = useState([])
  const [serverDown, setServerDown] = useState(false)
  const [sending, setSending] = useState(false)
  const wordsRef = useRef([])

  useEffect(() => {
    const socket = io(API_URL || undefined)
    let open = true
    let synced = false

    socket.on('connect', () => {
      if (open) setServerDown(false)
    })

    socket.on('connect_error', () => {
      if (open) setServerDown(true)
    })

    socket.on('disconnect', () => {
      if (open) setServerDown(true)
    })

    socket.on('words', (next) => {
      if (!open || !Array.isArray(next)) return

      const previous = wordsRef.current
      wordsRef.current = next
      setWords(next)
      setServerDown(false)
      setNotice(
        synced ? noticeForChange(previous, next) ?? noticeFor(next) : noticeFor(next),
      )
      synced = true
    })

    return () => {
      open = false
      socket.close()
    }
  }, [])

  async function onSubmit(event) {
    event.preventDefault()

    const text = draft.trim().replace(/\s+/g, ' ')

    if (!text) {
      setError('Escribí una palabra.')
      return
    }

    setSending(true)

    try {
      const response = await fetch(`${API_URL}/api/words`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const body = await response.json().catch(() => ({}))

      if (!response.ok) {
        setError(body.error || 'No se pudo guardar la palabra.')
        return
      }

      setError('')
      setDraft('')
      setServerDown(false)

      if (Array.isArray(body.words)) {
        const previous = wordsRef.current
        wordsRef.current = body.words
        setWords(body.words)
        setNotice(noticeForChange(previous, body.words) ?? noticeFor(body.words))
      }
    } catch {
      setServerDown(true)
    } finally {
      setSending(false)
    }
  }

  const statusMessage = error || (serverDown ? SERVER_DOWN : '')

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
                aria-invalid={statusMessage ? true : undefined}
                aria-describedby={statusMessage ? 'error-palabra' : undefined}
                onChange={(event) => {
                  setDraft(event.target.value)
                  if (error) setError('')
                }}
              />

              <button className="ok" type="submit" disabled={sending}>
                Enviar
              </button>
            </form>

            <p id="error-palabra" className="form-error" role="status">
              {statusMessage}
            </p>

            <p className="sr-only" aria-live="polite">
              {notice}
            </p>

            <WordCloud words={words} />
          </div>
        </section>
      </div>
    </main>
  )
}
