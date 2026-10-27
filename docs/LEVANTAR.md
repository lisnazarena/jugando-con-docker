# Levantar el proyecto desde cero

Estos pasos sirven en una computadora donde el proyecto todavía no está. En esta máquina el contenedor de la base ya existe. En la de la universidad hay que crearlo.

La pantalla y la API no van en Docker. Solo PostgreSQL corre en un contenedor. Las imágenes y `docker compose up` llegan más adelante. Hoy no alcanzan para abrir el proyecto.

## Qué tiene que estar instalado

- Git
- Docker
- Node.js 20 o más nuevo

El repositorio es privado. GitHub tiene que reconocer la cuenta antes del `git clone`. Si `node -v` muestra una versión menor que 20, `npm run dev` de la API no va a poder leer el archivo `.env`.

Los puertos 5173, 4000 y 5435 tienen que estar libres.

## 1. Clonar y elegir la rama

```bash
git clone https://github.com/lisnazarena/jugando-con-docker.git
cd jugando-con-docker
git checkout feature/persistencia
```

`feature/persistencia` es la rama que guarda las palabras en PostgreSQL. Cuando ese trabajo esté en `main`, el `git checkout` deja de hacer falta: `git clone` ya deja la rama correcta.

## 2. Crear el archivo de conexión

`.env` no viene en Git. Se copia del ejemplo y, para esta etapa, se deja como está.

```bash
cp .env.example .env
```

La clave `cambiar-esta-clave` es la de práctica. La dirección `127.0.0.1:5435` es la que usa la API mientras corre en Ubuntu y la base corre en el contenedor. No subas el `.env`.

## 3. Crear la base, una sola vez

Este comando baja la imagen `postgres:16`, crea el contenedor `jugando-palabras-db` y el volumen `jugando-palabras-pgdata`. Las palabras quedan en ese volumen, no en la carpeta del proyecto.

Hay que ejecutarlo desde la carpeta del repositorio, para que `$PWD/db/init` encuentre el SQL de la tabla.

```bash
docker run -d \
  --name jugando-palabras-db \
  --restart unless-stopped \
  -e POSTGRES_USER=lluvia \
  -e POSTGRES_PASSWORD=cambiar-esta-clave \
  -e POSTGRES_DB=lluvia \
  -p 127.0.0.1:5435:5432 \
  -v jugando-palabras-pgdata:/var/lib/postgresql/data \
  -v "$PWD/db/init:/docker-entrypoint-initdb.d:ro" \
  postgres:16
```

`--restart unless-stopped` vuelve a encender el contenedor cuando se reinicia la computadora, salvo que alguien lo haya detenido con `docker stop`. El puerto queda publicado solo en esta máquina.

La primera vez, PostgreSQL ejecuta `db/init/001_words.sql` y crea la tabla `words`. Eso ocurre solo cuando el volumen está vacío. Esperá unos segundos y comprobá:

```bash
docker exec jugando-palabras-db psql -U lluvia -d lluvia -c '\d words'
```

Tiene que mostrar las columnas `text`, `count`, `question` y `created_at`. Todavía no hay filas.

Si el comando dice que el nombre `jugando-palabras-db` ya existe, el contenedor ya fue creado en esa computadora. No hace falta otro `docker run`. Seguí con el paso 4 usando `docker start jugando-palabras-db`.

## 4. Levantar la API

En otra terminal, desde la carpeta del proyecto:

```bash
cd backend
npm install
npm run dev
```

Tiene que aparecer `API en http://127.0.0.1:4000`. Dejá esa terminal abierta. Si dice que falta `DATABASE_URL`, el `.env` no está en la raíz del repositorio o el comando no se corrió desde `backend/`.

## 5. Levantar la pantalla

En una tercera terminal:

```bash
cd frontend
npm install
npm run dev
```

Abrí http://127.0.0.1:5173.

Enviá una palabra. Abrí la misma dirección en otra pestaña: tiene que aparecer sin recargar. La nube arranca vacía solo la primera vez, antes de que alguien envíe.

## 6. Ver las filas

```bash
docker exec jugando-palabras-db psql -U lluvia -d lluvia -c 'SELECT text, count, question, created_at FROM words ORDER BY created_at;'
```

Cada fila es una palabra distinta. `count` es cuántas veces se envió. Cómo leer la tabla con más calma está en la lección 12 de [CURSO_BACKEND.md](CURSO_BACKEND.md).

## La próxima vez, en la misma computadora

No repitas el `git clone` ni el `docker run`. El volumen ya tiene las palabras.

```bash
cd jugando-con-docker
git checkout feature/persistencia
docker start jugando-palabras-db
```

Después, en dos terminales distintas, `npm run dev` dentro de `backend/` y dentro de `frontend/`.

Si apagás la API con Ctrl+C y la volvés a levantar, las filas siguen. Se borran si se borra el volumen `jugando-palabras-pgdata`.
