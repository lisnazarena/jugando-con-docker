# Jugando con Docker — Lluvia de Palabras

Aplicación web para que un curso responda una pregunta del docente con una palabra corta. Las respuestas se juntan en una nube y lo más repetido se ve más grande.

El trabajo está en construcción. La fecha de entrega es el 3 de noviembre de 2026.

## Estado

La pantalla ya se puede abrir en el navegador. Todavía no hay servidor ni contenedores. Las palabras viven solo en esa pestaña: al recargar, desaparecen.

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

Node.js hace falta el día que empecemos el sitio y la API. Los comandos de instalación se agregan acá cuando los hayamos probado.

## Ver la pantalla

Hace falta Node.js. En esta máquina ya está instalado.

```bash
cd frontend
npm install
npm run dev
```

Abrí http://127.0.0.1:5173

Más adelante, con Docker, el comando previsto es:

```bash
docker compose up --build
```

El sitio quedaría en `http://localhost:8088`. Ese puerto se eligió porque el 8080 ya lo usa otro proyecto en esta máquina.

## Qué no se sube a GitHub

Contraseñas, archivos `.env`, `node_modules`, compilados y los datos de PostgreSQL. El modelo de variables está en `.env.example`, con valores ficticios.
