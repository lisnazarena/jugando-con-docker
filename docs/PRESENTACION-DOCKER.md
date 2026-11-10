# Presentación: Jugando con Docker

Guía para armar la clase en Canva. Cada diapositiva separa lo que se pega en la lámina de lo que se dice en voz alta.

Cómo usarla:

- **Contenido para Canva:** copiar a la diapositiva. Frases cortas.
- **Explicación para el expositor:** no va en la lámina. Sirve para preparar la oral.
- **Recurso visual sugerido:** qué dibujar o capturar.
- **Demostración:** qué mostrar en vivo, cuando corresponde.

Los nombres, puertos y comandos salen del proyecto: `docker-compose.yml`, los Dockerfiles, Nginx y el código de la aplicación.

Duración orientativa: 18 a 22 láminas. Los bloques 3 y 5 son el centro de la clase.

---

## BLOQUE 1 — Introducción al proyecto

### Diapositiva 1 — Jugando con Docker

**Objetivo:** Presentar el tema de la clase y el ejemplo que se va a usar para entender Docker.

**Contenido para Canva:**

- Título: Jugando con Docker
- Subtítulo: Cómo funciona Docker, contado con una aplicación de aula
- Lluvia de palabras
- Tres contenedores: sitio, servidor y base de datos
- Un comando los pone en marcha: `docker compose up --build`

**Explicación para el expositor:**

La clase usa un proyecto universitario llamado Jugando con Docker. La aplicación se llama Lluvia de palabras: el profesor plantea una pregunta y los alumnos responden con una palabra. En la pantalla se arma una nube, y lo que se repite se ve más grande.

Docker es el tema. La aplicación es el ejemplo concreto. Al final de la clase tiene que quedar claro qué es una imagen, qué es un contenedor, cómo se hablan varios servicios y dónde quedan guardados los datos.

**Recurso visual sugerido:**

Portada limpia. Una nube de palabras de fondo, con tres cajas pequeñas abajo: sitio, servidor, base de datos. Tipografía grande y poco texto.

**Demostración (si corresponde):**

Sin demostración. La aplicación se abre en el bloque 5.

---

### Diapositiva 2 — ¿Qué es Jugando con Docker?

**Objetivo:** Entender qué hace la aplicación, antes de hablar de contenedores.

**Contenido para Canva:**

- Título: Una lluvia de palabras para el aula
- El profesor elige una pregunta e inicia una actividad
- Los alumnos entran con un enlace, sin cuenta
- Escriben una palabra
- La nube se actualiza sola, sin recargar
- Tres direcciones de la aplicación:
  - Inicio: `http://127.0.0.1:8088`
  - Panel: `http://127.0.0.1:8088/profesor`
  - Actividad: `http://127.0.0.1:8088/a/` y un código

**Explicación para el expositor:**

Hay tres pantallas. La de inicio explica el juego y lleva al panel. En `/profesor` el docente escribe una contraseña que vive en el servidor, en la variable `TEACHER_PASSWORD`. Desde ahí crea preguntas, elige una e inicia la actividad. Cada actividad recibe un código de seis caracteres y un enlace `/a/` más ese código.

Los alumnos abren ese enlace. Si la actividad está abierta, pueden enviar una palabra de hasta 32 caracteres. Si otra persona envía la misma palabra, la cantidad sube y el tamaño en la nube también. Esas novedades llegan por una conexión en vivo: los navegadores que tienen la actividad abierta se enteran sin pulsar actualizar.

Cuando el profesor finaliza la actividad, el campo de texto se desactiva y las palabras quedan guardadas.

**Recurso visual sugerido:**

Tres capturas en fila: inicio, panel del profesor y nube de una actividad. Flechas: profesor inicia → alumnos abren el enlace → la nube crece.

**Demostración (si corresponde):**

Se recorre en la diapositiva 20. Acá alcanza con mostrar las tres capturas.

---

### Diapositiva 3 — ¿Por qué elegimos este proyecto para aprender Docker?

**Objetivo:** Ver por qué esta aplicación obliga a usar las piezas centrales de Docker.

**Contenido para Canva:**

- Título: Un ejemplo con las piezas que Docker junta
- Tres programas distintos, cada uno en su contenedor
  - Pantalla: React, servida por Nginx
  - Servidor: Node.js, Express y Socket.IO
  - Datos: PostgreSQL 16
- Se hablan por una red interna
- Las palabras viven en un volumen
- Se levantan juntos con Docker Compose
- La pantalla del aula hace visible cada idea

**Explicación para el expositor:**

Una aplicación de una sola pieza escondería la red, los puertos y el volumen. Acá cada parte tiene un trabajo claro y se puede señalar en la pantalla.

React dibuja la interfaz. Nginx la entrega y, además, hace de puerta hacia el servidor. Express atiende los pedidos y habla con PostgreSQL. Socket.IO avisa a los navegadores cuando llega una palabra o cuando la actividad se cierra. PostgreSQL guarda preguntas, actividades y palabras.

Eso permite recorrer, con un solo proyecto, imagen, contenedor, Compose, red, puertos, variables de entorno y persistencia. La consigna del trabajo pide tres contenedores, una forma de volver a levantar un servicio si el proceso termina solo, y los datos fuera del ciclo de vida del contenedor. Esas tres cosas están en `docker-compose.yml`.

**Recurso visual sugerido:**

Cinco íconos en círculo alrededor de la palabra Docker: imagen, contenedor, red, volumen, Compose. En el centro, el nombre del proyecto.

**Demostración (si corresponde):**

Sin demostración. El mapa de las cinco ideas se retoma al cierre.

---

## BLOQUE 2 — Introducción a Docker

### Diapositiva 4 — ¿Qué problema resuelve Docker?

**Objetivo:** Entender el problema práctico que aparece antes de instalar Docker.

**Contenido para Canva:**

- Título: El mismo proyecto, en otra computadora
- Para esta aplicación haría falta instalar y hacer coincidir:
  - Node.js 22
  - Nginx
  - PostgreSQL 16
  - Puertos, claves y el orden de arranque
- En cada máquina el resultado puede cambiar
- Docker empaqueta cada parte con lo que necesita para arrancar
- Un archivo describe las tres partes y cómo se relacionan

**Explicación para el expositor:**

El problema clásico es «en mi computadora funciona». Una persona tiene Node 22 y PostgreSQL 16. Otra tiene otras versiones, u olvidó un servicio, o el puerto 5432 ya lo usa otra base.

