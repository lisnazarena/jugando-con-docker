# Informe final

Borrador del 29 de octubre de 2026. No cita evidencias, porque las pruebas de [PRUEBAS.md](PRUEBAS.md) todavía no se ejecutaron. Cada sección se completa con lo observado. Si algo no llegó a construirse, se escribe como límite, no como función disponible.

## 1. Problema

Lluvia de Palabras sirve para una actividad corta en el aula. El profesor propone una pregunta. Los alumnos responden con una palabra. La pantalla muestra una nube en el momento.

Completar con una captura de la nube cuando la prueba de dos navegadores esté hecha.

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

Completar con la captura de `docker compose ps` y con el archivo `docker-compose.yml`.

## 4. Cómo se comunican

El navegador solo abre el puerto 8088. Nginx, dentro de `web`, habla con `api` por la red interna de Compose. `api` habla con `db` usando el nombre `db`.

## 5. Dónde están los datos

Los archivos de PostgreSQL están en el volumen `pgdata`. Completar con la captura de `docker volume ls` y con el resultado de la prueba de recrear el contenedor `db`.

Aclaración fija, aunque la prueba salga bien: el volumen no es una copia de seguridad. Es el disco de datos de Docker en esta máquina.

## 6. Qué pasa si un contenedor falla

Mecanismo configurado: `restart: unless-stopped`. Docker vuelve a iniciar el mismo contenedor. Hay un corte mientras vuelve.

No hay réplica. No hay una segunda copia atendiendo durante la caída. Tres contenedores, uno por servicio, no alcanzan para eso sin dejar de separar sitio, API y base, o sin pasar a otra herramienta. El detalle está en [ARQUITECTURA.md](ARQUITECTURA.md).

Completar con los tiempos y las capturas de la prueba de fallo. Si el profesor confirma que pedía una segunda instancia, este informe tiene que decir que la entrega implementa reinicio y deja la réplica explicada como alternativa no construida, salvo que para esa fecha ya se haya cambiado el diseño.

## 7. Funcionamiento previsto de la aplicación

Se redacta cuando existan el panel y las actividades. Hasta entonces, lo que se puede mostrar es la nube con la pregunta fija.

Lista para ir marcando:

- El profesor entra con una contraseña que no está en el código ni en React.
- Administra un banco de preguntas en PostgreSQL.
- Inicia y cierra una actividad.
- El alumno entra por un enlace, sin cuenta.
- La nube se actualiza en más de un navegador.
- Dos actividades de la misma pregunta no mezclan respuestas.
- Editar la pregunta no reescribe el historial.
- Sin la sesión del profesor, la API rechaza administrar.

## 8. Capturas pedidas

| # | Qué mostrar | Archivo o nota |
| --- | --- | --- |
| 1 | Estructura del proyecto | Pendiente |
| 2 | `docker-compose.yml` | Pendiente |
| 3 | Los tres contenedores en ejecución | Pendiente |
| 4 | La aplicación en el navegador | Pendiente |
| 5 | El panel del profesor | Pendiente |
| 6 | La nube en dos navegadores | Pendiente |
| 7 | El volumen | Pendiente |
| 8 | Los datos después de recrear el contenedor | Pendiente |
| 9 | El fallo y la recuperación | Pendiente |
| 10 | El repositorio público | Pendiente |

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
