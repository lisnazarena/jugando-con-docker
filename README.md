# Jugando con Docker — Lluvia de Palabras

Aplicación web para que un curso responda una pregunta del docente con una palabra corta. Las respuestas se juntan en una nube y lo más repetido se ve más grande.

El trabajo está en construcción. La fecha de entrega es el 3 de noviembre de 2026.

## Estado

Los tres servicios se levantan con Docker Compose. La pantalla abre en el puerto 8088, la API no se publica en la máquina y PostgreSQL queda solo en `127.0.0.1:5435`. Las palabras están en un volumen.

## Camino elegido

Tres contenedores:

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

Node.js hace falta para cambiar la pantalla o la API con `npm run dev`. Las imágenes ya traen Node 22.

## Levantar los tres servicios

Hace falta Docker. Los pasos en una computadora nueva están en [docs/LEVANTAR.md](docs/LEVANTAR.md).

```bash
cp .env.example .env
docker compose up --build
```

Abrí http://127.0.0.1:8088

Cómo está armada la pantalla: [docs/CURSO_FRONTEND.md](docs/CURSO_FRONTEND.md). Cómo está armada la API: [docs/CURSO_BACKEND.md](docs/CURSO_BACKEND.md). Qué es una imagen y qué es un contenedor: [docs/CONCEPTOS_DOCKER.md](docs/CONCEPTOS_DOCKER.md). Los tres servicios: [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md).

## Ver las palabras guardadas

```bash
docker compose exec db psql -U lluvia -d lluvia -c 'SELECT text, count, question, created_at FROM words ORDER BY created_at;'
```

Cada fila es una palabra distinta. `count` es cuántas veces se envió. Si la consulta no devuelve filas, la nube todavía no recibió ninguna.

Para trabajar en la pantalla sin reconstruir la imagen, en dos terminales:

```bash
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

Esa pantalla abre en http://127.0.0.1:5173 y habla directo con el puerto 4000. La base tiene que estar en marcha.

## Qué no se sube a GitHub

Contraseñas, archivos `.env`, `node_modules`, compilados y los datos de PostgreSQL. El modelo de variables está en `.env.example`, con valores ficticios.
