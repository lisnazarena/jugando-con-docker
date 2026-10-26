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

  points.sort((a, b) => a.x ** 2 + a.y ** 2 - (b.x ** 2 + b.y ** 2))

  return points
}

const CANDIDATES = makeCandidates()

function overlaps(current, other, aspect) {
  return (
    Math.abs(current.x - other.x) < (current.w + other.w) / 2 + 10 &&
    Math.abs(current.y - other.y) < (current.h + other.h) / 2 + 8 * aspect
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
  const stride = Math.max(1, Math.floor(CANDIDATES.length / sequence.length))

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
  const scale = Math.min(86 / (maxX - minX || 1), 78 / (maxY - minY || 1))

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

export default function placeInCloud(words, aspect) {
  if (words.length === 0) return []
  return packTokens(buildTokens(words), aspect)
}
