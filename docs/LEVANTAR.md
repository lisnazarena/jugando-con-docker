# Levantar el proyecto desde cero

Estos pasos sirven en una computadora donde el proyecto todavía no está. Hace falta Git, Docker y que GitHub reconozca la cuenta: el repositorio es privado.

La pantalla, la API y PostgreSQL quedan en tres contenedores. El comando que los crea es `docker compose up --build`.

## 1. Clonar

```bash
git clone https://github.com/lisnazarena/jugando-con-docker.git
cd jugando-con-docker
```

`main` ya incluye la base y Compose. Si esa rama no los tiene, el trabajo está en otra: `git checkout` de la rama que los haya mergeado.

## 2. Crear el archivo de conexión

`.env` no viene en Git.

```bash
cp .env.example .env
```

La clave `cambiar-esta-clave` es la de la base, de práctica. `TEACHER_PASSWORD` es la del panel. En el ejemplo vale `aula-de-prueba`; en esta máquina vale lo que ya esté escrito en `.env`. No subas el `.env`.

Compose usa de ese archivo el usuario, la clave, el nombre de la base, los puertos y la contraseña del profesor. La línea `DATABASE_URL` con `127.0.0.1` es para `npm run dev` en Ubuntu. Dentro de los contenedores, Compose arma otra dirección, con el nombre `db`.

## 3. Levantar los tres servicios

Los puertos 8088 y 5435 tienen que estar libres. El 5435 queda solo en esta máquina. El 4000 de la API no se publica.

```bash
docker compose up --build
```

La primera vez descarga imágenes y compila la pantalla. Puede tardar. Cuando los tres servicios digan que arrancaron, abrí http://127.0.0.1:8088.

Entrá a http://127.0.0.1:8088/profesor, iniciá una actividad y abrí el enlace en otra pestaña. Una palabra enviada ahí tiene que aparecer en la otra sin recargar.

En otra terminal, desde la misma carpeta:

```bash
docker compose ps
```

Tiene que listar `web`, `api` y `db`.

## 4. Ver las filas

```bash
docker compose exec db psql -U lluvia -d lluvia -c 'SELECT actividades.codigo, palabras.texto, palabras.cantidad FROM palabras JOIN actividades ON actividades.id = palabras.actividad_id ORDER BY palabras.created_at;'
```

Cada fila es una palabra de una actividad. `cantidad` es cuántas veces se envió. Si no hay filas, nadie envió todavía en una actividad. La tabla `words` es la de la primera nube y la pantalla ya no la usa. El SQL de `db/init/` corre cuando el volumen está vacío.

## La próxima vez

No hace falta clonar de nuevo. Desde la carpeta del proyecto:

```bash
docker compose up
```

`--build` hace falta solo si cambió el código de la pantalla o de la API.

Detener los tres, sin borrar las palabras:

```bash
docker compose stop
```

`docker compose down -v` borra también el volumen y las palabras. No se usa sin querer borrar los datos.
