# Pruebas

Registro para la entrega. Una fila pasa a «hecha» solo después de ejecutarla y anotar lo que se vio. Ninguna de las pruebas de abajo se ejecutó durante la planificación del 29 de octubre de 2026.

Las pruebas de la aplicación nueva dependen de que existan el panel, las preguntas y las actividades. Hasta ese día, la versión actual solo permite la nube con una pregunta fija.

## Aplicación

| Prueba | Cómo | Resultado esperado | Resultado | Evidencia |
| --- | --- | --- | --- | --- |
| Entrar como profesor | Abrir la pantalla de contraseña y escribir la de `.env` | Aparece el panel | Pendiente | |
| Contraseña incorrecta | Escribir otra | El panel no abre y la API rechaza el pedido | Pendiente | |
| Crear, editar, listar y borrar una pregunta | Desde el panel | La tabla `preguntas` refleja cada paso | Pendiente | |
| Iniciar una actividad | Elegir una pregunta y empezarla | Hay un código y un enlace. El estado queda `abierta` | Pendiente | |
| Entrar como alumno | Abrir el enlace en otro navegador, sin contraseña | Se ve la pregunta y el campo para una palabra | Pendiente | |
| Enviar palabras | Dos navegadores, palabras repetidas y distintas | La nube crece en los dos sin recargar. Lo repetido se ve más grande | Pendiente | |
| Finalizar | El profesor cierra la actividad | El alumno ya no puede enviar. Las filas siguen en la base | Pendiente | |
| Historial separado | La misma pregunta en dos actividades | Cada actividad tiene sus propias palabras | Pendiente | |
| Editar la pregunta después | Cambiar el texto en el banco | La actividad vieja sigue mostrando el texto anterior | Pendiente | |
| El alumno no administra | Pedir crear una pregunta, o iniciar una actividad, sin la cookie | La API responde sin permiso. La pantalla de alumno no ofrece esas acciones | Pendiente | |

## Persistencia

Esta es la prueba que pide el proyecto. Se hace cuando ya se pueda crear una pregunta y una actividad. Si ese día todavía no llegó, se repite el mismo criterio con la tabla `words` actual y se deja escrito qué versión se usó.

1. Crear una pregunta.
2. Iniciar una actividad.
3. Enviar varias palabras.
4. Anotar las filas con una consulta SQL.
5. Detener y recrear el contenedor `db`, sin borrar el volumen.
6. Volver a consultar las mismas filas y abrir la actividad en el navegador.

Resultado esperado: las preguntas, la actividad y las palabras siguen. El volumen sigue existiendo en `docker volume ls`.

Resultado: **Pendiente.**

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

| Contenedor | Qué hacer | Qué mirar | Resultado |
| --- | --- | --- | --- |
| `web` | `docker compose stop web` y después observar si la política lo deja detenido. Luego `docker compose kill web` con la política activa, o matar el proceso de Nginx dentro del contenedor | La página deja de cargar y, si el proceso muere solo, Docker lo inicia de nuevo | Pendiente |
| `api` | Matar el proceso de Node dentro del contenedor | Enviar una palabra falla durante el corte. Al volver, las filas anteriores siguen | Pendiente |
| `db` | `docker compose kill db` | La API responde error de base. Al volver PostgreSQL, las filas siguen | Pendiente |

`docker compose stop` detiene el contenedor a propósito. Con `unless-stopped`, Docker no lo vuelve a levantar solo: hay que usar `docker compose start`. Para ver el reinicio automático hay que provocar una salida del proceso, no un stop manual. Esa diferencia se anota en el resultado.

En la nota final tiene que quedar escrito el mecanismo real: reinicio del mismo contenedor, con un corte. No hay una segunda instancia atendiendo durante la caída.

## GitHub

| Prueba | Resultado |
| --- | --- |
| El repositorio se abre sin iniciar sesión, cuando se decida hacerlo público | Pendiente |
| El README permite levantar el proyecto | Pendiente. El README actual describe la versión de la nube fija |
| No hay `.env` ni contraseñas reales en el historial | Pendiente de una revisión antes de publicar |
| Los commits del tramo nuevo tienen mensajes que dicen por qué se hizo el cambio | Pendiente |
