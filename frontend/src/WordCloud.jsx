import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import CloudBackground from './CloudBackground.jsx'
import placeInCloud from './placeInCloud.js'

export default function WordCloud({ words }) {
  const stageRef = useRef(null)
  const [aspect, setAspect] = useState(1.8)
  const visibleWords = useMemo(
    () => placeInCloud(words, aspect),
    [words, aspect],
  )

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

  return (
    <>
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
              <span className="cloud-word" style={{ '--size': word.size }}>
                {word.text}
              </span>
            </span>
          ))}
        </div>
      </div>
    </>
  )
}
