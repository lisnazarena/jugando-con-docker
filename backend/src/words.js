const words = []

function sameWord(left, right) {
  return left.toLocaleLowerCase('es') === right.toLocaleLowerCase('es')
}

export function listWords() {
  return words.map((word) => ({ ...word }))
}

export function addWord(raw) {
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

  const existing = words.find((word) => sameWord(word.text, text))

  if (existing) {
    existing.count += 1
    existing.text = text
  } else {
    words.push({
      id: crypto.randomUUID(),
      text,
      count: 1,
    })
  }

  return { ok: true, words: listWords() }
}
