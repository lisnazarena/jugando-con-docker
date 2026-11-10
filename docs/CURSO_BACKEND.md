# Curso: cómo funciona la API

Este curso explica la primera API, la de la tabla `words`. Desde el 4 de noviembre el servidor de clase está en `server.js`, `banco.js` y `sesion.js`: el panel exige la cookie y las palabras se guardan por actividad. Lo que sigue sirve para entender el camino de un pedido, con la lista global que la pantalla ya no usa.

Este texto explica la carpeta `backend/` para alguien que ya leyó [el curso del frontend](CURSO_FRONTEND.md). Se puede leer de arriba hacia abajo. Cada lección usa solo lo que ya se explicó antes.

Al terminar vas a poder señalar un archivo y decir qué hace, y vas a poder seguir una palabra desde el `curl` hasta la fila que la guarda.

La pantalla ya llama a esta API. Muestra una copia de la lista y, cuando alguien envía, hace un `POST`. La lista que manda está en PostgreSQL. Si el proceso de Node se detiene y vuelve a arrancar, las palabras siguen. Si PostgreSQL está detenido, la API no puede leerlas y responde que la base no responde.

Para leerlo con el código al lado, en una terminal:

```bash
cd backend
npm install
npm run dev
```

Tiene que aparecer `API en http://127.0.0.1:4000`. Dejá esa terminal ocupada y abrí otra para los `curl`. En el editor, abrí `backend/src/`.

Si en lugar de ese mensaje aparece `EADDRINUSE` y `port: 4000`, ya hay un proceso escuchando en ese puerto. Este servidor admite una sola copia a la vez. Cerrá la otra con Ctrl+C y volvé a ejecutar `npm run dev`.

## Lección 1. Qué es el backend

El backend es la parte del programa que corre en la máquina, fuera del navegador. En este paso es un proceso de Node que escucha en el puerto 4000.

Hoy hay dos programas distintos:

| Programa | Dónde corre | Puerto | Qué recuerda |
| --- | --- | --- | --- |
| La pantalla, con Vite | En el navegador | 5173 | Una copia de la lista, para dibujarla |
| Esta API | En Node | 4000 | Consulta las filas y avisa a las pestañas |

Un puerto es un número que distingue un programa de otro en la misma computadora. El 5173 y el 4000 pueden estar abiertos al mismo tiempo. El 4000 se eligió porque el 3000 ya lo usa otro proyecto de esta máquina.

La pantalla habla con esta API por HTTP y por Socket.IO. `curl` sigue sirviendo para hacer el mismo pedido desde la terminal.

## Lección 2. Cuatro ideas de este servidor

No hace falta saber todo Node. Este servidor usa cuatro ideas.

### Proceso

Un proceso es un programa en ejecución. `npm run dev` crea el proceso de la API. Ese proceso no guarda la lista: le pide las filas a PostgreSQL, que corre en otro proceso, dentro de un contenedor. Cuando el proceso de la API termina, las filas siguen en el volumen de Docker.

### Pedido y respuesta HTTP

HTTP es la conversación de la web. Alguien hace un pedido y el servidor responde una vez.

- `GET` pide datos. No los modifica.
- `POST` envía datos para que el servidor los incorpore.

Cada respuesta trae un número de estado. 200 significa que el pedido se aceptó. 400 significa que el pedido llegó, pero el contenido no sirve: una palabra vacía, por ejemplo.

### JSON

JSON es un texto con una forma acordada para intercambiar datos. La lista viaja así:

```json
{ "words": [ { "id": "un-id", "text": "volumen", "count": 1 } ] }
```

Un objeto va entre llaves. Una lista va entre corchetes. Los textos van entre comillas.

### Aviso a varios clientes

HTTP responde solo a quien preguntó. Socket.IO mantiene una conexión abierta y avisa a todas las pestañas conectadas cuando la lista cambia. La pantalla escucha el evento `words`.

## Lección 3. El camino de un pedido

Cuando corrés `curl -s http://127.0.0.1:4000/api/words` ocurre esto, en orden:

