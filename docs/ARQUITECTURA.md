# Arquitectura

Fecha de esta decisión: **29 de octubre de 2026**.

La consigna pide tres contenedores, una forma de recuperarse si uno falla, y los datos fuera del ciclo de vida del contenedor. Este archivo separa lo que ya está en marcha de lo que el plan todavía no construyó.

## Decisión

Tres contenedores, definidos en `docker-compose.yml`:

| Contenedor | Qué ejecuta | Quién le habla |
| --- | --- | --- |
| `web` | Nginx sirve el sitio React ya compilado | El navegador, en el puerto 8088 |
| `api` | Node.js, Express y Socket.IO | Nginx, por dentro de la red de Compose. La API habla con `db` |
| `db` | PostgreSQL 16 | Solo la API, por el nombre `db` y el puerto 5432 de la red interna |

El navegador no entra a la red interna. Habla únicamente con `web`. Nginx entrega la pantalla y reenvía `/api` y `/socket.io` hacia `api`. Así no hace falta un cuarto contenedor para unir la pantalla con el servidor.

Los archivos de PostgreSQL viven en el volumen `pgdata`, montado en `/var/lib/postgresql/data`. Detener, borrar o recrear el contenedor `db` deja ese volumen en Docker. Borrar el volumen sí borra las preguntas y las respuestas. Un volumen conserva los datos en esta máquina. No es una copia de seguridad: si se borra el disco o el volumen, no hay otra copia.

Cada servicio tiene `restart: unless-stopped`. Si el proceso termina solo, o si se reinicia Ubuntu, Docker vuelve a iniciar **ese mismo** contenedor. Durante los segundos que tarda, ese servicio no responde.

## Reiniciar y replicar resuelven problemas distintos

**Reiniciar** significa que Docker levanta otra vez el contenedor que se detuvo. Hay una sola copia. Hay un corte corto. Cuando vuelve, sigue el mismo servicio, con el mismo volumen si es la base.

**Replicar** significa tener dos copias vivas al mismo tiempo. Si una se detiene, la otra sigue atendiendo. La persona que usa la aplicación puede no notar el corte.

En este proyecto está configurado el reinicio. No hay una segunda copia de `web`, ni de `api`, ni de `db`.

La consigna dice que, si un contenedor falla, debe existir una configuración que permita su recuperación o su replicación. La palabra «o» deja las dos lecturas abiertas. Hasta preguntarle al profesor, la entrega tiene que poder explicar cuál de las dos está implementada y cuál no.

Pregunta para el profesor:

> Cuando un contenedor cae, ¿alcanza con que Docker lo reinicie solo (hay unos segundos sin ese servicio y después vuelve el mismo contenedor), o hace falta otra instancia que siga atendiendo mientras la primera está detenida?

## Por qué tres contenedores no alcanzan para alta disponibilidad de todo

Alta disponibilidad, en este contexto, quiere decir que el servicio sigue respondiendo mientras una copia está caída.

Con un contenedor por servicio, si cae `web` nadie abre la página, si cae `api` nadie envía palabras, y si cae `db` nadie lee ni escribe. El reinicio los trae de vuelta. No evita el corte.

Para que un servicio siguiera en pie haría falta al menos una segunda copia de ese servicio. Encajar eso en tres contenedores obliga a juntar piezas:

| Variante | Contenedores | Qué quedaría sin réplica |
| --- | --- | --- |
| La elegida | `web`, `api`, `db` | Los tres. Solo hay reinicio |
| Dos copias de la aplicación y una base | Habría que meter el sitio dentro de la API, y correr dos copias más PostgreSQL | La base sigue siendo una sola |
| Dos bases y una aplicación | Dos PostgreSQL y un solo proceso de la app | La pantalla y la API siguen siendo una sola, y sincronizar dos bases es otro tema |

Un balanceador delante de dos copias, más la base, suma cuatro contenedores. Por eso no es el diseño de esta entrega.

