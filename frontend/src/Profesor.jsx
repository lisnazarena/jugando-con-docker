import { useCallback, useEffect, useState } from 'react'
import { api } from './api.js'
import Marco from './Marco.jsx'

function enlaceDe(codigo) {
  return `${window.location.origin}/a/${codigo}`
}

export default function Profesor() {
  const [listo, setListo] = useState(false)
  const [adentro, setAdentro] = useState(false)
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const volverAlIngreso = useCallback(() => {
    setAdentro(false)
  }, [])

  useEffect(() => {
    let abierto = true

    api('/api/sesion')
      .then((body) => {
        if (abierto) setAdentro(Boolean(body.profesor))
      })
      .catch((caught) => {
        if (abierto) setError(caught.message)
      })
      .finally(() => {
        if (abierto) setListo(true)
      })

    return () => {
      abierto = false
    }
  }, [])

  async function entrar(event) {
    event.preventDefault()
    setEnviando(true)
    setError('')

    try {
      await api('/api/sesion', {
        method: 'POST',
        body: JSON.stringify({ password: clave }),
      })
      setClave('')
      setAdentro(true)
    } catch (caught) {
      setError(caught.message)
    } finally {
      setEnviando(false)
    }
  }

  async function salir() {
    setError('')

    try {
      await api('/api/sesion', { method: 'DELETE' })
      setAdentro(false)
    } catch (caught) {
      setError(caught.message)
    }
  }

  if (!listo) {
    return (
      <Marco>
        <p className="help">Cargando el panel.</p>
      </Marco>
    )
  }

  if (!adentro) {
    return (
      <Marco>
        <p className="question">Panel del profesor</p>
        <p className="help">La contraseña está en el servidor, no en esta pantalla.</p>
        <form className="word-form flex flex-col" onSubmit={entrar}>
          <label htmlFor="clave">Contraseña</label>
          <input
            id="clave"
            className="field"
            type="password"
            autoComplete="current-password"
            value={clave}
            onChange={(event) => {
              setClave(event.target.value)
              if (error) setError('')
            }}
          />
          <button className="ok" type="submit" disabled={enviando}>
            Entrar
          </button>
        </form>
        <p className="form-error" role="status">
          {error}
        </p>
        <a className="back" href="/">
          Volver
        </a>
      </Marco>
    )
  }

  return (
    <Marco>
      <div className="bar">
        <p className="question question-left">Panel del profesor</p>
        <button className="quiet" type="button" onClick={salir}>
          Salir
        </button>
      </div>
      {error ? (
        <p className="form-error" role="status">
          {error}
        </p>
      ) : null}
      <Panel onAuth={volverAlIngreso} onError={setError} />
    </Marco>
  )
}