1. `curl` abre una conexión con la máquina local, en el puerto 4000.
2. Node, que está escuchando ahí, recibe el pedido `GET /api/words`.
3. Express elige la función registrada para esa ruta.
4. Esa función lee las filas y las convierte en JSON.
5. `curl` imprime esa respuesta en la terminal.

```text
curl
    └── HTTP, puerto 4000
            └── server.js          Express elige la ruta
                    └── words.js   lee y escribe la tabla words
```

`127.0.0.1` significa esta misma computadora. El servidor está atado a esa dirección: otro equipo de la red no llega a este puerto.

Un `POST` hace el mismo camino y, además, escribe en la tabla antes de responder.

## Lección 4. Mapa de la carpeta

```text
backend/
├── package.json         nombre del proyecto, comandos y librerías
├── package-lock.json    versiones exactas instaladas
└── src/
    ├── server.js        HTTP, Express y Socket.IO
    └── words.js         reglas de la palabra y consultas a PostgreSQL
```

`node_modules/` aparece después de `npm install`. Ahí están Express, Socket.IO, CORS y las librerías que ellas piden. No se edita y no se sube a Git. El `.gitignore` de la raíz del repositorio ya ignora cualquier `node_modules/`.

El archivo que fija las versiones de esta API es `backend/package-lock.json`. Un `package-lock.json` en la raíz del repositorio, con la lista de paquetes vacía, no arranca este servidor y no lo usa `npm run dev`.

## Lección 5. `package.json`

```json
{
  "name": "backend",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "node --watch src/server.js",
    "start": "node src/server.js"
  }
}
```

| Campo | Qué hace |
| --- | --- |
| `name` | Nombre interno del proyecto. No es la dirección web |
| `private` | Le pide a npm que no intente publicarlo como librería |
| `type: module` | Permite `import` y `export` en `src/` |
| `dev` | Arranca el servidor y lo vuelve a arrancar al guardar un archivo |
| `start` | Arranca el servidor una sola vez |

`node --watch` mira `server.js` y los archivos que ese archivo importa. Si guardás `words.js`, Node mata el proceso y lo crea de nuevo. Las filas no se borran: el proceso nuevo vuelve a leerlas de PostgreSQL. Ctrl+C y volver a correr el comando tiene el mismo efecto.

En `dependencies` hay tres librerías:

| Librería | Para qué está |
| --- | --- |
| `express` | Recibe HTTP y elige qué función responde cada ruta |
| `socket.io` | Mantiene clientes conectados y les manda la lista |
| `cors` | Le dice al navegador que acepte respuestas venidas del puerto 4000 |

La versión con `^`, como `^4.22.3`, permite actualizaciones chicas. `package-lock.json` anota la versión exacta que quedó instalada, incluidas las librerías que Express pide por su cuenta. No se edita a mano. `npm install` en otra máquina reproduce esa instalación.

## Lección 6. `server.js`, el arranque

El archivo prepara el proceso y después se queda esperando pedidos.

### Los import

```js
import cors from 'cors'
import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import { addWord, listWords } from './words.js'
```

Las cuatro primeras líneas traen código instalado. La última trae dos funciones del otro archivo de este proyecto. `./words.js` es una ruta relativa: el archivo está en la misma carpeta.

Express y Socket.IO tienen que compartir el mismo servidor HTTP. Por eso el archivo crea ese servidor con `createServer` y se lo entrega a los dos. Si cada uno abriera su propio puerto, el aviso de Socket.IO y las rutas HTTP quedarían separados.

### El puerto

```js
const port = Number(process.env.API_PORT) || 4000
```

`process.env` es el entorno del proceso: variables que la terminal puede dejarle al programa. Si `API_PORT` existe y es un número, se usa ese. Si no existe, queda 4000. Este archivo no lee `.env` solo. Con `npm run dev`, sin exportar nada, el puerto es 4000. En `.env.example` ese valor ya está previsto para más adelante.

### A quién le responde el navegador

```js
const origins = ['http://127.0.0.1:5173', 'http://localhost:5173']

const app = express()
app.use(cors({ origin: origins }))
app.use(express.json())
```