Este proyecto declara esas decisiones en archivos. El Dockerfile del sitio parte de `node:22-bookworm` para compilar y termina en `nginx:1.28-alpine`. El de la API parte de `node:22-bookworm`. La base usa la imagen `postgres:16`. Compose fija los puertos de la máquina: 8088 para la pantalla y 5435, solo en esta computadora, para PostgreSQL.

La analogía útil: en vez de pedir que cada persona arme la cocina igual, se entrega la comida ya preparada en envases cerrados, con la receta de cómo calentarlos juntos.

**Recurso visual sugerido:**

Dos columnas. Izquierda: lista de instalaciones sueltas y signos de pregunta. Derecha: tres cajas iguales, listas para abrir, con la etiqueta del proyecto.

**Demostración (si corresponde):**

Sin demostración en vivo. Si hay tiempo, mostrar en el editor las primeras líneas de los dos Dockerfiles y la imagen `postgres:16` en Compose.

---

### Diapositiva 5 — ¿Qué es Docker?

**Objetivo:** Definir Docker como el programa que construye imágenes y ejecuta contenedores.

**Contenido para Canva:**

- Título: Docker es el programa que pone todo en marcha
- Construye imágenes
- Crea y ejecuta contenedores a partir de esas imágenes
- En este proyecto, Docker corre en Ubuntu
- La lluvia de palabras corre adentro de los contenedores
- Docker Compose es la herramienta que levanta los tres a la vez

**Explicación para el expositor:**

Docker y la aplicación son cosas distintas. Docker es el motor. Lluvia de palabras es el programa que ese motor ejecuta.

Cuando en la terminal se escribe un comando `docker` o `docker compose`, se le está pidiendo algo a ese motor: construir, listar, detener o volver a iniciar. La pantalla del navegador, en el puerto 8088, ya es la aplicación corriendo dentro de un contenedor.

Analogía: Docker es el teatro. La obra es la aplicación. El telón, las luces y el escenario permiten que la obra se presente igual cada vez. El público ve la obra. El teatro es lo que la hace posible.

En la clase alcanza con Docker y con Docker Compose versión 2, el comando `docker compose`. El proyecto no usa Kubernetes.

**Recurso visual sugerido:**

Un rectángulo grande con la palabra Docker. Adentro, tres cajas más chicas con los nombres `web`, `api` y `db`. Afuera, el navegador, mirando solo hacia la caja `web`.

**Demostración (si corresponde):**

Opcional, diez segundos: `docker --version` y `docker compose version` en la terminal. El levantamiento completo queda para la diapositiva 19.

---

### Diapositiva 6 — ¿Qué es una imagen?

**Objetivo:** Entender la imagen como el paquete quieto del que después nace un contenedor.

**Contenido para Canva:**

- Título: La imagen es el molde
- Incluye el programa, sus librerías y la orden de arranque
- Está quieta: no atiende pedidos
- Sirve para crear contenedores
- En este proyecto hay tres imágenes:
  - `jugando-con-docker-web` — se construye con `frontend/Dockerfile`
  - `jugando-con-docker-api` — se construye con `backend/Dockerfile`
  - `postgres:16` — imagen oficial, sin Dockerfile propio

**Explicación para el expositor:**

Una imagen es un paquete. Adentro va lo necesario para arrancar ese programa, y también la instrucción de qué comando ejecutar al empezar.

La analogía del molde funciona bien: el molde tiene la forma, y con él se pueden sacar varias piezas. Mientras nadie lo usa, el molde no produce nada. La imagen tampoco escucha en un puerto ni guarda palabras nuevas.

Las dos imágenes propias aparecen después de construir. Sus nombres siguen el patrón del proyecto: `jugando-con-docker-` más el servicio. La de PostgreSQL no se construye acá: Compose la pide por el nombre `postgres:16` y Docker la descarga si todavía no está en la máquina.

El Dockerfile es la receta de esa imagen. El de la API, por ejemplo, copia el código, instala las dependencias de producción y termina con la orden `node src/server.js`.

**Recurso visual sugerido:**

Tres moldes o tres cajas cerradas, con las etiquetas de las tres imágenes. Debajo de cada una, la palabra «quieta».

**Demostración (si corresponde):**

Después de haber construido al menos una vez, se puede mostrar `docker images` y señalar esas tres líneas. Si la clase todavía no levantó el proyecto, dejar el comando para la diapositiva 19.

---

### Diapositiva 7 — ¿Qué es un contenedor?

**Objetivo:** Entender el contenedor como una imagen en ejecución.

**Contenido para Canva:**

- Título: El contenedor es el molde en uso
- Es una imagen funcionando
- Se puede detener y volver a crear
- Eso deja la imagen igual
- Este proyecto corre tres contenedores:
  - `web` — el sitio
  - `api` — el servidor
  - `db` — PostgreSQL
- El comando que los muestra: `docker compose ps`

**Explicación para el expositor:**

Si la imagen es el molde, el contenedor es la pieza que salió de ese molde y está en uso. Atiende pedidos, escribe logs y, en el caso de la base, abre sus archivos de datos.

Se puede apagar un contenedor y crear otro desde la misma imagen. La imagen no cambia porque el contenedor haya recibido palabras o porque se haya detenido.

En la lista de Docker los nombres largos llevan el prefijo del proyecto, `jugando-con-docker-`. En Compose, y en esta clase, se habla de los servicios: `web`, `api` y `db`. Esos nombres cortos también sirven dentro de la red para que un contenedor encuentre a otro.

Cada uno tiene `restart: unless-stopped`. Si el proceso termina solo, Docker vuelve a iniciar ese mismo contenedor. Si se lo detiene a propósito con `docker compose stop`, queda detenido hasta que alguien lo inicie de nuevo.

**Recurso visual sugerido:**

El mismo molde de la lámina anterior, y al lado una pieza «encendida», con un punto verde. Tres filas: web, api, db.

**Demostración (si corresponde):**

`docker compose ps` en la diapositiva 19. Acá se puede anticipar que esa tabla es la foto de los tres contenedores vivos.

---

### Diapositiva 8 — Diferencia entre imagen y contenedor

**Objetivo:** Separar el paquete quieto del proceso que está corriendo.

**Contenido para Canva:**

- Título: Molde y pieza en uso
- Imagen
  - Paquete quieto
  - Se construye o se descarga
  - Se puede reutilizar
  - Ejemplo: `postgres:16`
- Contenedor
  - Esa imagen, en marcha
  - Se crea, se detiene, se borra
  - Ejemplo: el servicio `db` cuando está encendido
- Borrar el contenedor deja la imagen en la máquina
- Construir de nuevo actualiza la imagen cuando cambió el código

