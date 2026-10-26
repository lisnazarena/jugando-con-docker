import { useState } from 'react'
import WordCloud from './WordCloud.jsx'

const QUESTION = 'Definí Docker en una sola palabra.'

function sameWord(left, right) {
  return left.toLocaleLowerCase('es') === right.toLocaleLowerCase('es')
}

export default function App() {
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('Todavía no hay palabras.')
  const [words, setWords] = useState([])

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

            <WordCloud words={words} />
          </div>
        </section>
      </div>
    </main>
  )
}