La pantalla de Vite sale de uno de esos dos orígenes, según escribas `127.0.0.1` o `localhost` en la barra del navegador. Para el navegador son sitios distintos, y ambos son distintos del puerto 4000.

Un sitio web, por defecto, solo lee respuestas de su propio origen. CORS es el permiso que el servidor agrega a la respuesta para que el navegador acepte la lista. `curl` no aplica esa regla: por eso los pedidos de la terminal funcionan aunque CORS estuviera mal. El permiso está puesto ahora para cuando la pantalla se conecte.

`express.json()` lee el cuerpo del `POST` cuando viene como JSON y lo deja en `request.body`. Sin esa línea, `request.body` no tendría la palabra.

### Escuchar

Al final del archivo:

```js
httpServer.listen(port, '127.0.0.1', () => {
  console.log(`API en http://127.0.0.1:${port}`)
})
```

`listen` ocupa el puerto y no termina. La función de adentro corre una vez, cuando el puerto quedó tomado. El mensaje de la terminal sale de ahí. A partir de ese momento el proceso espera pedidos.

El segundo argumento, `'127.0.0.1'`, limita la escucha a esta máquina.

## Lección 7. `words.js` y la tabla

La tabla se crea con `db/init/001_words.sql` la primera vez que el contenedor arranca con el volumen vacío. PostgreSQL oficial ejecuta los `.sql` de esa carpeta solo en ese momento.

| Columna | Qué guarda |
| --- | --- |
| `id` | Identificador de esa palabra. No cambia cuando se repite |
| `text` | El texto visible, con las mayúsculas del último envío |
| `normalized` | El mismo texto en minúsculas, para reconocer repeticiones |
| `count` | Cuántas veces se aceptó |
| `question` | La pregunta de la actividad, fija en el código |
| `created_at` | Cuándo se agregó por primera vez. Ordena la lista |

`normalized` tiene una restricción `UNIQUE`: PostgreSQL no deja dos filas con la misma palabra.

La pantalla sigue recibiendo solo `id`, `text` y `count`. La pregunta y la fecha quedan en la base para consultarlas con `psql`.

### Leer

```js
export async function listWords() {
  const result = await pool.query(
    'SELECT id, text, count FROM words ORDER BY created_at, id',
  )
  return toWords(result.rows)
}
```

`pool` es la conexión con PostgreSQL. `query` manda el SQL y espera las filas. `toWords` arma los objetos que ya conoce la pantalla y convierte `count` en número.

### La misma palabra, sin mirar mayúsculas

```js
function normalize(text) {
  return text.toLocaleLowerCase('es')
}
```

`volumen` y `Volumen` quedan en la misma clave. `'es'` pide las reglas de minúsculas del español. Esa clave se guarda en `normalized`.

### Agregar

`addWord` recibe el texto crudo. Si no es un string, queda vacío o pasa de 32 caracteres, devuelve `{ ok: false, error }` y no toca la base. El campo de la pantalla ya limita a 32 caracteres. El servidor repite el límite porque un `curl` puede saltarse el campo.

Si el texto sirve, una sola sentencia inserta o actualiza:

```sql
INSERT INTO words (id, text, normalized, count, question)
VALUES ($1, $2, $3, 1, $4)
ON CONFLICT (normalized)
DO UPDATE SET text = EXCLUDED.text, count = words.count + 1
```

`$1`, `$2`, `$3` y `$4` son los valores que manda Node. PostgreSQL los trata como datos, no como parte del SQL. Si `normalized` ya existe, no crea otra fila: deja el `id`, pone el texto nuevo y suma 1 a `count`. El último envío define las mayúsculas que quedan guardadas.

Después `addWord` vuelve a leer la tabla y devuelve `{ ok: true, words }`.

## Lección 8. Las dos rutas

### `GET /api/words`

```js
app.get('/api/words', async (_request, response) => {
  response.json({ words: await listWords() })
})
```

No usa el pedido. El guion bajo del nombre `_request` marca eso. `response.json` convierte el objeto a JSON, pone el estado 200 y cierra la respuesta.

Con la lista vacía, el cuerpo es:

```json
{"words":[]}
```

### `POST /api/words`

```js
const result = await addWord(request.body?.text)

