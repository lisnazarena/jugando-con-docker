# Plan diario — Jugando con Docker: Lluvia de Palabras

Entrega: **martes 3 de noviembre de 2026**.

Este archivo es la guía. No afirma que una prueba haya salido bien. Eso se anota en [PRUEBAS.md](PRUEBAS.md) recién cuando lo veamos.

La planificación del **jueves 29 de octubre** no implementa pantallas, servidor ni contenedores nuevos. El primer día de construcción empieza cuando confirmes que este plan cierra.

## Cómo vamos a trabajar

Cada día tiene un objetivo chico. No se programa la aplicación completa de una vez.

En el día de trabajo vas a tener, antes de tocar código:

1. Objetivo.
2. Conceptos.
3. Explicación sencilla.
4. Tareas.
5. Comandos, con qué hace cada uno.
6. Pruebas.
7. Resultado esperado.
8. Cuándo hacer el commit y qué mensaje usar.
9. Cierre: qué quedó aprendido y qué sigue.

Si algo falla, se entiende y se corrige antes de pasar al día siguiente. No se agregan herramientas nuevas sin decir para qué sirven.

## Desde dónde partimos el 29 de octubre

La carpeta ya no está vacía. Entre el 23 y el 29 se construyó una primera versión. Rehacerla desde cero no entra en los días que quedan.

Ya está:

- Repositorio Git en esta máquina, rama `feature/contenedores`.
- Remoto `origin`: https://github.com/lisnazarena/jugando-con-docker
- Pantalla React con una nube. La pregunta está fija en el código.
- API con Express y Socket.IO. Las palabras se guardan en PostgreSQL.
- `docker-compose.yml` con tres servicios: `web`, `api` y `db`.
- Volumen `pgdata` para los datos de la base.
- `restart: unless-stopped` en los tres servicios.
- Documentos de la pantalla, de la API y de cómo levantar el proyecto.

Todavía no está:

- Contraseña del profesor.
- Banco de preguntas, categorías, alta, edición y baja.
- Actividades separadas del banco, con su propio historial.
- Enlace para que el alumno entre sin cuenta.
- Pruebas anotadas de persistencia, de fallo y de recuperación.
- Informe con evidencias.
- Repositorio público. Hoy el remoto existe; hacerlo público es una decisión de la entrega.

## Hecho el 31 de octubre

El trabajo del viernes se hizo este sábado. `db/init/002_banco.sql` crea las tablas del banco, de las actividades y de las sesiones. Hay 7 categorías y 5 preguntas de ejemplo. La API no las usa. La comprobación con dos actividades de mentira quedó en [PRUEBAS.md](PRUEBAS.md): esas filas se deshicieron y no quedaron en la base. La tabla `words` sigue alimentando la nube.

En esta Ubuntu, comprobado de nuevo el 29 de octubre:

| Herramienta | Estado |
| --- | --- |
| Git 2.34.1 | Instalado |
| Docker 28.1.1 | Instalado |
| Docker Compose v2.34.0 | Instalado |
| Node.js 24.15.0 y npm 11.12.1 | Instalados. Sirven para desarrollar. Las imágenes usan Node 22 |
| Navegador | Hace falta para las pruebas de la pantalla |

No hace falta instalar Kubernetes, Grafana ni un PostgreSQL aparte en Ubuntu. La base del proyecto es el contenedor `db`.

`git config user.name` se configura el día del commit si todavía falta, y se explica antes de ejecutarlo. No se cambia la configuración de Git sin decirlo.

Hay otros proyectos usando puertos en esta máquina. Este sigue en **8088** para la web y en **127.0.0.1:5435** para PostgreSQL.

## Decisiones del 29 de octubre

### Contenedores

Se mantiene la opción de tres servicios: sitio, API y PostgreSQL. El razonamiento está en [ARQUITECTURA.md](ARQUITECTURA.md).

El mecanismo de la entrega es el reinicio automático del mismo contenedor. No es una réplica. No se afirma que la consigna quede cumplida hasta la respuesta del profesor y hasta ver las pruebas.

No se agrega un cuarto contenedor. El navegador ya llega a la API a través de Nginx, que vive dentro de `web`.

