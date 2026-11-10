import Marco from './Marco.jsx'

export default function Inicio() {
  return (
    <Marco>
      <p className="question">Lluvia de palabras</p>
      <p className="help">
        El profesor abre el panel, elige una pregunta e inicia la actividad. Los alumnos
        entran con el enlace de esa actividad, sin cuenta.
      </p>
      <a className="ok link-button" href="/profesor">
        Panel del profesor
      </a>
    </Marco>
  )
}