if (!result.ok) {
  response.status(400).json({ error: result.error })
  return
}

io.emit('words', result.words)
response.json({ words: result.words })
```

`request.body?.text` lee `text` solo si `body` existe. Si el cuerpo no es JSON, `body` puede faltar y la expresión vale `undefined`. `addWord` lo rechaza.

Si `ok` es falso, la respuesta es 400 y el cuerpo es `{ "error": "..." }`. El `return` evita seguir. En ese caso no hay aviso por Socket.IO, porque la lista no cambió.

Si `ok` es verdadero, primero avisa por Socket.IO y después responde 200 con la lista completa, no solo con la palabra nueva. Si PostgreSQL no contesta, la respuesta es 503 y el texto es «La base no responde.»

El pedido que ya corriste fue este:

```bash
curl -s -X POST http://127.0.0.1:4000/api/words \
  -H 'content-type: application/json' \
  -d '{"text":"volumen"}'
```

`-X POST` elige el método. `-H` declara que el cuerpo es JSON: sin ese encabezado, `express.json()` no lo interpreta. `-d` es el cuerpo. La respuesta fue una lista de un elemento, con `text` igual a `volumen` y `count` igual a 1.

Si pegás el `GET` y el `POST` uno detrás del otro, la terminal puede mostrar los dos JSON en la misma línea:

```text
{"words":[]}{"words":[{"id":"...","text":"volumen","count":1}]}
```

Son dos respuestas. `curl -s` no inserta un salto entre comandos, y el JSON tampoco trae un salto final. Un `echo` después de cada `curl` los separa a la vista.

## Lección 9. Socket.IO

```js
const io = new Server(httpServer, {
  cors: { origin: origins },
})

io.emit('words', result.words)

