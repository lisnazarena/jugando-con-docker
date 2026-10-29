# Conceptos de Docker en este proyecto

Estos nombres se usan para lo que ya se construyó. No describen una caída medida: eso queda para `docs/PRUEBAS.md`.

## Imagen

Una imagen es el paquete inmutable: el programa, sus librerías y la orden de arranque. No atiende pedidos. Se puede usar para crear muchos contenedores.

En esta máquina, después de `docker compose build`, hay dos imágenes de este proyecto:

| Imagen | De dónde sale |
| --- | --- |
| `jugando-con-docker-web` | `frontend/Dockerfile`. Node 22 compila el sitio y Nginx lo deja listo para servirlo |
| `jugando-con-docker-api` | `backend/Dockerfile`. Node 22 con Express, Socket.IO y el cliente de PostgreSQL |

La base no tiene Dockerfile propio. Usa la imagen oficial `postgres:16`.

## Contenedor

Un contenedor es una imagen en ejecución. Se puede detener y volver a crear. La imagen no cambia por eso.

`docker compose ps` muestra tres contenedores de este proyecto:

| Contenedor | Imagen | Qué hace |
| --- | --- | --- |
| `jugando-con-docker-web-1` | `jugando-con-docker-web` | Sirve la pantalla en el puerto 8088 |
| `jugando-con-docker-api-1` | `jugando-con-docker-api` | Recibe palabras y avisa a las pestañas |
| `jugando-con-docker-db-1` | `postgres:16` | Guarda las filas |

El contenedor de la API se reinició y la palabra `imagen` siguió en la base. El proceso nuevo volvió a leer la tabla. La imagen no se volvió a construir para eso.

## Volumen

Un volumen es un disco de Docker, fuera de la carpeta del repositorio. El de Compose se llama `jugando-con-docker_pgdata` y está montado en los datos de PostgreSQL.

Detener o recrear el contenedor `db` no borra ese volumen. Borrarlo sí borra las palabras. El comando es `docker compose down -v`. No se usa sin decir antes qué va a borrar.

## Red

Compose crea una red interna para estos tres contenedores. La API habla con la base por el nombre `db`, en el puerto 5432 de esa red. Ese nombre no existe en Ubuntu.

El navegador no entra a esa red. Habla solo con `web`, en el puerto 8088. Nginx reenvía `/api` y Socket.IO hacia el contenedor `api`. El puerto 4000 de la API no está publicado en la máquina.

PostgreSQL sí tiene un puerto publicado, y solo en esta máquina: `127.0.0.1:5435`. No queda abierto hacia el resto de la red.

## Reinicio

`restart: unless-stopped` le pide a Docker que vuelva a crear el mismo contenedor si el proceso termina o si se reinicia la computadora. Es el mismo servicio, con una interrupción corta. No es una segunda copia atendiendo mientras la primera está caída.

## Réplica

Una réplica sería otra instancia del mismo servicio, viva al mismo tiempo. Este proyecto no la tiene. La duda con la consigna sigue abierta y está escrita en `docs/PLAN_DIARIO.md`.