function Panel({ onAuth, onError }) {
  const [categorias, setCategorias] = useState([])
  const [preguntas, setPreguntas] = useState([])
  const [actividades, setActividades] = useState([])
  const [categoriaId, setCategoriaId] = useState('')
  const [texto, setTexto] = useState('')
  const [aviso, setAviso] = useState('')
  const [ocupado, setOcupado] = useState(false)

  const cargar = useCallback(async () => {
    const [cats, pregs, acts] = await Promise.all([
      api('/api/categorias'),
      api('/api/preguntas'),
      api('/api/actividades'),
    ])
    setCategorias(cats.categorias)
    setPreguntas(pregs.preguntas)
    setActividades(acts.actividades)
    setCategoriaId((actual) => actual || cats.categorias[0]?.id || '')
  }, [])

  useEffect(() => {
    let abierto = true

    cargar().catch((caught) => {
      if (!abierto) return
      if (caught.status === 401) onAuth()
      else onError(caught.message)
    })

    return () => {
      abierto = false
    }
  }, [cargar, onAuth, onError])

  async function ejecutar(accion) {
    setOcupado(true)
    onError('')

    try {
      await accion()
      await cargar()
    } catch (caught) {
      if (caught.status === 401) onAuth()
      else onError(caught.message)
    } finally {
      setOcupado(false)
    }
  }

  function crear(event) {
    event.preventDefault()
    ejecutar(async () => {
      await api('/api/preguntas', {
        method: 'POST',
        body: JSON.stringify({ categoriaId, texto }),
      })
      setTexto('')
      setAviso('La pregunta quedó en el banco.')
    })
  }

  return (
    <>
      <section className="block">
        <h2>Nueva pregunta</h2>
        <form className="word-form flex flex-col" onSubmit={crear}>
          <label htmlFor="categoria">Categoría</label>
          <select
            id="categoria"
            className="field"
            value={categoriaId}
            onChange={(event) => setCategoriaId(event.target.value)}
          >
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>
          <label htmlFor="texto">Pregunta</label>
          <textarea
            id="texto"
            className="field"
            maxLength={200}
            rows={2}
            value={texto}
            onChange={(event) => setTexto(event.target.value)}
          />
          <button className="ok" type="submit" disabled={ocupado}>
            Crear
          </button>
        </form>
      </section>

      <section className="block">
        <h2>Banco</h2>
        <p className="help">
          Editar o borrar una pregunta no cambia el texto de una actividad ya iniciada.
        </p>
        {preguntas.length === 0 ? <p className="help">Todavía no hay preguntas.</p> : null}
        <ul className="rows">
          {preguntas.map((pregunta) => (
            <Pregunta
              key={pregunta.id}
              pregunta={pregunta}
              categorias={categorias}
              ocupado={ocupado}
              onEjecutar={ejecutar}
              onIniciada={(codigo) => setAviso(enlaceDe(codigo))}
            />
          ))}
        </ul>
      </section>

      <section className="block">
        <h2>Actividades</h2>
        {aviso ? (
          <p className="help">
            Enlace para los alumnos:{' '}
            <a href={aviso}>{aviso}</a>
          </p>
        ) : null}
        {actividades.length === 0 ? <p className="help">Todavía no hay actividades.</p> : null}
        <ul className="rows">
          {actividades.map((actividad) => (
            <li className="row" key={actividad.id}>
              <div>
                <p className="row-title">{actividad.texto}</p>
                <p className="meta">
                  {actividad.categoria} · {actividad.estado} · {actividad.respuestas}{' '}
                  {actividad.respuestas === 1 ? 'respuesta' : 'respuestas'}
                </p>
                <a href={enlaceDe(actividad.codigo)}>{enlaceDe(actividad.codigo)}</a>
              </div>
              {actividad.estado === 'abierta' ? (
                <button
                  className="quiet"
                  type="button"
                  disabled={ocupado}
                  onClick={() =>
                    ejecutar(() =>
                      api(`/api/actividades/${actividad.id}/finalizar`, { method: 'POST' }),
                    )
                  }
                >
                  Finalizar
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

function Pregunta({ pregunta, categorias, ocupado, onEjecutar, onIniciada }) {
  const [editando, setEditando] = useState(false)
  const [borrar, setBorrar] = useState(false)
  const [texto, setTexto] = useState(pregunta.texto)
  const [categoriaId, setCategoriaId] = useState(pregunta.categoriaId)

  if (editando) {
    return (
      <li className="row">
        <form
          className="word-form flex flex-col sm:flex-1"
          onSubmit={(event) => {
            event.preventDefault()
            onEjecutar(async () => {
              await api(`/api/preguntas/${pregunta.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ categoriaId, texto }),
              })
              setEditando(false)
            })
          }}
        >
          <label className="sr-only" htmlFor={`cat-${pregunta.id}`}>
            Categoría
          </label>
          <select
            id={`cat-${pregunta.id}`}
            className="field"
            value={categoriaId}
            onChange={(event) => setCategoriaId(event.target.value)}
          >
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor={`texto-${pregunta.id}`}>
            Pregunta
          </label>
          <textarea
            id={`texto-${pregunta.id}`}
            className="field"
            maxLength={200}
            rows={2}
            value={texto}
            onChange={(event) => setTexto(event.target.value)}
          />
          <div className="actions">
            <button className="ok" type="submit" disabled={ocupado}>
              Guardar
            </button>
            <button className="quiet" type="button" onClick={() => setEditando(false)}>
              Cancelar
            </button>
          </div>
        </form>
      </li>
    )
  }

  return (
    <li className="row">
      <div>
        <p className="row-title">{pregunta.texto}</p>
        <p className="meta">{pregunta.categoria}</p>
      </div>
      <div className="actions">
        <button
          className="ok"
          type="button"
          disabled={ocupado}
          onClick={() =>
            onEjecutar(async () => {
              const body = await api('/api/actividades', {
                method: 'POST',
                body: JSON.stringify({ preguntaId: pregunta.id }),
              })
              onIniciada(body.actividad.codigo)
            })
          }
        >
          Iniciar
        </button>
        <button className="quiet" type="button" onClick={() => setEditando(true)}>
          Editar
        </button>
        {borrar ? (
          <>
            <button
              className="danger"
              type="button"
              disabled={ocupado}
              onClick={() =>
                onEjecutar(async () => {
                  await api(`/api/preguntas/${pregunta.id}`, { method: 'DELETE' })
                  setBorrar(false)
                })
              }
            >
              Confirmar
            </button>
            <button className="quiet" type="button" onClick={() => setBorrar(false)}>
              Cancelar
            </button>
          </>
        ) : (
          <button className="quiet" type="button" onClick={() => setBorrar(true)}>
            Borrar
          </button>
        )}
      </div>
    </li>
  )
}