io.on('connection', (socket) => {
  listWords()
    .then((words) => socket.emit('words', words))
    .catch((error) => console.error(error))
})
```

`io` es el conjunto de clientes conectados. `socket` es uno de ellos.

| Llamada | A quién le habla |
| --- | --- |
| `socket.emit('words', lista)` | Solo al cliente que acaba de conectarse |
| `io.emit('words', lista)` | A todos los que estén conectados en ese momento |

El nombre del aviso es `words`. El dato es la lista completa. Quien se conecta tarde recibe lo que ya estaba guardado, sin esperar a que alguien envíe otra palabra.

`io.emit` se llama únicamente desde el `POST` exitoso. El `GET` no emite nada: mirar la lista no es un cambio.

CORS se configura otra vez acá porque la conexión de Socket.IO también la abre el navegador, y también cruza del puerto 5173 al 4000.

## Lección 10. Un recorrido completo

El servidor está recién iniciado. Alguien manda `volumen` y después `Volumen`.

1. La tabla `words` no tiene filas.
2. `GET /api/words` responde `{ "words": [] }`.
3. Llega `POST` con `{ "text": "volumen" }`. `addWord` limpia el texto, no encuentra una igual y agrega una entrada nueva. `count` queda en 1. Se genera un `id`.
4. `publish` emite `words` con esa lista de un elemento. Si nadie está conectado, el aviso no tiene destinatarios y el `POST` igual responde.
5. La respuesta HTTP es 200 y trae la misma lista.
6. Llega `POST` con `{ "text": "Volumen" }`. `normalized` coincide con la fila anterior. `count` pasa a 2. `text` pasa a `Volumen`. El `id` sigue igual.
7. `publish` emite la lista actualizada. La respuesta HTTP también la trae.

Un tercer pedido con `{ "text": "   " }` no crea ni modifica una fila. La respuesta es 400 y el texto del error es «Escribí una palabra.» Los clientes conectados no reciben un aviso nuevo.

## Lección 11. Qué sobrevive al detener la API

Las filas están en el volumen Docker `jugando-con-docker_pgdata`, montado en los datos de PostgreSQL. Ese directorio no está en el repositorio.

Detener la API no las borra. Reiniciar el contenedor `api`, Ctrl+C en `npm run dev`, o cerrar la terminal, crean otro proceso de Node. Al volver a pedir `GET /api/words`, la palabra sigue, con el mismo `id` y el mismo `count`.

Lo que sí las borra es borrar el volumen, con `docker volume rm` o `docker compose down -v`. Esos comandos no se usan sin decir antes qué van a borrar.

Si la API está detenida, la pantalla muestra que el servidor no responde. Cuando vuelve, el evento `words` trae las filas que PostgreSQL conservó. Si el contenedor de la base está detenido, la API arranca y se detiene enseguida con «No se pudo conectar con PostgreSQL.»

## Lección 12. Qué está en Docker y cómo ver la tabla

Los tres servicios se encienden juntos:

```bash
docker compose up --build
```

| Parte | Dónde corre | Cómo se llega |
| --- | --- | --- |
| Pantalla | Contenedor `web`, Nginx en el puerto 80 | http://127.0.0.1:8088 |
| API | Contenedor `api`, puerto 4000 | No está publicado. Nginx le reenvía `/api` y `/socket.io` |
| PostgreSQL 16 | Contenedor `db` | Dentro de la red, el nombre `db` y el puerto 5432. En esta máquina, `127.0.0.1:5435` |

Otra computadora de la red no llega a PostgreSQL. Los datos están en el volumen `jugando-con-docker_pgdata`.

Para ver los tres:

```bash
docker compose ps
```

Pueden quedar contenedores viejos apagados, de pruebas anteriores. No son la forma actual de correr la aplicación. No hace falta encenderlos.

`npm run dev` sigue existiendo para cambiar la pantalla o la API sin reconstruir la imagen. En ese modo la pantalla usa el puerto 5173 y habla directo con el 4000. La base puede ser la de Compose, que ya publica el 5435.

### Entrar a la tabla

Con Compose en marcha, este comando muestra las palabras:

```bash
docker compose exec db psql -U lluvia -d lluvia -c 'SELECT text, count, question, created_at FROM words ORDER BY created_at;'
```

`docker exec` corre un programa dentro del contenedor. `psql` es el cliente de PostgreSQL. `-d lluvia` elige la base. `-c` ejecuta una consulta y vuelve a la terminal.

Cada fila es una palabra distinta. Las columnas se leen así:

| Columna | Qué estás viendo |
| --- | --- |
| `text` | La palabra, con las mayúsculas del último envío |
| `count` | Cuántas veces se envió |
| `question` | La pregunta de la actividad |
| `created_at` | Cuándo apareció por primera vez |

Si todavía nadie envió nada, la consulta devuelve cero filas. La tabla igual existe.

Para mirarla con calma, sin el `-c`:

```bash
docker compose exec db psql -U lluvia -d lluvia
```

`-it` deja la terminal dentro de `psql`. Ahí sirven estos comandos:

| Comando | Qué muestra |
| --- | --- |
| `\dt` | Las tablas de la base. Tiene que aparecer `words` |
| `\d words` | Las columnas, la clave y la regla de que `count` sea mayor que cero |
| `SELECT text, count FROM words ORDER BY created_at;` | Las palabras y sus cantidades |
| `\q` | Salir y volver a la terminal de Ubuntu |

El punto y coma del `SELECT` es obligatorio. Sin eso, `psql` espera que sigas escribiendo la consulta.

Desde Ubuntu, si el programa `psql` está instalado, la misma consulta entra por el puerto publicado:

```bash
psql "postgresql://lluvia:cambiar-esta-clave@127.0.0.1:5435/lluvia" -c 'SELECT text, count, question FROM words ORDER BY created_at;'
```

La contraseña de ese ejemplo es la de `.env.example`. El archivo `.env` real no se escribe en la documentación ni se sube al repositorio.

## Lección 13. Cómo se entera la pantalla

`frontend/src/App.jsx` habla con la API. En la imagen de Docker esa dirección queda vacía y el navegador usa el mismo origen, el puerto 8088. Con `npm run dev` usa `http://127.0.0.1:4000`.

