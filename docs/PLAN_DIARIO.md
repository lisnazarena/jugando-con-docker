# Plan diario — Jugando con Docker: Lluvia de Palabras

Proyecto universitario. Fecha límite: **martes 3 de noviembre de 2026**.

Este documento es la guía de trabajo. No declara que una prueba haya pasado ni que la consigna esté cumplida: eso se anota recién cuando lo ejecutemos y lo veamos.

Estado al empezar (viernes 23 de octubre de 2026):

- La carpeta del proyecto estaba vacía.
- No había repositorio Git.
- La aplicación todavía no existe.

## Cómo vamos a trabajar

Cada día tiene un objetivo chico. No se programa la aplicación completa de una vez.

Después de cada tarea:

1. Se explica el concepto.
2. Se ejecuta un paso concreto.
3. Se comprueba el resultado.
4. Si algo falla, se corrige antes de seguir.
5. Si corresponde, se propone un commit pequeño.

La prioridad es una versión mínima que funcione, con datos que sobrevivan al contenedor y con una prueba real de qué pasa cuando un contenedor se detiene. No se agregan pantallas ni servicios extra antes de eso.

## Herramientas en esta máquina

Comprobado el 23 de octubre de 2026:

| Herramienta | Estado | Versión observada |
| --- | --- | --- |
| Ubuntu | Instalado | 22.04.4 LTS |
| Git | Instalado | 2.34.1 |
| Docker | Instalado y en ejecución | 28.1.1 |
| Docker Compose | Instalado | v2.34.0 |
| Node.js | Instalado | 24.15.0 |
| npm | Instalado | 11.12.1 |
| Cliente `psql` | Instalado | El servidor de la aplicación irá en un contenedor, no en el PostgreSQL del sistema |
| GitHub CLI (`gh`) | No instalado | No es obligatorio; se puede usar el sitio de GitHub y Git |

Pendiente de configurar, sin hacerlo todavía:

- `git config user.name` no está definido. El nombre del autor de los commits hay que elegirlo antes del primer commit.
- No hay sesión comprobada de GitHub en esta máquina.

En esta misma computadora ya hay otros contenedores en marcha (otro frontend en el puerto 8080, PostgreSQL en 5433 y 5434, una app en el puerto 3000). **No se tocan.** Este proyecto usará otros puertos y nombres propios.

## Decisiones técnicas provisionales

Se confirman el día que se instala cada pieza. La idea es usar versiones estables y conocidas:

- **React con Vite**, para una app web moderna sin el instalador viejo de Create React App.
- **Tailwind CSS**, para una interfaz clara en celular y computadora.
- **Node.js 22 en la imagen Docker** (`node:22-bookworm`). En la máquina hay Node 24, suficiente para practicar antes de Docker. Dentro del contenedor se fija Node 22, que es una línea LTS muy documentada. Si el primer día de backend conviene usar el Node 24 ya instalado, se anota y se mantiene la misma versión mayor en la imagen.
- **Express 4** y **Socket.IO 4**.
- **PostgreSQL 16** (`postgres:16`), con los datos en un volumen de Docker.
- **Docker Compose** para definir los tres servicios en la máquina local.
- Sin Kubernetes, sin Grafana y sin servicios pagos.

## Decisión del 23 de octubre

Quedó elegido el camino de trabajo: **opción A** (sitio, API y PostgreSQL, con reinicio automático y un volumen). La opción C queda como reserva. La consulta al profesor se hará más adelante. Hasta esa respuesta, y hasta ver las pruebas, no se da la consigna por cumplida.

## Arquitectura recomendada (todavía no verificada)

La consigna pide tres contenedores, una aplicación web, recuperación o réplica si uno cae, y datos fuera del ciclo de vida del contenedor.

Hay una duda abierta: no sabemos si alcanza con que Docker vuelva a levantar el mismo contenedor, o si el profesor quiere otra instancia que siga atendiendo mientras la primera está caída. **Reiniciar no es lo mismo que replicar.** Hasta preguntarlo, no se afirma que la consigna esté cumplida.