**Explicación para el expositor:**

Conviene decirlo con la base, porque ahí la diferencia se ve sola. `postgres:16` es la imagen oficial. El contenedor `db` es PostgreSQL andando, con el usuario `lluvia`, la base `lluvia` y el volumen de datos enganchado.

Si se borra el contenedor `db` y se crea otro con la misma imagen, la imagen sigue siendo `postgres:16`. Los datos siguen si el volumen sigue. Esa segunda parte se muestra en la diapositiva 21. En esta lámina alcanza la idea: la imagen es el molde; el contenedor es el uso.

Lo mismo pasa con el sitio. Cambiar un archivo de React y ejecutar `docker compose up --build` construye otra vez la imagen `jugando-con-docker-web` y crea el contenedor a partir de esa imagen nueva. La imagen anterior y el contenedor anterior son pasos distintos de esa cadena.

**Recurso visual sugerido:**

Tabla de dos columnas, con una fila de ejemplo real en cada lado. Icono de caja cerrada para la imagen e icono de caja abierta con actividad para el contenedor.

**Demostración (si corresponde):**

Sin demostración propia. La diapositiva 21 muestra que se puede recrear el contenedor `db` y conservar los datos.

---

### Diapositiva 9 — ¿Qué es Docker Compose?

**Objetivo:** Entender Compose como el archivo y el comando que coordinan varios contenedores.

**Contenido para Canva:**

- Título: Compose levanta el conjunto
- Lee `docker-compose.yml`
- Describe tres servicios: `web`, `api` y `db`
- Crea la red para que se encuentren por nombre
- Crea el volumen de PostgreSQL
- Toma valores de `.env`, como puertos y claves
- Comando de la clase: `docker compose up --build`

**Explicación para el expositor:**

Docker solo sabe construir y ejecutar. Compose agrega la partitura: qué servicios existen, en qué orden conviene arrancarlos, qué puertos se publican y qué carpetas o volúmenes se enganchan.

La analogía: si cada contenedor es un músico, Compose es la partitura y la entrada del director. Un solo gesto, `docker compose up`, hace que los tres empiecen con las relaciones ya escritas.

El archivo del proyecto declara, entre otras cosas, que `api` espera a que `db` esté sano, que `web` depende de `api`, que el sitio se publica en el puerto 8088 y que los datos de PostgreSQL van al volumen `pgdata`. El detalle de cada línea se abre en el bloque 3 y en la diapositiva 18.

`.env` no va al repositorio. `.env.example` muestra los nombres, con valores de práctica. Compose lee `.env` al arrancar.

**Recurso visual sugerido:**

Una hoja titulada `docker-compose.yml` en el centro, con tres flechas hacia `web`, `api` y `db`. Debajo, el comando en una sola línea destacada.

**Demostración (si corresponde):**

Mostrar el archivo en el editor, sin ejecutarlo todavía. La ejecución es la diapositiva 19.

---

## BLOQUE 3 — Arquitectura del proyecto

### Diapositiva 10 — ¿Cómo está construida nuestra aplicación?

**Objetivo:** Ver el recorrido completo de un pedido, de la persona al dato guardado.

**Contenido para Canva:**

- Título: Del navegador a la base
- Camino de un pedido:

```text
Navegador
   ↓  puerto 8088
web  (Nginx + sitio React)
   ↓  red interna, api:4000
api  (Node.js + Express + Socket.IO)
   ↓  red interna, db:5432
db   (PostgreSQL 16)
```

- El navegador habla con `web`
- Nginx entrega la pantalla y reenvía `/api` y `/socket.io`
- La API lee y escribe en PostgreSQL
- Las palabras nuevas vuelven a los navegadores por Socket.IO

**Explicación para el expositor:**

Esta lámina es el mapa de toda la clase. Conviene dejarla a la vista o volver a ella.

La persona abre `http://127.0.0.1:8088`. Ese puerto de Ubuntu entra al contenedor `web`, que escucha en el puerto 80. Nginx responde con los archivos del sitio. Cuando la pantalla pide algo que empieza por `/api`, o cuando abre la conexión de Socket.IO en `/socket.io`, Nginx reenvía ese tráfico al contenedor `api`, puerto 4000. La API usa la dirección interna `db` y el puerto 5432 para hablar con PostgreSQL.

El puerto 4000 queda dentro de la red de Compose. Desde Ubuntu se entra por 8088. PostgreSQL también publica el 5432 del contenedor en `127.0.0.1:5435`, solo en esta máquina, para poder consultar la base desde la terminal.

Hay dos ritmos. El pedido de «guardar esta palabra» va de ida: navegador, Nginx, API, PostgreSQL. El aviso de «la nube cambió» vuelve por Socket.IO a los navegadores que están mirando esa actividad.

**Recurso visual sugerido:**

Diagrama horizontal de cuatro bloques: Navegador, web, api, db. Flecha continua de izquierda a derecha para el pedido HTTP. Flecha punteada de regreso desde api hasta el navegador, con la etiqueta Socket.IO, pasando otra vez por Nginx. Anotar los puertos sobre cada flecha: 8088, 4000, 5432.

**Demostración (si corresponde):**

El diagrama se recorre con la voz. La prueba en vivo es la diapositiva 20, con dos pestañas de la misma actividad.

---

### Diapositiva 11 — Los tres contenedores: visión general

**Objetivo:** Nombrar cada contenedor, su imagen y el puerto por el que se lo encuentra.

**Contenido para Canva:**

- Título: Tres contenedores, tres trabajos
- `web`
  - Imagen construida: `jugando-con-docker-web`
  - Nginx entrega el sitio
  - Puerto publicado: 8088 → 80
- `api`
  - Imagen construida: `jugando-con-docker-api`
  - Express y Socket.IO
  - Puerto 4000, solo en la red interna
- `db`
  - Imagen oficial: `postgres:16`
  - Guarda preguntas, actividades y palabras
  - Puerto publicado en esta máquina: 127.0.0.1:5435 → 5432
- Los tres tienen `restart: unless-stopped`

**Explicación para el expositor:**

`web` es la única puerta pública de la aplicación. `api` trabaja atrás y la encuentra Nginx por el nombre `api`. `db` trabaja atrás y la encuentra la API por el nombre `db`.

El puerto de la izquierda, en Compose, es el de Ubuntu. El de la derecha es el de adentro del contenedor. Por eso 8088 llega al 80 de Nginx, y 5435 llega al 5432 de PostgreSQL. El 5435 está atado a `127.0.0.1`: responde en esta computadora y queda cerrado al resto de la red.