Docker Swarm podría repartir dos réplicas de una aplicación combinada y dejar PostgreSQL como tercer contenedor. No lo vamos a armar salvo que el profesor pida explícitamente una segunda instancia viva. Aunque se arme, PostgreSQL seguiría siendo un solo contenedor: si ese cae, las dos copias de la aplicación se quedan sin datos hasta que la base vuelva. Socket.IO además guarda las conexiones en la memoria de cada proceso. Dos copias no ven a los mismos navegadores salvo que se agregue un mecanismo para avisarse. Eso ya no es «aprender Compose».

Conclusión que se puede decir en la entrega: los tres contenedores demuestran la aplicación, la red interna, el volumen y la recuperación por reinicio. No demuestran que el aula siga funcionando sin corte si un contenedor muere.

## Lo que ya se comprobó el 29 de octubre

- `docker compose ps` lista `web`, `api` y `db`.
- http://127.0.0.1:8088 carga la pregunta fija y la nube.
- Una palabra enviada desde esa pantalla queda en la tabla `words`.
- Al reiniciar solo el contenedor `api`, esa fila sigue en la base.
- PostgreSQL escucha en `127.0.0.1:5435`. El puerto 4000 de la API no está publicado en Ubuntu.
- La contraseña de la base sale de `.env`. Compose arma `DATABASE_URL` con el nombre `db` y el puerto 5432.

No está medido qué pasa al detener cada contenedor ni al recrear `db`. Esas pruebas están en [PRUEBAS.md](PRUEBAS.md) y siguen pendientes.

La pantalla actual no tiene panel de profesor. La pregunta está fija en el código del frontend. Todas las palabras comparten una sola lista.

## Modelo de datos

Las tablas existen desde el 31 de octubre de 2026. Están en `db/init/002_banco.sql` y ya se aplicaron al volumen actual. La API y la pantalla no las leen: la nube sigue usando `words`.

Una **pregunta** pertenece al banco. Se puede reutilizar.

Una **actividad** es una ejecución de esa pregunta en el aula. Guarda una copia del texto de la pregunta en el momento de iniciarla. Si después el profesor edita la pregunta del banco, las actividades viejas conservan el texto con el que se hicieron. Las respuestas de cada actividad quedan en filas propias.

Tablas:

| Tabla | Qué guarda |
| --- | --- |
| `categorias` | Las categorías iniciales: Tecnología, Informática, Docker y contenedores, Programación, Educación, Trabajo en equipo, Temas libres |
| `preguntas` | Texto, categoría y fechas. El profesor las crea, edita y borra |
| `actividades` | Código corto para el enlace, copia del texto de la pregunta, estado (`preparada`, `abierta`, `cerrada`) y horarios |
| `palabras` | Texto y cantidad, únicos dentro de una actividad |
| `sesiones` | La huella de la sesión del profesor, no la contraseña |

La contraseña del profesor irá en la variable `TEACHER_PASSWORD`, solo en el entorno del contenedor `api`. El navegador la envía una vez. Si coincide, la API crea un token al azar, guarda su huella en `sesiones` y devuelve una cookie `HttpOnly`. El JavaScript de React no puede leer esa cookie. Las rutas y los eventos de Socket.IO del panel exigen esa cookie. Enviar una palabra a una actividad abierta no la exige.

Si se borra una pregunta del banco, la actividad conserva `texto_pregunta`. La relación con la pregunta puede quedar vacía. El historial no se reescribe.

Los alumnos entran por un enlace con el código de la actividad. No tienen cuenta. El servidor rechaza en esas rutas crear preguntas, cambiar la actividad o cerrarla.

## Qué pasa al detener cada contenedor

Esto es la expectativa. Hay que observarla y anotarla en las pruebas. Hasta entonces no es un resultado.

| Se detiene | Qué deja de andar | Qué sigue guardado |
| --- | --- | --- |
| `web` | La página, hasta que Docker lo inicia de nuevo | Las filas en el volumen |
| `api` | Enviar palabras y ver la nube en vivo | Las filas en el volumen |
| `db` | Leer y escribir, hasta que PostgreSQL vuelve | Los archivos del volumen, si nadie lo borra |

`depends_on` con el control de salud de `db` solo ordena el primer arranque. No mantiene el servicio disponible durante una caída.
