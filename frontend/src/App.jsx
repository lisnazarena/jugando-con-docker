import Aula from './Aula.jsx'
import Inicio from './Inicio.jsx'
import Profesor from './Profesor.jsx'

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'

  if (path === '/profesor') return <Profesor />

  const aula = path.match(/^\/a\/([a-z0-9]+)$/)
  if (aula) return <Aula codigo={aula[1]} />

  return <Inicio />
}