### Opción A — recomendada para construir y entregar

Tres servicios distintos. Si uno se detiene, Docker lo vuelve a crear según una política de reinicio. Es recuperación del mismo servicio, no alta disponibilidad.

| Contenedor | Qué ejecuta | Cómo habla con los demás |
| --- | --- | --- |
| `web` | Nginx sirve el sitio React ya compilado y reenvía `/api` y Socket.IO hacia `api` | El navegador solo habla con `web` |
| `api` | Node.js, Express y Socket.IO | Lee y escribe en `db`; avisa a los navegadores conectados |
| `db` | PostgreSQL 16 | Solo acepta conexiones desde la red interna de Compose |

Datos: un volumen Docker montado en los datos de PostgreSQL. El volumen no se borra al detener, eliminar o recrear el contenedor `db`.

Si un contenedor se detiene:

- Docker lo inicia de nuevo (`restart: unless-stopped`).
- Durante esos segundos el servicio afectado no responde.
- Si cae `web`, la página deja de cargar hasta que vuelve.
- Si cae `api`, no entran palabras nuevas y la nube no se actualiza hasta que vuelve. Lo ya guardado sigue en `db`.
- Si cae `db`, la API responde error hasta que PostgreSQL vuelve. Las palabras guardadas siguen en el volumen.

Si se elimina y se recrea el contenedor, la imagen se vuelve a usar y el volumen conserva la base. Eso hay que probarlo y anotarlo en `docs/PRUEBAS.md`. El servicio no sigue disponible durante la caída: hay una interrupción corta.

Cumple, si las pruebas salen bien: tres contenedores, aplicación web, persistencia fuera del contenedor, recuperación automática.

Queda pendiente: disponibilidad continua y una réplica que atienda mientras la otra está caída.

### Opción B — balanceador y dos copias de la app

| Contenedor | Rol |
| --- | --- |
| Balanceador | Reparte las visitas |
| App 1 | Frontend y API |
| App 2 | Otra copia igual |
| Base de datos | PostgreSQL |

Son cuatro contenedores si la base también va en Docker. La consigna pide tres. Descartada como diseño principal.

Poner PostgreSQL fuera de Docker, en el sistema Ubuntu, bajaría a tres contenedores, pero mezcla el trabajo con un servicio de la máquina y es más difícil de reproducir en otra computadora. No se recomienda.

### Opción C — réplica real, solo si el profesor la exige

Docker Swarm en esta misma Ubuntu, sin pagar nada:

- Un servicio `app` con **dos réplicas** de la misma imagen (el sitio y la API juntos).
- Un servicio `db` con **una** instancia de PostgreSQL y un volumen.
- Total: tres contenedores.
- El reparto de visitas lo hace el enrutamiento de Swarm. No hace falta un cuarto contenedor balanceador.
- Si una réplica de `app` cae, la otra sigue respondiendo y Swarm levanta un reemplazo.

Límite importante: Socket.IO guarda las conexiones en la memoria de cada proceso. Dos copias no ven los mismos clientes. Para que la nube se actualice en todas, las dos copias tendrían que avisarse por PostgreSQL (`LISTEN/NOTIFY`). Eso se estudia solo si hace falta la opción C.

`restart` de Compose no crea esta segunda copia. Swarm sí crea otra instancia. Hay que demostrarlo con una prueba, no con el nombre de la configuración.

### Qué se hace con la duda

Antes del jueves 29 se envía al profesor una pregunta corta (texto más abajo). Se construye la opción A porque se puede aprender, probar y explicar. Si la respuesta pide que el servicio siga en pie durante la falla, el viernes 30 se evalúa pasar a la opción C sin agregar un cuarto contenedor.

Pregunta sugerida:

> En la consigna, cuando un contenedor cae, ¿alcanza con que Docker lo reinicie automáticamente (hay unos segundos sin servicio y después vuelve el mismo contenedor), o hace falta una segunda instancia que siga atendiendo mientras la primera está detenida? El proyecto tiene exactamente tres contenedores: sitio web, API y PostgreSQL, con los datos en un volumen.

## Estructura inicial de carpetas

Todavía no está creada, salvo este archivo.

```text
jugando-con-docker/
├── README.md
├── .gitignore
├── .env.example
├── docker-compose.yml
├── docs/
│   ├── PLAN_DIARIO.md
│   ├── ARQUITECTURA.md
│   ├── CONCEPTOS_DOCKER.md
│   ├── PRUEBAS.md
│   └── INFORME_FINAL.md
├── frontend/
│   ├── Dockerfile
│   └── (proyecto React)
├── backend/
│   ├── Dockerfile
│   └── (proyecto Node.js)
└── db/
    └── init/
```

`db/init/` es para un SQL inicial, si hace falta. La imagen de PostgreSQL es la oficial: no hace falta un Dockerfile propio para la base.

Puertos previstos, para no chocar con lo que ya está en uso:

- Sitio web publicado en el host: **8088**.
- API, en desarrollo sin Docker: **4000**.
- PostgreSQL, solo en la red de Docker. Si hace falta inspeccionarlo desde Ubuntu, se publicará en **127.0.0.1:5435**, no hacia toda la red.

## Git y GitHub

Git y GitHub no son la misma cosa.

- **Git** guarda el historial del proyecto en esta computadora.
- **GitHub** es un sitio donde se puede publicar una copia de ese historial.

Orden previsto el sábado 24:

1. Explicar repositorio, commit, rama e historial.
2. Crear `.gitignore` y `.env.example`.
3. Configurar el nombre de autor de Git (el correo ya está definido en esta máquina).
4. Crear el repositorio local.
5. Crear en GitHub el repositorio `jugando-con-docker`.
6. Conectarlos y subir el primer commit con un README.

El 23 de octubre el repositorio remoto quedó en `https://github.com/lisnazarena/jugando-con-docker`, rama `main`, commit `18dad7b`. Se mantiene **privado** durante el desarrollo. Antes de la entrega se decide si pasa a público o si el profesor entra como colaborador.

No se suben `.env`, contraseñas, `node_modules`, compilados, datos de PostgreSQL ni volúmenes. Antes de cada `git push` se revisa que no haya secretos. Los comandos de publicación se explican y los ejecutás vos; no se publican solos.

`gh` no está instalado. Se puede crear el repositorio desde el navegador. Instalar `gh` es opcional.

## Documentos del proyecto

| Archivo | Cuándo se completa | Qué contiene |
| --- | --- | --- |
| `docs/PLAN_DIARIO.md` | Desde el 23 de octubre | Este cronograma y los criterios de cada día |
| `docs/ARQUITECTURA.md` | 23 al 29 de octubre | Contenedores, redes, volúmenes y la duda de réplica o reinicio |
| `docs/CONCEPTOS_DOCKER.md` | 28 al 30 de octubre | Imagen, contenedor, volumen, red, reinicio, réplica |
| `docs/PRUEBAS.md` | 30 de octubre al 1 de noviembre | Pasos, resultado real y evidencias |
| `docs/INFORME_FINAL.md` | 2 de noviembre | Borrador del informe |
| `README.md` | 24 de octubre, y se actualiza | Cómo instalar, ejecutar y probar |

No se inventan resultados de pruebas.

## Cronograma

### Viernes 23 de octubre — Preparación

Objetivo: saber desde dónde partimos, elegir la arquitectura de trabajo y dejar este plan.

Tareas:

- Comprobar que la carpeta está vacía y no es un repositorio Git.
- Anotar las herramientas instaladas.
- Comparar las opciones de tres contenedores.
- Redactar la pregunta para el profesor.
- Crear este archivo.

Criterio de aceptación: existe `docs/PLAN_DIARIO.md`, la opción A queda como camino de trabajo y la opción C queda escrita como alternativa, sin decir que la consigna ya está cumplida.