`depends_on` ordena el primer arranque. `api` espera el control de salud de `db`. `web` espera a que `api` haya sido iniciado. Ese orden arma el primer encendido. Durante una caída posterior, la recuperación que está configurada es volver a iniciar el mismo contenedor.

**Recurso visual sugerido:**

Tres tarjetas del mismo tamaño, una por servicio, con imagen, puerto y una frase de trabajo. Una línea de tiempo corta debajo: primero `db`, después `api`, después `web`.

**Demostración (si corresponde):**

En la diapositiva 19, `docker compose ps` tiene que mostrar estos tres nombres, con `db` en estado healthy.

---

### Diapositiva 12 — Contenedor 1: Frontend (React + Nginx)

**Objetivo:** Entender qué hay dentro de `web` y por qué conviven React y Nginx.

**Contenido para Canva:**

- Título: `web` entrega la pantalla
- El Dockerfile tiene dos etapas
  1. Node 22 compila el sitio con Vite
  2. Nginx 1.28 sirve la carpeta ya compilada
- El navegador recibe archivos estáticos
- Nginx también reenvía:
  - `/api/` → `http://api:4000`
  - `/socket.io/` → `http://api:4000`
- La pantalla pide al mismo origen, el puerto 8088
- Rutas del sitio: `/`, `/profesor` y `/a/` más el código

**Explicación para el expositor:**

React arma la interfaz durante la construcción de la imagen. Vite deja el resultado en `dist`. Esa carpeta se copia a `/usr/share/nginx/html` dentro de la imagen de Nginx. El contenedor que queda corriendo es Nginx, en la imagen `nginx:1.28-alpine`. Node se usó para compilar y ya no hace falta en el contenedor final.

`VITE_API_URL` queda vacío en el Dockerfile. Por eso el navegador llama a `/api` y a Socket.IO en la misma dirección del sitio. Nginx, con `frontend/nginx.conf`, decide: si piden un archivo, lo sirve; si piden `/api/` o `/socket.io/`, lo pasa al contenedor `api`. Para Socket.IO agrega los encabezados que permiten el cambio a una conexión en vivo.

La dirección `api` la resuelve la red de Docker. Nginx usa el resolver `127.0.0.11`, que es el de esa red. El nombre `api` existe entre los contenedores.

Si alguien abre directo una ruta como `/profesor`, Nginx devuelve `index.html` y React elige la pantalla según la dirección. Eso está en la regla `try_files` de la configuración.

**Recurso visual sugerido:**

Dos capas dentro de una caja llamada `web`. Capa de arriba, marcada como «solo al construir»: Node y Vite. Capa de abajo, marcada como «la que queda encendida»: Nginx, con dos salidas, archivos y proxy hacia `api`.

**Demostración (si corresponde):**

Abrir el sitio en 8088 y, en las herramientas del navegador, mostrar un pedido a `/api/...` que sale hacia el mismo host y puerto. El detalle oral puede esperar a la diapositiva 15.

---

### Diapositiva 13 — Contenedor 2: Backend (Node.js + Express)

**Objetivo:** Entender el trabajo de `api`: pedidos, sesión del profesor y avisos en vivo.

**Contenido para Canva:**

- Título: `api` decide y avisa
- Imagen: Node 22
- Proceso: `node src/server.js`
- Escucha en `0.0.0.0:4000`, dentro de la red
- Express atiende la API
- Socket.IO avisa a quienes miran una actividad
- PostgreSQL entra por `DATABASE_URL`, con el host `db`
- La contraseña del profesor llega en `TEACHER_PASSWORD`

**Explicación para el expositor:**

El Dockerfile de `backend/` instala las dependencias de producción, copia `src` y arranca el servidor. El puerto 4000 está declarado con `EXPOSE`, y Compose lo deja en la red interna.

Express recibe, entre otros, el ingreso del profesor, el banco de preguntas, el inicio y el cierre de una actividad, y el envío de una palabra. Cada palabra se guarda en la tabla `palabras`. Si la misma palabra ya estaba en esa actividad, la cantidad suma uno.

Socket.IO mantiene salas con el nombre `actividad:` más el código. El navegador del alumno entra a esa sala con el aviso `mirar`. Cuando se guarda una palabra, o cuando el profesor inicia o finaliza, el servidor emite `estado` a esa sala. Los otros navegadores actualizan la nube o ven la actividad cerrada.

La contraseña del docente está en el entorno del contenedor. El navegador la envía una vez. Si coincide, la API crea una sesión y devuelve una cookie. El panel exige esa sesión. Enviar una palabra a una actividad abierta sigue abierto para los alumnos.

Al arrancar, la API prueba `SELECT 1` contra PostgreSQL. Si la base no responde, el proceso termina. Con la política de reinicio, Docker puede volver a iniciarlo cuando el proceso sale solo.

**Recurso visual sugerido:**

Caja `api` con tres puertas: pedidos HTTP, Socket.IO y conexión a `db`. Al lado, una sala dibujada como un círculo de navegadores unidos por el código de la actividad.

**Demostración (si corresponde):**

En la diapositiva 20: dos pestañas de la misma actividad, una palabra enviada en una y la nube creciendo en la otra.

---

### Diapositiva 14 — Contenedor 3: Base de datos (PostgreSQL)

**Objetivo:** Entender qué guarda `db` y qué sobrevive cuando el contenedor se apaga.

**Contenido para Canva:**

- Título: `db` guarda el aula
- Imagen oficial `postgres:16`
- Base, usuario y clave salen de `.env`
  - Base: `lluvia`
  - Usuario: `lluvia`
- Datos en el volumen `pgdata`
- La primera vez, con el volumen vacío, corre `db/init/`
- Tablas que usa la pantalla:
  - `preguntas`
  - `actividades`
  - `palabras`
  - `sesiones`
- Cada actividad guarda una copia del texto de la pregunta

**Explicación para el expositor:**

PostgreSQL vive en el contenedor `db`. Compose le pasa `POSTGRES_USER`, `POSTGRES_PASSWORD` y `POSTGRES_DB`. Los valores de práctica del ejemplo son usuario `lluvia`, clave `cambiar-esta-clave` y base `lluvia`. En la máquina de la clase valen los de `.env`.

Los archivos de la base están en el volumen `pgdata`, montado en `/var/lib/postgresql/data`. Por eso apagar o recrear el contenedor deja las filas, mientras ese volumen siga.