### Aplicación

La prioridad sigue siendo explicar Docker. La aplicación se mantiene chica, con estas piezas porque sin ellas no se puede mostrar el aula que pediste:

- Una contraseña compartida, solo en el entorno del backend.
- Un banco de preguntas en PostgreSQL, con categorías.
- Actividades que copian el texto de la pregunta y guardan sus propias palabras.
- Alumnos que entran por un enlace, sin cuenta.

No hay registro, roles, correo, recuperación de contraseña, OAuth ni JWT. La sesión es una cookie `HttpOnly` y una fila en PostgreSQL. El día que se construya se explica con un ejemplo, antes de escribir el código.

### Si el tiempo no alcanza

Se recorta en este orden, y se escribe el recorte en el informe:

1. No se recortan las pruebas de volumen, de fallo y de reinicio.
2. No se recorta la explicación de reinicio frente a réplica.
3. Se puede dejar la categoría como una lista fija, sin pantalla para inventar categorías nuevas.
4. Se puede dejar la edición visual más simple si crear, iniciar, responder y cerrar ya funcionan.
5. No se agrega una segunda copia del servicio.

## Riesgos

- La respuesta del profesor puede pedir una réplica. La alternativa está escrita. No se construye antes de esa respuesta.
- Meter preguntas y actividades cambia la tabla única `words`. La nube actual se mantiene hasta que una actividad nueva pueda recibir una palabra. Recién ahí se deja de usar la lista vieja.
- Matar un contenedor para la prueba de fallo corta la aplicación unos segundos. Se hace en esta máquina, con este proyecto, y se avisa antes.
- `docker compose down -v` borra el volumen y los datos. No se usa en las pruebas de persistencia.
- Dos copias de la API no comparten las conexiones de Socket.IO. Por eso no se promete una réplica de la nube en vivo.
- Publicar el repositorio sin mirar el historial podría subir una contraseña. Antes del push público se revisa.

## Jueves 29 de octubre — Planificación

**Objetivo.** Dejar escrita la arquitectura, el cronograma y los documentos, sin implementar la aplicación nueva.

**Conceptos.** Contenedor, reinicio, réplica, volumen, pregunta y actividad.

**Explicación sencilla.** Hoy no se programa. Se decide cómo van a convivir tres programas (la pantalla, el servidor y la base) y qué significa «si uno falla, que se recupere». También se separa la pregunta, que se reutiliza, de la actividad, que es la vez que esa pregunta se usa en clase.

**Tareas.**

- Leer la consigna y compararla con lo que ya hay en el repositorio.
- Escribir la diferencia entre reiniciar y replicar.
- Actualizar el README, este plan, la arquitectura y el glosario.
- Crear el registro de pruebas y el borrador del informe, vacíos de resultados.
- Esperar tu confirmación antes del viernes.

**Comandos.** Ninguno de construcción. Para mirar el punto de partida, si querés:

```bash
docker compose ps
git status
git log --oneline -5
```

`docker compose ps` lista los contenedores de este proyecto y dice si están en marcha. `git status` dice si hay cambios sin guardar. `git log` muestra los últimos commits.

**Pruebas.** No corresponden. Las pruebas de la consigna quedan para el lunes 2.

**Resultado esperado.** Los documentos describen la versión que ya corre y marcan como pendiente el panel, el banco y las pruebas.

**Git.** Al terminar, si estás de acuerdo, un commit solo de documentación. Mensaje propuesto:

```text
Dejar por escrito la arquitectura de tres contenedores y el plan hasta la entrega.
```

No se sube a GitHub hasta que lo pidas.

**Cierre.** Queda claro qué ya existe, qué falta y por qué el viernes no empieza por Docker. Docker ya levanta los tres servicios. Falta el modelo del aula y, después, las pruebas que lo demuestran.

## Viernes 30 de octubre — Preguntas y actividades en la base

Hecho el sábado 31 de octubre. El resultado está en [PRUEBAS.md](PRUEBAS.md).

**Objetivo.** Tener en PostgreSQL el banco y las actividades, con datos de ejemplo, sin mezclar las respuestas de dos clases. La pantalla de la nube actual sigue abriendo.

