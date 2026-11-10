# Jugando con Docker — Lluvia de Palabras

Proyecto universitario para aprender Docker con una aplicación de aula. La entrega es el **martes 3 de noviembre de 2026**.

Un profesor plantea una pregunta. Los alumnos envían una palabra desde el celular o la computadora. En la pantalla se arma una nube: lo que se repite se ve más grande. Los cambios aparecen solos, sin recargar.

## Qué hay hoy

- Tres contenedores: sitio, API y PostgreSQL.
- El profesor entra en http://127.0.0.1:8088/profesor con la contraseña de `TEACHER_PASSWORD`. Esa clave está en `.env`, no en el código.
- El panel lista, crea, edita y borra preguntas, inicia una actividad y la cierra.
- Cada actividad copia el texto de la pregunta y tiene su propio enlace, `/a/` y un código. Los alumnos entran sin cuenta.
- Las palabras de una actividad se guardan en la tabla `palabras`, dentro del volumen de Docker. La tabla `words` quedó de la primera nube y la pantalla ya no la usa.
- Si el proceso termina solo, Docker vuelve a iniciar ese mismo contenedor. Si se lo detiene a propósito, queda detenido. El detalle de lo visto está en [docs/PRUEBAS.md](docs/PRUEBAS.md).

## Tecnologías

| Parte | Tecnología |
| --- | --- |
| Pantalla | React, Vite y Tailwind CSS |
| Servidor | Node.js, Express y Socket.IO |
| Datos | PostgreSQL 16 |
| Contenedores | Docker y Docker Compose |

## Qué hace falta tener instalado

En Ubuntu:

- Docker
- Docker Compose (el comando `docker compose`, versión 2)
- Git
- Un navegador

Node.js y npm sirven para trabajar la pantalla o la API sin reconstruir la imagen. No hacen falta para la consigna: las imágenes ya traen Node 22.

No hace falta Kubernetes ni herramientas de monitoreo.

## Cómo se levanta la versión actual

Los pasos para una computadora nueva están en [docs/LEVANTAR.md](docs/LEVANTAR.md).

```bash
cp .env.example .env
docker compose up --build
```

La pantalla abre en http://127.0.0.1:8088

## Documentos

| Archivo | Para qué sirve |
| --- | --- |
| [docs/PLAN_DIARIO.md](docs/PLAN_DIARIO.md) | Cronograma hasta el 3 de noviembre |
| [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) | Los tres contenedores y cómo se comunican |
| [docs/CONCEPTOS_DOCKER.md](docs/CONCEPTOS_DOCKER.md) | Glosario de lo que vamos aprendiendo |
| [docs/PRUEBAS.md](docs/PRUEBAS.md) | Pruebas previstas. Los resultados se anotan cuando se ejecutan |
| [docs/INFORME_FINAL.md](docs/INFORME_FINAL.md) | Borrador de la entrega. Todavía sin evidencias |
| [docs/CURSO_FRONTEND.md](docs/CURSO_FRONTEND.md) | Cómo está armada la pantalla actual |
| [docs/CURSO_BACKEND.md](docs/CURSO_BACKEND.md) | Cómo está armada la API actual |

## Qué no se publica

El archivo `.env`, contraseñas, `node_modules`, compilados y los datos de PostgreSQL. El modelo de variables está en `.env.example`, con valores ficticios.

El remoto existe en https://github.com/lisnazarena/jugando-con-docker en la rama `feature/contenedores`. Pasarlo a público queda para la entrega, después de revisar que no haya secretos.