La carpeta `db/init` se monta en el directorio de inicio de la imagen, solo lectura. Esos `.sql` corren cuando el volumen está vacío, en orden alfabético. `001_words.sql` crea la tabla `words`, de la primera versión de la nube. La pantalla actual ya no la usa. `002_banco.sql` crea el banco: categorías, preguntas, actividades, palabras y sesiones, y carga categorías y preguntas de ejemplo. Una de esas preguntas es «Definí Docker en una sola palabra.»

Una actividad copia el texto en la columna `texto_pregunta`. Si después el profesor edita la pregunta del banco, las actividades ya iniciadas siguen mostrando la copia con la que empezaron.

El control de salud ejecuta `pg_isready`. Compose usa ese resultado para dejar salir a `api` en el primer arranque.

**Recurso visual sugerido:**

Cilindro clásico de base de datos, con la etiqueta `postgres:16`, y un disco aparte etiquetado `pgdata`. Flecha: el contenedor se puede reemplazar; el disco sigue. Lista corta de las cuatro tablas vivas.

**Demostración (si corresponde):**

La consulta SQL de las diapositivas 20 y 21. Acá se puede mostrar, si ya hay datos, el nombre del volumen con `docker volume ls`.

---

### Diapositiva 15 — ¿Cómo se comunican los tres contenedores?

**Objetivo:** Seguir una palabra desde el teclado hasta las otras pantallas, con los nombres y puertos reales.

**Contenido para Canva:**

- Título: Una palabra, de punta a punta
- 1. El alumno escribe en `/a/` y el código
- 2. El navegador envía `POST /api/a/.../palabras` al puerto 8088
- 3. Nginx reenvía el pedido a `api:4000`
- 4. Express guarda la fila en `db:5432`, tabla `palabras`
- 5. La API emite `estado` a la sala de esa actividad
- 6. Nginx lleva Socket.IO de vuelta a los navegadores
- 7. La nube crece en las pestañas abiertas, sin recargar
- El profesor cierra la actividad por el mismo camino de aviso

**Explicación para el expositor:**

Conviene contarlo como una historia de seis pasos, señalando el diagrama de la diapositiva 10.

El formulario del alumno hace un POST. Como la dirección de la API en el sitio compilado está vacía, el pedido sale al mismo host del que vino la página. Nginx lo reconoce por el prefijo `/api/` y lo entrega a `http://api:4000`. Express valida la palabra, abre una transacción y escribe en `palabras`. La pareja actividad y palabra normalizada es única: repetir suma `cantidad`.

Después del guardado, el servidor publica el estado nuevo en la sala `actividad:` más el código. Los navegadores que hicieron `mirar` con ese código reciben el evento `estado` y redibujan la nube. La palabra que más se repite se dibuja más grande.

El cierre funciona por el mismo aviso. El profesor, ya con sesión, pide finalizar. La API marca la actividad como `cerrada` y emite `estado`. En la pantalla del alumno el campo queda deshabilitado y aparece el texto de que las palabras quedan guardadas.

Cambiar la pregunta del banco es otro gesto, y conviene decirlo con precisión. Iniciar una actividad crea un código nuevo y copia el texto de ese momento. Las personas entran por el enlace nuevo. Editar o borrar la pregunta del banco deja intacto el texto de las actividades ya iniciadas. La pantalla del panel lo dice así. Quienes ya están en una actividad abierta reciben en vivo las palabras y el cierre. Para pasar a otra pregunta, el profesor inicia otra actividad y comparte el enlace nuevo.

La API arma `DATABASE_URL` con el host `db` y el puerto 5432. Esa dirección la escribe Compose. La línea de `.env` que apunta a `127.0.0.1:5435` sirve para correr la API con npm en Ubuntu, fuera de Compose.

**Recurso visual sugerido:**

El diagrama de cuatro bloques, con números del 1 al 7 sobre las flechas. Una segunda viñeta chica: «nueva actividad = nuevo enlace». Dos navegadores mirando la misma nube.

**Demostración (si corresponde):**

Diapositiva 20, en este orden: iniciar una actividad, abrir el enlace en dos pestañas, enviar la misma palabra dos veces, finalizar y mostrar el campo deshabilitado. Si queda un minuto, editar la pregunta en el banco y volver a la actividad vieja: el texto de la nube sigue siendo el de la copia.

---

## BLOQUE 4 — Conceptos fundamentales de Docker en nuestro proyecto

### Diapositiva 16 — ¿Qué son las redes de Docker?

**Objetivo:** Entender que los contenedores se encuentran por nombre dentro de una red que Compose crea para el proyecto.

**Contenido para Canva:**

- Título: Una red interna con nombres
- Compose crea una red para `web`, `api` y `db`
- Dentro de esa red, el nombre del servicio es la dirección
  - Nginx llama a `api` en el puerto 4000
  - La API llama a `db` en el puerto 5432
- Esos nombres viven entre los contenedores
- Lo que se publica en Ubuntu:
  - `8088` → sitio, para el navegador
  - `127.0.0.1:5435` → PostgreSQL, en esta máquina
- El puerto 4000 de la API permanece en la red interna

**Explicación para el expositor:**

Una red de Docker es el medio por el que los contenedores de un mismo proyecto se alcanzan. Compose la crea al levantar el archivo. Ahí el nombre `db` responde. En la terminal de Ubuntu, `db` no es un sitio de internet: es un nombre de esa red.

Por eso `DATABASE_URL` dentro del contenedor `api` usa `@db:5432`. Si se usara `127.0.0.1` desde adentro de `api`, apuntaría al propio contenedor de la API, donde PostgreSQL no está.

Publicar un puerto es abrir una puerta desde Ubuntu hacia un puerto del contenedor. La puerta de la aplicación es 8088. La de la base, 5435, está limitada a la interfaz local. La API se queda detrás de Nginx: el navegador llega a ella por `/api` y por `/socket.io`, sin abrir el 4000 en la máquina.

Analogía: el edificio tiene un portero en la puerta 8088. Los departamentos `api` y `db` se visitan por el pasillo interno, usando el nombre de la puerta. El departamento de la base tiene además una mirilla local, la 5435, para consultar desde esta computadora.

**Recurso visual sugerido:**

Un óvalo titulado «red de Compose». Adentro, tres cajas unidas por líneas con las etiquetas `api:4000` y `db:5432`. Afuera, el navegador, con una sola flecha al puerto 8088. Una flecha fina y local hacia 5435.

**Demostración (si corresponde):**

Opcional, desde la carpeta del proyecto: `docker compose port web 80` y `docker compose port db 5432`. Muestran el mapeo publicado. `docker compose port api 4000` no tiene publicación en el archivo.