**Conceptos.** Tabla, fila, clave, volumen, copia del texto de la pregunta.

**Explicación sencilla.** Una tabla es una planilla. Cada pregunta es una fila del banco. Cada vez que el profesor usa una pregunta en el aula, se crea otra fila: la actividad. Esa fila copia el enunciado. Si el lunes la pregunta decía una cosa y el viernes el profesor la reescribe, la actividad del lunes sigue mostrando lo que se usó el lunes. Las palabras apuntan a la actividad, no a «la nube en general».

Las categorías empiezan como filas ya cargadas: Tecnología, Informática, Docker y contenedores, Programación, Educación, Trabajo en equipo y Temas libres.

**Tareas.**

- Dibujar las tablas en [ARQUITECTURA.md](ARQUITECTURA.md) si el diseño cambia al escribir el SQL.
- Agregar el SQL inicial de categorías, preguntas, actividades, palabras por actividad y sesiones.
- Cargar unas pocas preguntas de ejemplo sobre Docker, sin inventar un generador.
- Comprobar con consultas que dos actividades de la misma pregunta no comparten palabras.
- No apagar la nube actual: la tabla `words` sigue hasta el domingo.
- Explicar cada archivo antes de darlo por cerrado.

**Comandos.** Se explican en el momento, porque dependen de cómo quede el SQL. La idea es consultar la base que ya corre:

```bash
docker compose exec db psql -U lluvia -d lluvia
```

`docker compose exec` entra a un contenedor que ya está en marcha. `db` es el servicio de PostgreSQL. `psql` es el programa para escribir consultas. `-U lluvia` elige el usuario de la base y `-d lluvia` elige la base. Salir es `\q`.

Si el contenedor no está levantado, primero:

```bash
docker compose up -d db
```

`-d` lo deja corriendo y devuelve la terminal.

**Pruebas.**

- Insertar dos actividades de la misma pregunta de ejemplo.
- Insertar una palabra en cada una.
- Consultar y ver que cada lista trae solo la suya.
- Cambiar el texto de la pregunta en el banco y ver que la actividad conserva el texto copiado.

**Resultado esperado.** Las consultas muestran filas distintas por actividad. http://127.0.0.1:8088 sigue mostrando la nube vieja.

**Git.** Un commit al terminar las pruebas. Mensaje propuesto:

```text
Guardar preguntas y actividades por separado para que cada clase conserve sus respuestas.
```

**Cierre.** Ya se puede explicar la diferencia entre el banco y una clase. El sábado esa diferencia pasa a tener dueño: solo el profesor escribe en el banco.

## Sábado 31 de octubre — Contraseña y panel del profesor

**Objetivo.** Que solo quien conoce la contraseña cree preguntas, elija una, inicie una actividad y la cierre.

**Conceptos.** Variable de entorno, cookie, comprobación en el servidor.

**Explicación sencilla.** La contraseña no se escribe en el código. Se pone en `.env`, que Git ignora, y el contenedor `api` la recibe con el nombre `TEACHER_PASSWORD`. `.env.example` muestra el nombre con un valor falso.

El profesor la escribe una vez en una pantalla simple. El navegador la manda al servidor. Si coincide, el servidor guarda en PostgreSQL la huella de un número al azar y le deja al navegador una cookie que JavaScript no puede leer. Los pedidos del panel llevan esa cookie. Si no está, el servidor niega el pedido aunque alguien arme la dirección a mano.

Los alumnos no pasan por esa pantalla. El domingo van a usar otro enlace.

La misma regla vale para Socket.IO: un aviso de «se abrió la actividad» o «se cerró» solo sale de una conexión que tenga la sesión. Un alumno conectado no puede emitir esos avisos.

**Tareas.**

- Agregar `TEACHER_PASSWORD` al ejemplo de variables, sin una contraseña real.
- Pantalla de ingreso y panel mínimo: listar, crear, editar, borrar, elegir pregunta, iniciar y finalizar.
- Rechazar esas operaciones sin sesión, y mostrarlo en el navegador.
- Dejar escrito qué pasa si se reinicia `api`: la sesión sigue porque la fila está en la base, no en la memoria del proceso.

