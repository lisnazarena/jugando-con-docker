# Informe final

Cierre del 4 de noviembre de 2026. Cita lo que se vio en [PRUEBAS.md](PRUEBAS.md). El repositorio todavía no se pasó a público. El video se dice con palabras propias; este texto no lo reemplaza.

## 1. Problema

Lluvia de Palabras sirve para una actividad corta en el aula. El profesor propone una pregunta. Los alumnos responden con una palabra. La pantalla muestra una nube en el momento.

El 4 de noviembre dos pestañas abrieron la actividad `tmrb92`. La palabra «imagen» pasó a 2 veces en las dos, sin recargar. Al cerrar la actividad el formulario quedó deshabilitado y la fila siguió en PostgreSQL.

## 2. Qué es Docker y qué es un contenedor

Texto para decir con palabras propias, después de haberlo usado:

- Docker es el programa que empaqueta y ejecuta la aplicación en esta Ubuntu.
- Una imagen es el paquete quieto.
- Un contenedor es ese paquete en marcha.
- En este proyecto hay tres contenedores a la vez.

## 3. Los tres contenedores

| Contenedor | Función |
| --- | --- |
| `web` | Entrega la pantalla |
| `api` | Recibe las palabras y avisa a los navegadores |
| `db` | Guarda las filas en PostgreSQL |

El 4 de noviembre `docker compose ps` mostró `web`, `api` y `db` en marcha. La definición está en `docker-compose.yml`.

## 4. Cómo se comunican

El navegador solo abre el puerto 8088. Nginx, dentro de `web`, habla con `api` por la red interna de Compose. `api` habla con `db` usando el nombre `db`.

## 5. Dónde están los datos

Los archivos de PostgreSQL están en el volumen `jugando-con-docker_pgdata`. El 4 de noviembre se borró el contenedor `db`, se creó otro y el volumen siguió. Las dos actividades y la palabra «imagen» con cantidad 2 estaban igual. Desde el stop hasta que la base quedó healthy pasaron unos 6 segundos.

Aclaración fija, aunque la prueba salga bien: el volumen no es una copia de seguridad. Es el disco de datos de Docker en esta máquina.

## 6. Qué pasa si un contenedor falla

Mecanismo configurado: `restart: unless-stopped`. Docker vuelve a iniciar el mismo contenedor. Hay un corte mientras vuelve.

No hay réplica. No hay una segunda copia atendiendo durante la caída. Tres contenedores, uno por servicio, no alcanzan para eso sin dejar de separar sitio, API y base, o sin pasar a otra herramienta. El detalle está en [ARQUITECTURA.md](ARQUITECTURA.md).

Lo visto el 4 de noviembre:

- `docker compose stop web` dejó el contenedor detenido. El puerto 8088 rechazó la conexión. `docker compose start web` devolvió HTTP 200 en cerca de 1 segundo. `RestartCount` no subió: fue un arranque pedido a mano.
- `docker kill` sobre `web`, `api` y `db` también los dejó detenidos, con salida 137. La política no los levantó.
- Cuando el proceso de `api` terminó por SIGTERM, Docker inició el mismo contenedor en 0,68 segundos. La cookie del profesor seguía valiendo, porque la fila está en `sesiones` y no en la memoria del proceso.
- Cuando el proceso de `db` terminó por SIGTERM, `RestartCount` pasó a 1 y las filas siguieron.
- `nginx -s quit` dejó `web` en `running` pero la página no respondía. Hubo que usar `docker compose restart web`.

No hay una segunda instancia. Si el profesor confirma que pedía una réplica, este informe dice que la entrega implementa reinicio del mismo contenedor y deja la réplica explicada como alternativa no construida.

## 7. Funcionamiento previsto de la aplicación

Recorrido el 4 de noviembre:

- El profesor entra con la contraseña de `TEACHER_PASSWORD`. No está en el código ni en el JavaScript que entrega Nginx.
- Administra un banco de preguntas en PostgreSQL. Hay 7 categorías y las preguntas de ejemplo.
- Inicia y cierra una actividad. `tmrb92` quedó cerrada, con «imagen» dos veces.
- El alumno entra por `/a/` y el código, sin cuenta.
- La nube se actualizó en dos pestañas.
- Una segunda actividad de la misma pregunta empezó sin palabras.
- Editar la pregunta no reescribió el texto de la actividad ya hecha.
- Sin la cookie, crear una pregunta y finalizar una actividad respondieron 401.

## 8. Capturas pedidas

| # | Qué mostrar | Archivo o nota |
| --- | --- | --- |
| 1 | Estructura del proyecto | Falta la captura. El árbol está en el repositorio |
| 2 | `docker-compose.yml` | Falta la captura. El archivo está en la raíz |
| 3 | Los tres contenedores en ejecución | Visto con `docker compose ps` el 4 de noviembre. Falta la captura |
| 4 | La aplicación en el navegador | Vista en http://127.0.0.1:8088/a/tmrb92. Falta la captura |
| 5 | El panel del profesor | Visto en `/profesor`. Falta la captura |
| 6 | La nube en dos navegadores | Vista: «imagen» a 2 veces en dos pestañas. Falta la captura |
| 7 | El volumen | `jugando-con-docker_pgdata` siguió después de recrear `db`. Falta la captura |
| 8 | Los datos después de recrear el contenedor | Las mismas dos actividades y «imagen» con cantidad 2. Falta la captura |
| 9 | El fallo y la recuperación | Anotado en [PRUEBAS.md](PRUEBAS.md). Falta la captura |
| 10 | El repositorio público | Pendiente. El remoto sigue como estaba |

## 9. Guion corto del video

Hablar de lo que se haya probado ese día.

1. Qué problema resuelve la aplicación.
2. Qué es Docker.
3. Qué es un contenedor.
4. Qué hace `web`, qué hace `api` y qué hace `db`.
5. Cómo llega una palabra desde el celular hasta PostgreSQL.
6. Qué es el volumen y por qué recrear el contenedor no borra las filas.
7. Qué se configuró ante un fallo, qué se vio en la prueba y qué límite tiene.
8. Qué se aprendió.

## 10. Repositorio

https://github.com/lisnazarena/jugando-con-docker

Al cierre hay que poder decir si es público y mostrar que el historial no contiene `.env` ni contraseñas reales.
