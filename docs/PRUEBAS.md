# Pruebas

Registro para la entrega. Una fila pasa a «hecha» solo después de ejecutarla y anotar lo que se vio.

Las pruebas de la pantalla nueva dependen de que existan el panel y el enlace del alumno. El 31 de octubre se comprobó el modelo en SQL. La nube del navegador sigue usando la pregunta fija.

## Aplicación

| Prueba                                      | Cómo                                                             | Resultado esperado                                                         | Resultado                                                 | Evidencia                                                                                                              |
| ------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Entrar como profesor                        | Abrir `/profesor` y escribir la de `.env`                         | Aparece el panel                                                           | Hecho el 4 de noviembre. El panel listó las 7 categorías y las 5 preguntas | La contraseña incorrecta se probó antes, en la misma pantalla |
| Contraseña incorrecta                       | Escribir otra                                                    | El panel no abre y la API rechaza el pedido                                | Hecho el 4 de noviembre                                   | La pantalla dijo «La contraseña no coincide.» Un `POST /api/sesion` con otra clave respondió 401 |
| Crear, editar, listar y borrar una pregunta | Desde el panel y con la API                                      | La tabla `preguntas` refleja cada paso                                     | Hecho el 4 de noviembre                                   | Se creó, se editó y se borró una pregunta de prueba. El banco de ejemplo quedó otra vez en 5 |
| Iniciar una actividad                       | Elegir una pregunta y empezarla                                  | Hay un código y un enlace. El estado queda `abierta`                       | Hecho el 4 de noviembre                                   | Código `tmrb92`, enlace http://127.0.0.1:8088/a/tmrb92 |
| Entrar como alumno                          | Abrir el enlace en otro navegador, sin contraseña                | Se ve la pregunta y el campo para una palabra                              | Hecho el 4 de noviembre                                   | La pregunta fue «Definí Docker en una sola palabra.» |
| Enviar palabras                             | Dos pestañas, la misma palabra                                   | La nube crece en las dos sin recargar. Lo repetido se ve más grande        | Hecho el 4 de noviembre                                   | «imagen» pasó a 2 veces en las dos pestañas |
| Finalizar                                   | El profesor cierra la actividad                                  | El alumno ya no puede enviar. Las filas siguen en la base                  | Hecho el 4 de noviembre                                   | El campo quedó deshabilitado y el texto dijo que las palabras quedan guardadas. La fila siguió con cantidad 2 |
| Historial separado                          | La misma pregunta en dos actividades                             | Cada actividad tiene sus propias palabras                                  | Hecho en SQL el 31 de octubre y en la API el 4 de noviembre | Una segunda actividad de la misma pregunta respondió `palabras: []` |
| Editar la pregunta después                  | Cambiar el texto en el banco                                     | La actividad vieja sigue mostrando el texto anterior                       | Hecho el 4 de noviembre                                   | El banco pasó a «Definí Docker con otra frase.» `tmrb92` siguió con «Definí Docker en una sola palabra.» Después el banco volvió al texto de ejemplo |
| El alumno no administra                     | Pedir crear una pregunta o finalizar, sin la cookie              | La API responde sin permiso. La pantalla de alumno no ofrece esas acciones | Hecho el 4 de noviembre                                   | `POST /api/preguntas` y `POST /api/actividades/.../finalizar` sin cookie respondieron 401 |

Esas dos filas de octubre se crearon dentro de una transacción y después se deshicieron con `ROLLBACK`. En la base no quedaron `demo-lunes` ni `demo-viernes`, y la pregunta de ejemplo volvió a decir «Definí Docker en una sola palabra.» Sí quedaron las 7 categorías y las 5 preguntas de ejemplo. La pantalla en http://127.0.0.1:8088 respondió 200 y `/api/words` siguió devolviendo las dos palabras viejas, «imagen» y «contenedor».

## Persistencia

Esta es la prueba que pide el proyecto. Se hace cuando ya se pueda crear una pregunta y una actividad. Si ese día todavía no llegó, se repite el mismo criterio con la tabla `words` actual y se deja escrito qué versión se usó.

1. Crear una pregunta.
2. Iniciar una actividad.
3. Enviar varias palabras.
4. Anotar las filas con una consulta SQL.
5. Detener y recrear el contenedor `db`, sin borrar el volumen.
6. Volver a consultar las mismas filas y abrir la actividad en el navegador.

Resultado esperado: las preguntas, la actividad y las palabras siguen. El volumen sigue existiendo en `docker volume ls`.

