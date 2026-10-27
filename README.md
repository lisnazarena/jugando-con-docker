# Jugando con Docker — Lluvia de Palabras

Aplicación web para que un curso responda una pregunta del docente con una palabra corta. Las respuestas se juntan en una nube y lo más repetido se ve más grande.

El trabajo está en construcción. La fecha de entrega es el 3 de noviembre de 2026.

## Estado

La pantalla ya se puede abrir en el navegador y envía las palabras a la API del puerto 4000. La API las guarda en PostgreSQL 16. Si se detiene el proceso de Node y vuelve a arrancar, las palabras siguen. El contenedor de la base es `jugando-palabras-db`, publicado solo en `127.0.0.1:5435`. La pantalla y la API todavía no están en contenedores.

## Camino elegido

Tres contenedores, cuando los armemos:

| Contenedor | Rol |
| --- | --- |
| `web` | Sitio React, servido por Nginx |
| `api` | Node.js, Express y Socket.IO |
| `db` | PostgreSQL 16, con los datos en un volumen |

Si un contenedor se detiene, Docker lo vuelve a iniciar. Eso es una recuperación del mismo contenedor. No es una segunda copia atendiendo al mismo tiempo. La diferencia queda explicada en `docs/PLAN_DIARIO.md`. Hay una consulta pendiente con el profesor.

## Requisitos previstos

- Ubuntu 22.04
- Docker y Docker Compose
- Git

Node.js hace falta para la pantalla y la API. En esta máquina ya está instalado.

## Ver la pantalla

Hace falta Node.js. En esta máquina ya está instalado.

```bash
cd frontend
npm install
npm run dev
```

Abrí http://127.0.0.1:5173

Cómo está armada esa pantalla, archivo por archivo: [docs/CURSO_FRONTEND.md](docs/CURSO_FRONTEND.md).

## Ver la base y la API

PostgreSQL corre en un contenedor, con los datos en el volumen `jugando-palabras-pgdata`. Hace falta copiar `.env.example` a `.env` en la raíz. Ese archivo no se sube.

En una computadora donde el proyecto todavía no está, los pasos completos están en [docs/LEVANTAR.md](docs/LEVANTAR.md). Ahí se crea el contenedor. En esta máquina ya existe, y alcanza con encenderlo:

```bash
docker start jugando-palabras-db
```

En otra terminal, con Node.js:

```bash
cd backend
npm install
npm run dev
```

La API queda en http://127.0.0.1:4000. Cómo está armado ese servidor, archivo por archivo: [docs/CURSO_BACKEND.md](docs/CURSO_BACKEND.md).

## Ver las palabras guardadas

La pantalla y la API no están en Docker. La tabla sí, dentro de `jugando-palabras-db`. Con ese contenedor encendido:

```bash
docker exec jugando-palabras-db psql -U lluvia -d lluvia -c 'SELECT text, count, question, created_at FROM words ORDER BY created_at;'
```

Cada fila es una palabra distinta. `count` es cuántas veces se envió. Si la consulta no devuelve filas, la nube todavía no recibió ninguna. La explicación de las columnas y de cómo entrar a `psql` está en la lección 12 de [docs/CURSO_BACKEND.md](docs/CURSO_BACKEND.md).

Más adelante, con Docker, el comando previsto es:

```bash
docker compose up --build
```

El sitio quedaría en `http://localhost:8088`. Ese puerto se eligió porque el 8080 ya lo usa otro proyecto en esta máquina.

## Qué no se sube a GitHub

Contraseñas, archivos `.env`, `node_modules`, compilados y los datos de PostgreSQL. El modelo de variables está en `.env.example`, con valores ficticios.
