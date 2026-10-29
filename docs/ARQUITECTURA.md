# Arquitectura

Tres servicios definidos en `docker-compose.yml`. El 29 de octubre `docker compose ps` los mostró en marcha, la pantalla abrió en http://127.0.0.1:8088 y una palabra enviada quedó en PostgreSQL.

No está medido qué pasa al detener cada uno. Esa prueba es la del viernes y se anota en `docs/PRUEBAS.md`, cuando exista.

## Los tres servicios

| Servicio | Imagen | Publicado en Ubuntu | Con quién habla |
| --- | --- | --- | --- |
| `web` | Construida con `frontend/Dockerfile` | `8088` hacia el puerto 80 de Nginx | El navegador. Nginx sirve el sitio y reenvía `/api` y `/socket.io` a `api` |
| `api` | Construida con `backend/Dockerfile` | No se publica. Escucha el 4000 solo dentro de la red de Compose | Lee y escribe en `db`. Avisa a los navegadores por Socket.IO |
| `db` | `postgres:16`, la oficial | `127.0.0.1:5435` hacia el 5432 interno | Solo acepta a quien llegue a ese puerto o a la red interna |

La pantalla compilada llama a la API en el mismo origen. En desarrollo, con `npm run dev`, sigue usando `http://127.0.0.1:4000` porque Vite no pasa por Nginx.

## Datos

El volumen `jugando-con-docker_pgdata` guarda los archivos de PostgreSQL. No está en el repositorio. La tabla se crea con `db/init/001_words.sql` la primera vez que el volumen está vacío.

La contraseña y el nombre de la base salen de `.env`. Dentro de la red, la API no usa la dirección de Ubuntu: Compose arma `DATABASE_URL` con el nombre `db` y el puerto 5432.

## Qué se vio

- `docker compose ps` lista `web`, `api` y `db`.
- http://127.0.0.1:8088 carga la pregunta y la nube.
- Una palabra enviada desde esa pantalla queda en la tabla `words`.
- Al reiniciar solo el contenedor `api`, esa fila sigue.
- PostgreSQL escucha en `127.0.0.1:5435`, no en todas las interfaces de la máquina.
- El puerto 4000 no aparece publicado en Ubuntu.

## Qué no afirma este archivo

Reiniciar un contenedor no es tener otra copia atendiendo durante la caída. La diferencia está en `docs/PLAN_DIARIO.md`. Hasta ver las pruebas del viernes, no se da la consigna por cumplida.
