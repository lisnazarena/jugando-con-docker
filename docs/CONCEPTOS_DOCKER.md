# Conceptos

Glosario del proyecto. Cada definición corresponde a algo que ya usamos o que el plan nombra para los próximos días. Si una prueba todavía no se hizo, el concepto lo dice.

## Docker

Docker es el programa que construye imágenes y pone contenedores en marcha en esta Ubuntu. No es la aplicación Lluvia de Palabras. La aplicación corre adentro de los contenedores.

## Imagen

Una imagen es el paquete quieto: el programa, sus librerías y la orden de arranque. No atiende pedidos. Sirve de molde para crear contenedores.

En esta máquina, después de `docker compose build`, hay dos imágenes propias:

| Imagen | De dónde sale |
| --- | --- |
| `jugando-con-docker-web` | `frontend/Dockerfile`. Node 22 compila el sitio y Nginx lo sirve |
| `jugando-con-docker-api` | `backend/Dockerfile`. Node 22 con Express, Socket.IO y el cliente de PostgreSQL |

La base usa la imagen oficial `postgres:16`. No tiene Dockerfile propio.

## Contenedor

Un contenedor es una imagen en ejecución. Se puede detener y volver a crear. Eso no modifica la imagen.

`docker compose ps` muestra tres contenedores de este proyecto: `web`, `api` y `db`. Los nombres largos que muestra Docker llevan el prefijo `jugando-con-docker-`.

## Docker Compose

Compose lee `docker-compose.yml` y levanta varios contenedores juntos, con una red y un volumen. El comando de todos los días es `docker compose up --build`.

## Red

Compose crea una red interna para estos tres contenedores. Dentro de esa red, la API llega a la base usando el nombre `db` y el puerto 5432. Ese nombre no existe en Ubuntu: existe solo entre los contenedores.

El navegador habla con el puerto 8088 de `web`. Nginx reenvía `/api` y Socket.IO al contenedor `api`. El puerto 4000 no está publicado en la máquina.

PostgreSQL publica el 5432 del contenedor en `127.0.0.1:5435`. Ese puerto responde en esta computadora y no queda abierto al resto de la red.

## Volumen

Un volumen es un lugar de almacenamiento que Docker administra aparte de la carpeta del contenedor. El de este proyecto se llama `jugando-con-docker_pgdata` y guarda los archivos de PostgreSQL.

Sirve porque el disco de un contenedor es descartable. Si los datos vivieran solo ahí, se irían al borrar el contenedor.

Qué se espera en cada caso:

| Acción | El contenedor | El volumen |
| --- | --- | --- |
| Detenerlo (`docker compose stop db`) | Se apaga. Los datos no se usan hasta que vuelve | Sigue |
| Volver a iniciarlo | Arranca y abre los mismos archivos | Sigue |
| Borrar el contenedor y crearlo de nuevo, sin tocar el volumen | Es un contenedor nuevo, con la misma imagen | Sigue, y la base vuelve a ver las filas |
| `docker compose down -v` o `docker volume rm` | Se van los contenedores de este proyecto | Se borra. Las palabras también |

Esa última fila no se ejecuta para «probar». Borra los datos de verdad.

Un volumen no reemplaza a una copia de seguridad. Vive en esta máquina, asociado a Docker. No hay otra copia en un disco distinto ni en otro servidor. Perder el volumen, o el disco, pierde las preguntas y las respuestas.

## Script de inicio

La imagen de PostgreSQL, la primera vez que el volumen está vacío, ejecuta los archivos `.sql` de `db/init/` en orden alfabético. En este proyecto eso crea `words` y, después, el banco.

Si el volumen ya tiene datos, PostgreSQL no vuelve a ejecutar esos archivos al reiniciar el contenedor. Un archivo nuevo hay que aplicarlo a mano, como se hizo el 31 de octubre con `002_banco.sql`. Si no, la base vieja sigue sin las tablas nuevas aunque el archivo ya esté en la carpeta.

El 4 de noviembre se borró el contenedor `db` y se creó otro, sin borrar el volumen. Las actividades y las palabras siguieron. El procedimiento y los tiempos están en [PRUEBAS.md](PRUEBAS.md).

## Reinicio automático

`restart: unless-stopped` le dice a Docker: si este contenedor se cae solo, volvé a iniciarlo; si yo lo detuve a propósito, dejalo detenido hasta que yo lo levante; si reinicio la computadora, volvé a iniciarlo.

Es una recuperación del mismo contenedor. Hay un intervalo en el que ese servicio no responde. No aparece una segunda copia mientras tanto.

## Réplica

Una réplica es otra instancia del mismo servicio, encendida al mismo tiempo. Este proyecto no tiene réplicas. La diferencia con el reinicio está explicada en [ARQUITECTURA.md](ARQUITECTURA.md).

## Variable de entorno

Una variable de entorno es un dato que el proceso recibe al arrancar, fuera del código. La contraseña de PostgreSQL ya funciona así: está en `.env` en esta máquina y Compose se la pasa al contenedor. `.env` no se sube a GitHub. `.env.example` muestra los nombres, con valores falsos.

La contraseña del profesor usa el mismo mecanismo, con el nombre `TEACHER_PASSWORD`. `.env.example` trae el valor falso `aula-de-prueba`. La de esta máquina es la que quedó en `.env`. El contenedor `api` la recibe al arrancar. El JavaScript no la incluye.

## Cookie de sesión

Es un dato que el navegador reenvía solo al sitio. `HttpOnly` significa que el JavaScript de la página no puede leerla. Así la contraseña no queda guardada en React. El servidor guarda en `sesiones` la huella de un número al azar, no la contraseña. El 4 de noviembre, después de que el proceso de `api` terminó y Docker lo inició de nuevo, esa cookie seguía entrando al panel. El detalle está en [ARQUITECTURA.md](ARQUITECTURA.md).

## Git y GitHub

Git guarda el historial del proyecto en esta computadora. Cada commit es una versión con un mensaje.

GitHub guarda una copia de ese historial en internet. El remoto de este proyecto es `origin`, en https://github.com/lisnazarena/jugando-con-docker

Una rama es una línea de commits. La rama actual se llama `feature/contenedores`.

`git status` muestra qué cambió y todavía no está en un commit. `git diff` muestra el contenido de ese cambio. `git log` muestra los commits ya hechos.
