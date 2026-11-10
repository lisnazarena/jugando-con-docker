import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { API_URL, api } from './api.js'
import Marco from './Marco.jsx'
import WordCloud from './WordCloud.jsx'

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

function sameWords(left, right) {
  if (left.length !== right.length) return false
  return left.every(
    (word, index) => word.id === right[index].id && word.count === right[index].count,
  )
}

export default function Aula({ codigo }) {
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('Cargando la actividad.')
  const [words, setWords] = useState([])
  const [texto, setTexto] = useState('')
  const [estado, setEstado] = useState('')
  const [serverDown, setServerDown] = useState(false)
  const [sending, setSending] = useState(false)
  const wordsRef = useRef([])

  function aplicar(actividad, synced) {
    const next = Array.isArray(actividad.palabras) ? actividad.palabras : []
    const previous = wordsRef.current
    const changed = !sameWords(previous, next)

    if (changed) {
      wordsRef.current = next
      setWords(next)
    }

    if (changed || !synced) {
      setNotice(
        changed && synced ? noticeForChange(previous, next) ?? noticeFor(next) : noticeFor(next),
      )
    }

    setTexto(actividad.texto ?? '')
    setEstado(actividad.estado ?? '')
    setServerDown(false)
    setError('')
  }

  useEffect(() => {
    const socket = io(API_URL || undefined, { withCredentials: true })
    let open = true
    let synced = false

    api(`/api/a/${codigo}`)
      .then((body) => {
        if (open && body.actividad) aplicar(body.actividad, false)
      })
      .catch((caught) => {
        if (!open) return
        if (caught.status === 0) setServerDown(true)
        else setError(caught.message)
      })

    socket.on('connect', () => {
      if (open) setServerDown(false)
      socket.emit('mirar', codigo)
    })

    socket.on('connect_error', () => {
      if (open) setServerDown(true)
    })

    socket.on('disconnect', () => {
      if (open) setServerDown(true)
    })

    socket.on('estado', (payload) => {
      if (!open) return
      if (!payload || payload.error) {
        setError(payload?.error || 'No existe una actividad con ese código.')
        return
      }

      aplicar(payload, synced)
      synced = true
    })

    return () => {
      open = false
      socket.close()
    }
  }, [codigo])

  async function onSubmit(event) {
    event.preventDefault()

    const text = draft.trim().replace(/\s+/g, ' ')

    if (!text) {
      setError('Escribí una palabra.')
      return
    }

    setSending(true)

    try {
      const body = await api(`/api/a/${codigo}/palabras`, {
        method: 'POST',
        body: JSON.stringify({ text }),
      })
      setDraft('')
      if (body.actividad) aplicar(body.actividad, true)
    } catch (caught) {
      if (caught.status === 0) setServerDown(true)
      else setError(caught.message)
    } finally {
      setSending(false)
    }
  }

  const abierta = estado === 'abierta'
  const statusMessage = error || (serverDown ? SERVER_DOWN : '')

  return (
    <Marco>
      <p className="question">{texto || 'Actividad'}</p>
      {estado === 'cerrada' ? (
        <p className="help">La actividad está cerrada. Las palabras quedan guardadas.</p>
      ) : null}

      <form className="word-form flex flex-col sm:flex-row" onSubmit={onSubmit}>
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
          disabled={!abierta || sending}
          aria-invalid={statusMessage ? true : undefined}
          aria-describedby={statusMessage ? 'error-palabra' : undefined}
          onChange={(event) => {
            setDraft(event.target.value)
            if (error) setError('')
          }}
        />

        <button className="ok" type="submit" disabled={!abierta || sending}>
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
    </Marco>
  )
}