---

### Diapositiva 17 — ¿Qué son los volúmenes y cómo conservamos los datos?

**Objetivo:** Entender que los datos de PostgreSQL viven fuera del disco descartable del contenedor.

**Contenido para Canva:**

- Título: El volumen conserva las palabras
- El disco propio de un contenedor se puede descartar
- `pgdata` guarda los archivos de PostgreSQL
- Ruta dentro del contenedor: `/var/lib/postgresql/data`
- En esta máquina el volumen se llama `jugando-con-docker_pgdata`
- Detener o recrear `db` deja el volumen
- `docker compose down -v` borra el volumen y los datos
- `db/init` es una carpeta del proyecto, solo lectura
- Esos SQL corren cuando el volumen está vacío

**Explicación para el expositor:**

Un volumen es almacenamiento que Docker administra aparte de la carpeta del contenedor. En Compose está declarado al final del archivo, con el nombre `pgdata`. Docker le agrega el prefijo del proyecto: `jugando-con-docker_pgdata`.

Analogía: el contenedor es una oficina que se puede desarmar. El volumen es el archivo de metal que queda en el depósito. La oficina nueva abre el mismo archivo.

Hay un segundo montaje, distinto. `./db/init` es una carpeta del repositorio que se ve dentro del contenedor en el directorio de scripts iniciales, en modo solo lectura. Sirve para crear las tablas la primera vez. Con el volumen ya lleno, PostgreSQL no vuelve a ejecutar esos archivos al reiniciar.

El volumen vive en esta máquina, asociado a Docker. Es la persistencia del proyecto. Es un solo disco: si se borra el volumen o se pierde el disco, se pierden preguntas y respuestas. En la demo se usa `docker compose stop` y, si se quiere, recrear `db`. Se deja `docker compose down -v` fuera de la demostración.

**Recurso visual sugerido:**

A la izquierda, el contenedor `db`, con un borde punteado. A la derecha, un disco sólido `jugando-con-docker_pgdata`. Una tabla chica de dos filas: «detener o recrear el contenedor» / «el volumen sigue»; «`docker compose down -v`» / «se borra el volumen».

**Demostración (si corresponde):**

`docker volume ls` en la diapositiva 21, antes y después de reiniciar, señalando el mismo nombre.

---

### Diapositiva 18 — ¿Qué ocurre cuando levantamos el proyecto con Docker Compose?

**Objetivo:** Desglosar `docker compose up --build` en el orden real de este archivo.

**Contenido para Canva:**

- Título: Qué hace `docker compose up --build`
- Lee `docker-compose.yml` y `.env`
- Crea la red del proyecto y el volumen `pgdata`, si faltan
- `--build` construye `web` y `api`
- Descarga `postgres:16` si todavía no está
- Orden de arranque
  1. `db`, y espera el control de salud
  2. `api`, que prueba la conexión a la base
  3. `web`, que queda escuchando en el puerto 80
- Publica 8088 y 127.0.0.1:5435
- La pantalla abre en `http://127.0.0.1:8088`

**Explicación para el expositor:**

El comando tiene dos partes. `up` crea y arranca lo que el archivo describe. `--build` obliga a construir las imágenes que tienen `build:` en el archivo, o sea `web` y `api`. La base se indica con `image:`, así que esa parte se descarga, no se compila en el repositorio.

Por dentro, en la primera vez, Docker crea la red y el volumen, construye la imagen del sitio en dos etapas y la de la API en una, y pone a correr PostgreSQL. El control de salud pregunta con `pg_isready` cada 5 segundos, con tiempo de espera de 5 segundos y hasta 12 intentos. Cuando `db` está sano, arranca `api`. El servidor escucha en todas las interfaces del contenedor, `0.0.0.0`, puerto 4000, y comprueba la base. Después arranca `web`.

La primera vez puede tardar: descarga imágenes e instala dependencias. Las siguientes, `docker compose up` alcanza si el código de la pantalla y de la API no cambió. `--build` vuelve a hacer falta cuando ese código cambió.

Si el volumen está vacío, en este arranque también corren los SQL de `db/init`. Si el volumen ya tiene datos, PostgreSQL abre esos archivos y omite los scripts.

`restart: unless-stopped` queda asociado a cada contenedor. Un fallo en el que el proceso termina solo hace que Docker lo inicie otra vez. Un `docker compose stop` es una detención pedida, y el contenedor queda quieto hasta un `start` o un `up`.

**Recurso visual sugerido:**

El comando en grande, partido en dos pastillas: `up` y `--build`. Debajo, una secuencia vertical de cinco pasos con los verbos: leer, crear red y volumen, construir, esperar a `db`, abrir el puerto 8088.

**Demostración (si corresponde):**

La diapositiva 19 ejecuta el comando. Esta lámina prepara a la audiencia para leer la salida de la terminal sin perderse.

---

## BLOQUE 5 — Demostración práctica

### Diapositiva 19 — Levantamiento: los tres contenedores funcionando

**Objetivo:** Ver los tres servicios en marcha y la pantalla respondiendo en el puerto 8088.

**Contenido para Canva:**

- Título: Los tres contenedores, en marcha
- Desde la carpeta del proyecto:

```bash
cp .env.example .env
docker compose up --build
```

- En otra terminal:

```bash
docker compose ps
```

- Tiene que listar `web`, `api` y `db`
- `db` queda healthy
- Abrir `http://127.0.0.1:8088`

**Explicación para el expositor:**

Preparar `.env` antes de la clase, para no crear claves en vivo. El `cp` se muestra solo si se quiere recordar que `.env` no viene en Git. Si el archivo ya existe, se salta ese paso.

Conviene tener una terminal ya en la carpeta del proyecto. Si los contenedores estaban detenidos y el código no cambió, se puede usar `docker compose up` y explicar en una frase que `--build` ya se hizo en un arranque anterior. Si se quiere mostrar la construcción, `docker compose up --build` es el comando de la lámina.

Mientras corre, señalar en la salida tres momentos: la construcción o el uso de las imágenes, el inicio de `db` y el mensaje de la API `API en http://0.0.0.0:4000`.

`docker compose ps` es la prueba visual. Se esperan los tres servicios, el mapeo `0.0.0.0:8088->80/tcp` en `web`, el mapeo `127.0.0.1:5435->5432/tcp` en `db`, y ningún puerto de Ubuntu en `api`.

Después se abre el navegador en el inicio. Ahí termina esta lámina. El recorrido de preguntas y palabras es la siguiente.