Al montar la pantalla, abre Socket.IO. El servidor le manda la lista actual en el evento `words`. Cada vez que alguien envía una palabra, ese evento vuelve a llegar, también a las otras pestañas. `App` reemplaza su copia y `WordCloud` dibuja la lista nueva sin recargar.

Al apretar Enviar, después de rechazar el texto vacío, hace `POST /api/words` con `{ "text": "..." }`. Si la respuesta trae la lista, la nube se actualiza enseguida. El evento `words` trae la misma lista a las demás pestañas.

Si `fetch` no logra hablar con la API, o el socket se corta, el párrafo rojo dice: «El servidor no responde. Revisá que la aplicación esté en marcha.» «Escribí una palabra.» sigue siendo el mensaje del campo vacío. Son dos textos distintos.

Dentro de Compose, la API usa el nombre `db` y el puerto 5432. Esa dirección no existe en Ubuntu. La de `.env`, con `127.0.0.1:5435`, es la del modo `npm run dev`.

## Lección 14. Glosario

| Palabra | Significado en este proyecto |
| --- | --- |
| Proceso | El programa de Node mientras está en ejecución. Las palabras no viven ahí: están en PostgreSQL |
| Puerto | Número que separa programas en la misma máquina. La API usa el 4000 |
| HTTP | Un pedido y una respuesta. `GET` lee, `POST` incorpora |
| Ruta | El camino del pedido. Acá son `GET /api/words` y `POST /api/words` |
| JSON | El texto en el que viajan `words`, `text`, `count` y `error` |
| Estado HTTP | 200 si el pedido se aceptó, 400 si la palabra no sirve |
| Express | La librería que elige la función de cada ruta |
| CORS | El permiso para que la pantalla del puerto 5173 lea respuestas del 4000 |
| Socket.IO | La conexión que permanece abierta para avisar la lista nueva |
| Evento `words` | El aviso con la lista completa |
| `curl` | El comando de la terminal que hace un pedido HTTP |
| Contenedor | Un proceso aislado creado a partir de una imagen. Compose levanta `web`, `api` y `db` |
| Volumen | El lugar donde PostgreSQL guarda los archivos de la base. Sobrevive al contenedor |
| `psql` | El programa para ver y consultar las tablas |

## Lección 15. Comprobar que se entendió

Respondé sin mirar el código y después confirmá en el archivo. Para las dos últimas, usá la API en marcha.

1. ¿Dónde están las filas y en qué archivo están las rutas?
2. ¿Qué devuelve `GET /api/words` cuando la tabla no tiene filas?
3. ¿Qué tienen en común `volumen` y `Volumen` después de dos `POST`, y qué cambia en el texto guardado?
4. ¿Qué estado HTTP y qué cuerpo vuelve si el texto, ya limpio, queda vacío?
5. ¿En qué momento se avisa por Socket.IO?
6. ¿Qué devuelve `listWords` a la pantalla?
7. Si guardás `words.js` con `npm run dev` corriendo, ¿siguen las palabras? ¿Dónde están?
8. ¿La nube de http://127.0.0.1:5173 muestra la palabra que mandaste con `curl`?

Respuestas: 1, las filas están en PostgreSQL y las consultas en `words.js`. Las rutas están en `server.js`. 2, `{ "words": [] }`. 3, comparten `id` y el contador queda en 2; el texto guardado pasa a ser el del último envío, `Volumen`. 4, 400 y `{ "error": "Escribí una palabra." }`. 5, después de un `POST` que `addWord` aceptó, y también, solo hacia el cliente nuevo, cuando alguien se conecta por Socket.IO. 6, `listWords` arma objetos nuevos a partir de las filas, para la respuesta HTTP. 7, sí siguen: `--watch` crea un proceso nuevo y ese proceso lee la tabla. Las filas están en el volumen de PostgreSQL. 8, sí, si la pantalla está abierta o se abre después y la API puede leer la base: el evento `words` le entrega esas filas.