**Comandos.**

```bash
cp .env.example .env
```

Solo si `.env` todavía no existe. Copia el ejemplo. Después se edita la contraseña del profesor en `.env` y ese archivo no se commitea.

Para la versión de todos los días, cuando el cambio ya esté en la imagen:

```bash
docker compose up --build -d
```

Construye las imágenes de nuevo y vuelve a crear los contenedores. El volumen de la base no se borra con este comando.

Durante el día, para ver el cambio más rápido, se puede usar el servidor de desarrollo. Se explica ese camino si hace falta, en dos terminales, sin reemplazar la prueba final dentro de Docker.

**Pruebas.**

- Contraseña correcta: entra el panel.
- Contraseña incorrecta: no entra.
- Crear una pregunta y verla en la lista.
- Sin cookie, la API no crea una pregunta. Se prueba desde el navegador y con una petición que se explica en el momento.
- La contraseña no aparece en el código del frontend ni en la pestaña de red como un valor guardado en React.

**Resultado esperado.** El panel funciona en el navegador. Un pedido administrativo sin sesión recibe un rechazo del servidor.

**Git.** Commit propuesto:

```text
Exigir la contraseña del profesor en el servidor antes de administrar preguntas y actividades.
```

**Cierre.** El permiso quedó en el servidor, no escondido en la pantalla. El domingo los alumnos usan la actividad sin esa contraseña.

## Domingo 1 de noviembre — Alumnos y nube de una actividad

**Objetivo.** Que un alumno abra un enlace, envíe palabras y vea la nube junto con otra persona, solo mientras la actividad está abierta.

**Conceptos.** Sala de Socket.IO, código de la actividad, actualización en vivo.

**Explicación sencilla.** Cada actividad tiene un código corto. El enlace lleva ese código. Quien lo abre no se registra: el servidor mira si esa actividad está abierta y, si lo está, acepta una palabra. La palabra se suma en las filas de esa actividad. El servidor avisa solo a los navegadores que están mirando ese mismo código. Otra actividad, aunque use la misma pregunta del banco, no se entera.

Si el profesor cierra la actividad, el formulario deja de enviar y las palabras ya guardadas siguen en la base.

**Tareas.**

- Pantalla del alumno con la pregunta copiada en la actividad, el campo de una palabra y la nube.
- Unir la nube en vivo a esa actividad.
- Quitar el uso de la lista global vieja cuando este camino ya reciba una palabra de prueba.
- Impedir desde la API que ese enlace cree preguntas o cierre la actividad.
- Probar en dos ventanas.

**Comandos.** Los de levantar Compose, más abrir dos direcciones en el navegador. El puerto sigue siendo 8088. La ruta exacta sale del código de ese día; no se inventa ahora.

**Pruebas.**

- El profesor inicia la actividad y copia el enlace.
- Dos navegadores envían palabras, algunas repetidas.
- La repetida se ve más grande en los dos, sin recargar.
- Al finalizar, un envío nuevo no entra.
- Una segunda actividad de la misma pregunta empieza vacía.
- Editar la pregunta del banco no cambia el texto de la actividad ya hecha.

**Resultado esperado.** El flujo del aula se recorre entero. Los fallos que impidan ese flujo se corrigen el mismo día. Un detalle visual que no impida la entrega se anota y no abre otra función.

**Git.** Commit propuesto:

```text
Mostrar la nube en vivo de una sola actividad para que otra clase no mezcle sus palabras.
```

**Cierre.** La aplicación ya sirve para la demostración. El lunes no se le agregan pantallas: se la somete a las pruebas de Docker.

## Lunes 2 de noviembre — Volumen, fallo y recuperación

**Objetivo.** Ver, y anotar, qué pasa con los datos y con el servicio cuando un contenedor se detiene o se recrea.

**Conceptos.** Volumen, detener, borrar un contenedor, reinicio automático, corte del servicio.

**Explicación sencilla.** El contenedor es el programa en marcha. El volumen es el disco de la base, afuera de ese programa. Apagar el programa no borra el disco. Borrar el contenedor y crear otro con la misma imagen tampoco, si el disco sigue conectado. Borrar el volumen sí.