Para frenar al cierre de la clase, sin borrar datos: `docker compose stop`.

**Recurso visual sugerido:**

Terminal a la izquierda con `docker compose ps`. Navegador a la derecha en el inicio. Tres indicadores verdes con los nombres `web`, `api` y `db`.

**Demostración (si corresponde):**

En vivo, o con el video 2 y el video 3.

1. `docker compose up --build` (o `up`, si ya está construido).
2. `docker compose ps`.
3. Abrir `http://127.0.0.1:8088` y mostrar el inicio.

---

### Diapositiva 20 — Recorrido: palabras, actualizaciones y la pregunta del profesor

**Objetivo:** Ver el camino de la diapositiva 15 en la aplicación real, incluido el cambio de pregunta.

**Contenido para Canva:**

- Título: Del panel a la nube
- Panel: `http://127.0.0.1:8088/profesor`
- La contraseña es `TEACHER_PASSWORD`, en `.env`
- En el ejemplo de práctica: `aula-de-prueba`
- Iniciar una pregunta del banco genera un enlace `/a/` y un código
- Dos pestañas de ese enlace
- La misma palabra, enviada dos veces, crece en las dos
- Finalizar cierra el campo en las pestañas abiertas
- Otra pregunta = otra actividad = otro enlace
- La actividad ya iniciada conserva su copia del texto

**Explicación para el expositor:**

El recorrido cabe en pocos minutos.

1. Abrir `/profesor` e ingresar la contraseña de `.env`. El ejemplo del repositorio es `aula-de-prueba`. Si en la máquina se cambió, usar esa.
2. Mostrar el banco. Ya trae categorías y preguntas de ejemplo, entre ellas «Definí Docker en una sola palabra.»
3. Pulsar Iniciar en esa pregunta. El panel muestra el enlace. El estado de la actividad queda `abierta`.
4. Abrir el enlace en dos ventanas o pestañas, como si fueran dos alumnos. Los alumnos entran sin cuenta.
5. Enviar `imagen` en una. Tiene que aparecer en las dos sin recargar.
6. Enviar `imagen` en la otra. La cantidad pasa a 2 y el tamaño en la nube acompaña a la palabra más repetida.
7. Volver al panel y pulsar Finalizar. En las pestañas de los alumnos el campo queda deshabilitado y se lee que las palabras quedan guardadas.

Para el cambio de pregunta, hacer las dos cosas que el sistema realmente distingue.

8. En el banco, editar el texto de esa pregunta y guardarlo. Volver a la actividad ya iniciada: sigue el texto copiado al inicio. El panel lo advierte: editar o borrar una pregunta no cambia el texto de una actividad ya iniciada.
9. Iniciar otra pregunta, o la misma ya editada. Aparece un código nuevo. Abrir ese enlace: la pregunta es la nueva y la nube empieza vacía. La actividad anterior conserva sus palabras.

Consulta opcional, en otra terminal:

```bash
docker compose exec db psql -U lluvia -d lluvia -c "SELECT actividades.codigo, actividades.texto_pregunta, palabras.texto, palabras.cantidad FROM palabras JOIN actividades ON actividades.id = palabras.actividad_id ORDER BY palabras.created_at;"
```

Ahí se ven el código, la copia de la pregunta y la cantidad.

**Recurso visual sugerido:**

Dos navegadores lado a lado con la misma nube, y el panel en una tercer franja. Un cuadro breve: «editar el banco deja la actividad anterior con su copia; iniciar crea otro enlace».

**Demostración (si corresponde):**

En vivo, con los nueve pasos de la explicación. El video 1 puede cubrir el recorrido general y el video 4, las dos pestañas más la fila en PostgreSQL.

---

### Diapositiva 21 — Persistencia: qué ocurre al reiniciar los contenedores

**Objetivo:** Comprobar que las palabras siguen porque viven en el volumen, no en el contenedor que se apagó.

**Contenido para Canva:**

- Título: Se apagan los contenedores. Las palabras siguen.
- Anotar una palabra visible en la nube
- Detener, sin borrar el volumen:

```bash
docker compose stop
docker compose up
```

- Volver a abrir el mismo enlace `/a/` y el código
- La pregunta, la nube y las cantidades siguen
- El volumen sigue en:

```bash
docker volume ls
```

- Recrear solo la base, también sin borrar datos:

```bash
docker compose stop db
docker compose rm -f db
docker compose up -d db
```

**Explicación para el expositor:**

Esta demostración cierra el concepto de volumen. Primero se mira la nube y, si se quiere, la consulta SQL de la lámina anterior. Después `docker compose stop` detiene `web`, `api` y `db`. La página deja de responder en el 8088. `docker compose up` los vuelve a crear en marcha. El mismo enlace tiene que mostrar la misma pregunta y las mismas palabras.

`docker volume ls` muestra `jugando-con-docker_pgdata` antes y después. El nombre no cambia.

El segundo tramo es más fino y vale la pena si hay tiempo. `docker compose rm -f db` borra el contenedor de la base. El volumen queda. `docker compose up -d db` crea otro contenedor con la imagen `postgres:16` y engancha el mismo volumen. Al quedar healthy, la consulta devuelve las mismas filas. En una prueba del proyecto, ese ciclo dejó las actividades y la palabra, y tardó unos segundos hasta que `db` estuvo healthy.

Decir en voz alta el comando que no se ejecuta: `docker compose down -v` borra también el volumen. Por eso queda fuera de la clase.

`docker compose restart` es otra forma breve de reiniciar los tres y volver a abrir el enlace. Sirve si se prefiere un solo gesto en lugar de `stop` y `up`.

**Recurso visual sugerido:**

Antes y después: la misma nube, y entre ambas una terminal con `docker compose stop`. Abajo, el nombre del volumen subrayado en `docker volume ls`.

**Demostración (si corresponde):**

En vivo, o con el video 5. Dejar el enlace de la actividad anotado antes de detener, para volver al mismo código.

---

## BLOQUE 6 — Cierre

### Diapositiva 22 — ¿Qué aprendimos con Jugando con Docker?

**Objetivo:** Dejar una lista corta de ideas que se pueden llevar a otro proyecto.

**Contenido para Canva:**

- Título: Lo que queda después de la clase
- Docker construye imágenes y corre contenedores
- La imagen es el molde. El contenedor es el molde en uso
- Compose describe el conjunto: servicios, red, volumen y puertos
- Cada parte de esta aplicación vive en su contenedor
  - `web` entrega la pantalla y reenvía
  - `api` guarda y avisa
  - `db` persiste