Resultado, el 4 de noviembre: **las filas siguieron.** Antes y después de `docker compose stop db`, `docker compose rm -f db` y `docker compose up -d db` había las mismas dos actividades (`GUKZSS` y `tmrb92`) y la palabra «imagen» con cantidad 2. El volumen `jugando-con-docker_pgdata` siguió en `docker volume ls`. Desde el stop hasta que `db` quedó healthy pasaron unos 6 segundos. No se usó `docker compose down -v`.

Comandos previstos, para ejecutar ese día y no antes:

```bash
docker compose exec db psql -U lluvia -d lluvia -c '\dt'
docker compose stop db
docker compose rm -f db
docker compose up -d db
docker volume ls
```

`docker compose rm -f db` borra el contenedor. No borra el volumen. `docker compose down -v` sí borra el volumen: no forma parte de esta prueba.

## Fallo y recuperación

Se provoca un fallo de a un contenedor. Se anota la hora, qué dejó de responder y cuándo volvió.

| Contenedor | Qué hacer                                                                                                                                                                               | Qué mirar                                                                         | Resultado |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | --------- |
| `web`      | `docker compose stop web` y, aparte, `docker kill` y `nginx -s quit` dentro del contenedor | La página deja de cargar. Si el proceso no termina, la política no lo reemplaza | Hecho el 4 de noviembre. `stop` lo dejó `exited` y el puerto 8088 rechazó la conexión. `docker compose start web` devolvió HTTP 200 en cerca de 1 segundo. `docker kill` también lo dejó detenido, con salida 137 y `RestartCount` en 0. `nginx -s quit` lo dejó `running` pero la página respondía connection reset; hizo falta `docker compose restart web` |
| `api`      | `docker kill` y, después de que Node escuche SIGTERM, terminar el proceso | Durante el corte no se puede usar el panel. Al volver, la sesión y las filas siguen | Hecho el 4 de noviembre. `docker kill` lo dejó detenido: `/api/sesion` a través de Nginx dio 502 y no volvió solo. Con SIGTERM el proceso terminó, Docker lo inició de nuevo en 0,68 segundos (`RestartCount` 1) y la misma cookie seguía con `profesor: true`. Las filas de `tmrb92` siguieron |
| `db`       | Terminar el proceso de PostgreSQL con SIGTERM, y antes recrear el contenedor | La API no puede leer hasta que PostgreSQL vuelve. Las filas siguen | Hecho el 4 de noviembre. SIGTERM hizo salir el proceso y `RestartCount` pasó a 1. La recreación del contenedor está en la prueba de persistencia. `docker kill` sobre `db`, en cambio, lo dejó `exited` con salida 137 y no lo reinició |

`docker compose stop` detiene el contenedor a propósito. Con `unless-stopped`, Docker no lo vuelve a levantar solo: hay que usar `docker compose start`. Para ver el reinicio automático hay que provocar una salida del proceso, no un stop manual. Esa diferencia se anota en el resultado.

En la nota final tiene que quedar escrito el mecanismo real: reinicio del mismo contenedor, con un corte. No hay una segunda instancia atendiendo durante la caída.

## GitHub

| Prueba                                                                          | Resultado                                                       |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| El repositorio se abre sin iniciar sesión, cuando se decida hacerlo público     | Pendiente                                                       |
| El README permite levantar el proyecto                                          | El README describe el panel y el enlace. Falta una instalación desde cero con esta versión |
| No hay `.env` ni contraseñas reales en el historial                             | Pendiente de una revisión antes de publicar. El bundle del 4 de noviembre no contiene la contraseña |
| Los commits del tramo nuevo tienen mensajes que dicen por qué se hizo el cambio | Pendiente. El trabajo del 4 de noviembre todavía no está en un commit |

## Prueba de instalación desde cero — 01/11/2026

### Preparación

- Se eliminaron los contenedores anteriores.
- Se creó el archivo `.env` a partir de `.env.example`.
- Se ejecutó `docker compose up --build`.

### Levantamiento de servicios

Se verificó mediante `docker compose ps` que los tres servicios estuvieran activos:

- `web`: activo, puerto 8088.
- `api`: activo, puerto interno 4000.
- `db`: activo y healthy, puerto 5435.

Se comprobó el acceso a la aplicación mediante `http://127.0.0.1:8088`.

### Prueba de persistencia

Se enviaron palabras desde la aplicación y se consultó la tabla `words` de PostgreSQL.

Registros obtenidos:

- contenedor: 2
- facilidad: 1
- fsduihd: 1
- linux: 1
- tiempo: 1

### Prueba de reinicio

Se ejecutó `docker compose restart`.

Posteriormente, se verificó que los tres servicios volvieran a estar activos y que PostgreSQL conservara los cinco registros con sus cantidades y fechas originales.

### Resultado

Prueba satisfactoria. El proyecto pudo levantarse siguiendo la documentación y los datos persistieron después del reinicio de los contenedores.