El reinicio automático es Docker volviendo a prender el mismo servicio cuando el proceso se cae. Mientras tanto la página, o la base, no contesta. No hay otro contenedor gemelo tomando el lugar.

**Tareas.**

- Seguir [PRUEBAS.md](PRUEBAS.md) y completar la columna de resultados con lo observado, incluidos los tiempos.
- Hacer la prueba de persistencia: pregunta, actividad, varias palabras, recrear `db`, volver a ver los datos.
- Provocar la caída de `web`, de `api` y de `db` por separado.
- Distinguir en la nota un `stop` manual, que deja el contenedor detenido, de una caída del proceso, que `unless-stopped` vuelve a iniciar.
- Sacar las capturas de contenedores, volumen, datos después de recrear y de la recuperación.
- Actualizar el glosario si una definición no coincidió con lo visto.
- Si el profesor ya pidió réplica, parar y decidir con vos antes de cambiar la arquitectura. No llamarle réplica al reinicio.

**Comandos.** Están listados en [PRUEBAS.md](PRUEBAS.md). Cada uno se vuelve a explicar antes de ejecutarlo. No se usa `docker compose down -v`.

**Pruebas.** Las de persistencia y las de fallo. También una pasada corta del flujo del aula después de recrear `db`.

**Resultado esperado.** Un registro con hechos: qué se ejecutó, qué se vio, cuánto tardó en volver y qué límite queda. La aplicación responde otra vez al final.

**Git.** Commit propuesto:

```text
Registrar las pruebas de volumen y de reinicio con lo que se observó en cada contenedor.
```

**Cierre.** Ya se puede explicar la consigna de Docker con una prueba hecha. El martes se arma la entrega, no se abre otra función.

## Martes 3 de noviembre — Entrega

**Objetivo.** Dejar el informe, las capturas, el guion y una última pasada del proyecto.

**Conceptos.** Repositorio público, historial, secreto.

**Explicación sencilla.** GitHub es la copia del historial en internet. Público significa que cualquiera con el enlace puede ver el código. Antes de eso se revisa que no viaje `.env`, una contraseña real ni los archivos del volumen. El informe solo cuenta lo que las pruebas mostraron.

**Tareas.**

- Levantar el proyecto siguiendo el README. Corregir el README donde un paso no coincida.
- Completar [INFORME_FINAL.md](INFORME_FINAL.md) y el guion del video con tus palabras.
- Revisar la lista de capturas.
- Mirar `git status` y el historial antes de publicar.
- Si estás de acuerdo, pasar el repositorio a público y subir la rama que corresponda. Los comandos se explican ese día. No se fuerza un push.
- Ensayar la explicación oral: qué hay en cada contenedor, dónde están los datos y qué pasa si uno se detiene.

**Comandos.** Los de levantar, más los de Git que hagan falta para publicar. No se adelantan acá los de cambiar la visibilidad del remoto.

**Pruebas.** Una pasada corta: entrar como profesor, abrir la actividad, enviar una palabra en otro navegador, ver los tres contenedores.

**Resultado esperado.** El proyecto levanta con el README, la prueba corta funciona y podés contar la arquitectura sin leer el informe palabra por palabra.

**Git.** El commit de la entrega, si hubo correcciones del README o del informe:

```text
Cerrar el informe con las pruebas hechas y los pasos que realmente levantan el proyecto.
```

**Cierre.** La entrega separa tres hechos: la aplicación del aula, los datos en el volumen y la recuperación por reinicio del mismo contenedor, con el límite de que no hay una segunda copia.

## Qué haremos primero, y por qué

El viernes 30 se escriben las tablas de preguntas y actividades.

Docker ya está en marcha con tres contenedores. Seguir por más infraestructura no enseña el hueco que falta. El hueco es el aula: sin actividades separadas, la nube actual mezcla todas las palabras en una sola lista y no hay nada que el profesor administre. Construir el panel el sábado, encima de tablas que todavía no existen, obligaría a rehacerlo. Por eso la base va primero, la contraseña después y la nube de los alumnos el domingo. El lunes queda entero para las pruebas que pide la facultad.