Evidencia: este archivo y la lista de herramientas.

Commit: todavía no. El repositorio se crea el sábado.

### Sábado 24 de octubre — Git, GitHub y esqueleto

Objetivo: tener un repositorio local, el remoto en GitHub y los archivos que evitan subir secretos. El remoto queda privado hasta la entrega.

Tareas:

- Crear la estructura de carpetas vacía.
- Escribir `README.md`, `.gitignore` y `.env.example`.
- Inicializar Git y hacer el primer commit.
- Crear el repositorio en GitHub y conectar el remoto.
- Subir la primera versión cuando vos confirmes el comando.

Criterio de aceptación: `git status` está limpio, `git log` muestra el primer commit y el repositorio se abre en el navegador con la cuenta de GitHub. Mientras sea privado, no se ve sin iniciar sesión.

### Domingo 25 de octubre — Frontend

Objetivo: una pantalla que muestre una pregunta, un formulario para enviar una palabra y la nube. Sin título de presentación. El aspecto es el de una ventana de Windows 95: fondo verde azulado, panel gris, bordes en relieve y tipografía en píxeles. Las palabras, al juntarse, arman la nube: no hay un dibujo con borde alrededor. Lo más repetido queda más grande y más al centro. La formación se mueve en bucle. Quien tenga activada la opción de reducir movimiento la ve quieta.

Tareas:

- Crear el proyecto React con Vite dentro de `frontend/`.
- Agregar Tailwind y una fuente píxel libre.
- Maquetar la pregunta, el campo de texto, el botón y la nube, con controles de tamaño entero para que el píxel no se deforme.
- Abrirla en el navegador y probarla en un ancho de celular.

Criterio de aceptación: la pantalla carga, el formulario no se envía a ningún servidor todavía y se entiende en una ventana angosta. Los estados de carga y error se preparan en serio el lunes, cuando exista el servidor.

### Lunes 26 de octubre — Backend y tiempo real

Objetivo: que dos navegadores vean la misma palabra apenas uno la envía.

Tareas:

- Crear `backend/` con Express y Socket.IO.
- Guardar las palabras solo en memoria, a propósito, para ver el límite.
- Conectar el formulario a la API.
- Abrir dos clientes y comprobar la actualización.
- Mostrar un mensaje claro si el servidor no responde.

Criterio de aceptación: una palabra enviada en un navegador aparece en el otro sin recargar. Al detener el servidor, las palabras de memoria se pierden: eso motiva la base del martes.

### Martes 27 de octubre — Persistencia

Objetivo: que las palabras sobrevivan aunque se apague el proceso de la API.

Tareas:

- Definir una tabla simple: texto de la palabra, cantidad o cada envío, y la pregunta de la actividad.
- Guardar y volver a leer desde PostgreSQL.
- Decidir si la base corre ya en Docker o, por un día, en un contenedor suelto antes de Compose.
- Comprobar que borrar el contenedor de la API no borra las filas.

Criterio de aceptación: se reinicia la API, se vuelven a consultar las palabras y siguen ahí. El archivo de datos de PostgreSQL no está dentro del código del repositorio.

### Miércoles 28 de octubre — Dockerfiles

Objetivo: construir una imagen del frontend y una de la API, y distinguir imagen de contenedor.

Tareas:

- Escribir los Dockerfiles.
- Construir las imágenes.
- Arrancar un contenedor y mirar logs, puertos y estado.
- Anotar los conceptos en `docs/CONCEPTOS_DOCKER.md`.

Criterio de aceptación: `docker ps` muestra un contenedor de este proyecto sirviendo una parte de la app, y se puede explicar qué es la imagen y qué es el contenedor.

### Jueves 29 de octubre — Docker Compose

Objetivo: levantar los tres servicios con un solo comando, red interna y volumen.

Tareas:

- Escribir `docker-compose.yml`.
- Pasar la configuración por variables, con el ejemplo en `.env.example`.
- No publicar PostgreSQL hacia toda la red.
- Contar los contenedores del proyecto y confirmar que son tres.
- Actualizar `docs/ARQUITECTURA.md`.

Criterio de aceptación: `docker compose ps` lista exactamente tres servicios de este proyecto, la web abre en el puerto elegido y una palabra queda guardada.

### Viernes 30 de octubre — Caídas y datos

Objetivo: probar, sin adivinar, qué pasa al detener un contenedor y al recrearlo.

Tareas:

- Revisar la política de reinicio.
- Detener `web`, `api` y `db` por separado y anotar tiempos y síntomas.
- Eliminar el contenedor `db` y volver a crearlo sin borrar el volumen.
- Comprobar que las palabras siguen.
- Escribir el resultado real en `docs/PRUEBAS.md`.
- Si el profesor pidió réplica, evaluar la opción C y no llamarla alta disponibilidad hasta verla funcionar.

Criterio de aceptación: hay una nota de lo observado para reinicio y para recreación, y una comprobación de que los datos siguen después de recrear `db`.

### Sábado 31 de octubre — Varios clientes

Objetivo: usar la app como en el aula y corregir solo fallos que impidan la entrega.

Tareas:

- Abrir varios clientes.
- Enviar palabras repetidas y comprobar que lo más repetido se ve más grande.
- Anotar errores de red o de reconexión.
- No agregar funciones nuevas si todavía falla la persistencia o el reinicio.

Criterio de aceptación: el flujo principal funciona con más de un cliente y los fallos graves quedan corregidos o escritos como límite conocido.

### Domingo 1 de noviembre — Repetir desde cero

Objetivo: seguir el README en limpio y ver si otra persona podría levantar el proyecto.

Tareas:

- Bajar los contenedores del proyecto.
- Volver a levantarlos solo con los pasos del README.
- Repetir una prueba corta de persistencia y de reinicio.
- Corregir el README donde un paso no coincida con lo que pasó.

Criterio de aceptación: una pasada completa, anotada, sin pasos que solo funcionen porque la máquina ya estaba preparada.

### Lunes 2 de noviembre — Informe y capturas

Objetivo: dejar el material para el video o el PDF.

Tareas:

- Completar README e informe con lo que sí se probó.
- Capturar contenedores, volúmenes, la aplicación y una caída con recuperación.
- Escribir el guion con tus palabras.
- Revisar que GitHub tenga esa versión y que no haya secretos.

Criterio de aceptación: el informe separa hechos observados y límites, e incluye la diferencia entre reiniciar y replicar.

### Martes 3 de noviembre — Entrega

Objetivo: una última pasada y una explicación oral breve.

Tareas:

- Levantar el proyecto con el README.
- Enviar una palabra y verla en otro cliente.
- Revisar el video o el PDF y el repositorio.
- Practicar la explicación: qué hay en cada contenedor, dónde están los datos y qué pasa si uno se detiene.

Criterio de aceptación: el proyecto levanta, la prueba corta funciona y podés explicar la arquitectura sin leer el informe palabra por palabra.

## Riesgos

- La duda de réplica o reinicio puede cambiar el viernes 30. Por eso la opción C está escrita, pero no se construye antes de tiempo.
- Los puertos 3000, 8080, 5433 y 5434 ya están ocupados por otros proyectos.
- Dos instancias de la API no comparten Socket.IO sin un mecanismo extra.
- Node 24 en la máquina y Node 22 en la imagen pueden diferir. Se fija la versión en el Dockerfile y se prueba dentro del contenedor.
- Un volumen borrado con `docker volume rm` o `docker compose down -v` elimina las palabras. Esos comandos no se usan sin explicar el efecto y sin tu autorización.

## Fuera de alcance hasta cumplir lo obligatorio

Cuentas de usuario, login del docente, varias aulas, gráficos de monitoreo, Kubernetes y cualquier servicio pago.
