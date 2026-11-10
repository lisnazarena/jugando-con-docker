export const API_URL = import.meta.env.VITE_API_URL ?? ''

export async function api(path, options = {}) {
  let response

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        ...(options.body ? { 'content-type': 'application/json' } : {}),
        ...(options.headers ?? {}),
      },
    })
  } catch {
    const error = new Error('El servidor no responde. Revisá que la aplicación esté en marcha.')
    error.status = 0
    throw error
  }

  const text = await response.text()
  let body = {}

  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      body = {}
    }
  }

  if (!response.ok) {
    const error = new Error(body.error || 'No se pudo completar el pedido.')
    error.status = response.status
    throw error
  }

  return body
}