- La red interna une `api` y `db` por nombre
- El volumen `pgdata` conserva los datos al reiniciar
- El mismo esquema sirve para otros proyectos: sitio, servidor y base

**Explicación para el expositor:**

Cerrar volviendo al mapa de la diapositiva 10, ahora con los nombres ya vistos.

La utilidad fuera de este aula es concreta. Cuando un proyecto tiene una pantalla, un servidor y una base, Compose permite describirlos juntos, fijar versiones en las imágenes, esconder los puertos internos y dejar los datos en un volumen. Las variables de entorno sacan las claves del código: acá, la de PostgreSQL y `TEACHER_PASSWORD`.

También queda una distinción útil para proyectos reales. Reiniciar, como está configurado con `unless-stopped`, vuelve a levantar el mismo contenedor después de un corte corto. Tener dos copias vivas al mismo tiempo sería otra decisión, y este proyecto trabaja con una copia de cada servicio.

La frase de cierre puede ser: vimos Docker porque vimos una palabra viajar del navegador a PostgreSQL y volver a la nube, y porque esa palabra siguió ahí después de apagar los contenedores.

**Recurso visual sugerido:**

El diagrama Navegador → web → api → db, ya conocido, con una palabra clave bajo cada flecha: puerto 8088, red interna, volumen. Poco texto nuevo.

**Demostración (si corresponde):**

Sin comando nuevo. Si la nube de la demo sigue abierta, dejarla de fondo mientras se cierra.

---

## Material audiovisual para la presentación

Espacios para pegar enlaces cuando los videos estén grabados. Los enlaces se dejan vacíos a propósito.

### Video 1 — Presentación general de la aplicación

- **Qué debería mostrar:** el inicio en `http://127.0.0.1:8088`, el ingreso a `/profesor`, el banco de preguntas, el inicio de una actividad y el enlace `/a/` con el código. Un alumno envía una palabra y la nube la muestra.
- **Qué concepto explica:** qué problema de aula resuelve el proyecto, para que Docker tenga un ejemplo visible.
- **En qué diapositiva conviene insertarlo:** diapositiva 2, como contexto. Se puede repetir un fragmento corto en la diapositiva 20 si la demo en vivo se acorta.
- **Enlace:**

```text
[pegar enlace]
```

### Video 2 — Ejecución de Docker Compose

- **Qué debería mostrar:** la terminal en la carpeta del proyecto, el comando `docker compose up --build`, la construcción de `web` y `api`, el arranque de `db` y el mensaje de la API en el puerto 4000. Cortar antes de una espera larga de descarga, o acelerar ese tramo.
- **Qué concepto explica:** qué hace cada parte de `docker compose up --build`.
- **En qué diapositiva conviene insertarlo:** diapositiva 18, para acompañar el desglose, o diapositiva 19 si se prefiere la demo completa ahí.
- **Enlace:**

```text
[pegar enlace]
```

### Video 3 — Los tres contenedores funcionando

- **Qué debería mostrar:** `docker compose ps` con `web`, `api` y `db`, los puertos 8088 y 127.0.0.1:5435, `db` en estado healthy, y el navegador abriendo el inicio.
- **Qué concepto explica:** contenedor en ejecución, y la diferencia entre el puerto publicado y el servicio que quedó solo en la red interna.
- **En qué diapositiva conviene insertarlo:** diapositiva 19. También sirve como apoyo visual de la diapositiva 11.
- **Enlace:**

```text
[pegar enlace]
```

### Video 4 — Comunicación entre frontend, backend y base de datos

- **Qué debería mostrar:** dos pestañas en el mismo enlace `/a/`. Una palabra enviada en la primera aparece en la segunda sin recargar. Después, la consulta SQL con `docker compose exec db psql` mostrando código, texto y cantidad. Opcional: Finalizar en el panel y el campo deshabilitado en las pestañas.
- **Qué concepto explica:** el recorrido navegador → Nginx → API → PostgreSQL, y el regreso por Socket.IO.
- **En qué diapositiva conviene insertarlo:** diapositiva 15, si se quiere el concepto antes de la demo, o diapositiva 20, como la demo misma.
- **Enlace:**

```text
[pegar enlace]
```

### Video 5 — Persistencia de datos

- **Qué debería mostrar:** la nube con palabras, `docker volume ls` con `jugando-con-docker_pgdata`, `docker compose stop`, la página sin respuesta, `docker compose up`, y el mismo enlace con las mismas palabras. Si el video puede ser un minuto más largo: `docker compose stop db`, `docker compose rm -f db`, `docker compose up -d db` y la misma consulta SQL de antes.
- **Qué concepto explica:** el volumen `pgdata` conserva los datos cuando el contenedor se detiene o se recrea.
- **En qué diapositiva conviene insertarlo:** diapositiva 21. Un fotograma del volumen también sirve en la diapositiva 17.
- **Enlace:**

```text
[pegar enlace]
```

### Capturas útiles para Canva

Conviene sacarlas con la aplicación ya levantada y una actividad de ejemplo creada. Nombres sugeridos, para encontrarlas al armar las láminas:

| Captura | Qué tiene que verse | Dónde usarla |
| --- | --- | --- |
| Inicio | `http://127.0.0.1:8088` con el texto de la lluvia de palabras y el botón del panel | Diapositivas 1 y 2 |
| Ingreso del profesor | `/profesor` antes de entrar | Diapositiva 2 |
| Banco | Lista de preguntas, con «Definí Docker en una sola palabra.» y el botón Iniciar | Diapositivas 2 y 20 |
| Enlace de la actividad | El aviso del panel con `http://127.0.0.1:8088/a/` y el código | Diapositiva 20 |
| Nube en dos ventanas | La misma palabra con cantidad 2 en las dos | Diapositivas 10, 15 y 20 |
| Actividad cerrada | El texto «La actividad está cerrada. Las palabras quedan guardadas.» | Diapositiva 20 |
| `docker compose ps` | `web`, `api` y `db`, con 8088 y 5435 | Diapositivas 7, 11 y 19 |
| `docker volume ls` | `jugando-con-docker_pgdata` | Diapositivas 17 y 21 |
| Consulta SQL | Código, texto de la palabra y cantidad | Diapositivas 14 y 20 |
| Fragmento de `docker-compose.yml` | Los tres servicios, sin mostrar claves reales | Diapositivas 9 y 11 |

En las capturas de terminal, evitar un `.env` abierto. Las claves de práctica alcanzan con nombrarlas en la lámina; no hace falta fotografiar el archivo.
