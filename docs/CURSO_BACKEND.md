# Curso: cómo funciona la API

Este texto explica la carpeta `backend/` para alguien que ya leyó [el curso del frontend](CURSO_FRONTEND.md). Se puede leer de arriba hacia abajo. Cada lección usa solo lo que ya se explicó antes.

Al terminar vas a poder señalar un archivo y decir qué hace, y vas a poder seguir una palabra desde el `curl` hasta el arreglo que la guarda.

La pantalla ya llama a esta API. Muestra una copia de la lista y, cuando alguien envía, hace un `POST`. La lista que manda vive en la memoria del proceso de Node. Si ese proceso se detiene, la lista desaparece y la pantalla lo avisa. La base de datos llega otro día.

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
| Esta API | En Node | 4000 | El arreglo que manda |

Un puerto es un número que distingue un programa de otro en la misma computadora. El 5173 y el 4000 pueden estar abiertos al mismo tiempo. El 4000 se eligió porque el 3000 ya lo usa otro proyecto de esta máquina.

La pantalla habla con esta API por HTTP y por Socket.IO. `curl` sigue sirviendo para hacer el mismo pedido desde la terminal.

## Lección 2. Cuatro ideas de este servidor

No hace falta saber todo Node. Este servidor usa cuatro ideas.

### Proceso

Un proceso es un programa en ejecución. `npm run dev` crea el proceso de la API. El arreglo de palabras está dentro de ese proceso. No está en un archivo. Cuando el proceso termina, el arreglo se va con él.

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
4. Esa función lee el arreglo y lo convierte en JSON.
5. `curl` imprime esa respuesta en la terminal.

```text
curl
    └── HTTP, puerto 4000
            └── server.js          Express elige la ruta
                    └── words.js   el arreglo en memoria
```

`127.0.0.1` significa esta misma computadora. El servidor está atado a esa dirección: otro equipo de la red no llega a este puerto.

Un `POST` hace el mismo camino y, además, modifica el arreglo antes de responder.

## Lección 4. Mapa de la carpeta

```text
backend/
├── package.json         nombre del proyecto, comandos y librerías
├── package-lock.json    versiones exactas instaladas
└── src/
    ├── server.js        HTTP, Express y Socket.IO
    └── words.js         arreglo de palabras y reglas para agregar
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

`node --watch` mira `server.js` y los archivos que ese archivo importa. Si guardás `words.js`, Node mata el proceso y lo crea de nuevo. El arreglo empieza otra vez en vacío. Es el mismo efecto que apretar Ctrl+C y volver a correr el comando.

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

## Lección 7. `words.js`, la memoria

Todo el archivo trabaja sobre un solo arreglo:

```js
const words = []
```

Esa variable no se exporta. Desde `server.js` solo se puede usar `listWords` y `addWord`. El arreglo queda escondido en este archivo.

Cada elemento tiene la misma forma que en la pantalla:

```js
{ id: "un-id-único", text: "volumen", count: 1 }
```

`id` identifica esa entrada. `text` es lo que se escribió. `count` es cuántas veces se aceptó.

### Leer una copia

```js
export function listWords() {
  return words.map((word) => ({ ...word }))
}
```

`map` recorre el arreglo y arma otro. `{ ...word }` copia las tres propiedades en un objeto nuevo. Quien recibe la lista puede modificar su copia sin tocar el arreglo interno.

### La misma palabra, sin mirar mayúsculas

```js
function sameWord(left, right) {
  return left.toLocaleLowerCase('es') === right.toLocaleLowerCase('es')
}
```

`volumen` y `Volumen` cuentan como la misma. `'es'` pide las reglas de minúsculas del español. La pantalla tiene esta misma función en `App.jsx`. Hoy las dos listas están separadas, así que cada una aplica la regla en su propia memoria.

### Agregar

`addWord` recibe el texto crudo y devuelve un resultado. Hay dos formas:

```js
{ ok: false, error: 'Escribí una palabra.' }
{ ok: true, words: [ /* la lista completa */ ] }
```

Los pasos, en orden:

1. Si el valor no es un string, rechaza. Un pedido sin `text`, o con un número, cae acá.
2. Limpia el texto. `trim()` saca espacios de las puntas. `replace(/\s+/g, ' ')` convierte una racha de espacios en un solo espacio. `  volumen   ` queda en `volumen`.
3. Si después de limpiar no queda nada, rechaza con «Escribí una palabra.»
4. Si el texto mide más de 32 caracteres, rechaza con «La palabra puede tener hasta 32 caracteres.» El campo de la pantalla ya tiene `maxLength={32}`. El servidor repite el límite porque un `curl` puede saltarse el campo.
5. Busca una entrada existente con `sameWord`.
6. Si la encuentra, suma 1 a `count` y reemplaza `text` por el envío nuevo. El último envío define las mayúsculas que quedan guardadas. El `id` no cambia.
7. Si no la encuentra, agrega `{ id, text, count: 1 }`. `crypto.randomUUID()` genera el `id`. Node lo trae incorporado.

`find` devuelve el objeto que está dentro del arreglo, no una copia. Por eso `existing.count += 1` modifica la memoria de verdad. `listWords`, en cambio, entrega copias.

## Lección 8. Las dos rutas

### `GET /api/words`

```js
app.get('/api/words', (_request, response) => {
  response.json({ words: listWords() })
})
```

No usa el pedido. El guion bajo del nombre `_request` marca eso. `response.json` convierte el objeto a JSON, pone el estado 200 y cierra la respuesta.

Con la lista vacía, el cuerpo es:

```json
{"words":[]}
```

### `POST /api/words`

```js
app.post('/api/words', (request, response) => {
  const result = addWord(request.body?.text)

  if (!result.ok) {
    response.status(400).json({ error: result.error })
    return
  }

  publish()
  response.json({ words: result.words })
})
```

`request.body?.text` lee `text` solo si `body` existe. Si el cuerpo no es JSON, `body` puede faltar y la expresión vale `undefined`. `addWord` lo rechaza.

Si `ok` es falso, la respuesta es 400 y el cuerpo es `{ "error": "..." }`. El `return` evita seguir. En ese caso no se llama a `publish`: un pedido rechazado no avisa a nadie, porque la lista no cambió.

Si `ok` es verdadero, primero avisa por Socket.IO y después responde 200 con la lista completa, no solo con la palabra nueva.

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

function publish() {
  io.emit('words', listWords())
}

io.on('connection', (socket) => {
  socket.emit('words', listWords())
})
```

`io` es el conjunto de clientes conectados. `socket` es uno de ellos.

| Llamada | A quién le habla |
| --- | --- |
| `socket.emit('words', lista)` | Solo al cliente que acaba de conectarse |
| `io.emit('words', lista)` | A todos los que estén conectados en ese momento |

El nombre del aviso es `words`. El dato es la lista completa. Quien se conecta tarde recibe lo que ya estaba guardado, sin esperar a que alguien envíe otra palabra.

`publish` se llama únicamente desde el `POST` exitoso. El `GET` no emite nada: mirar la lista no es un cambio.

CORS se configura otra vez acá porque la conexión de Socket.IO también la abre el navegador, y también cruza del puerto 5173 al 4000.

## Lección 10. Un recorrido completo

El servidor está recién iniciado. Alguien manda `volumen` y después `Volumen`.

1. El arreglo `words` es `[]`.
2. `GET /api/words` responde `{ "words": [] }`.
3. Llega `POST` con `{ "text": "volumen" }`. `addWord` limpia el texto, no encuentra una igual y agrega una entrada nueva. `count` queda en 1. Se genera un `id`.
4. `publish` emite `words` con esa lista de un elemento. Si nadie está conectado, el aviso no tiene destinatarios y el `POST` igual responde.
5. La respuesta HTTP es 200 y trae la misma lista.
6. Llega `POST` con `{ "text": "Volumen" }`. `sameWord` encuentra la entrada anterior. `count` pasa a 2. `text` pasa a `Volumen`. El `id` sigue igual.
7. `publish` emite la lista actualizada. La respuesta HTTP también la trae.

Un tercer pedido con `{ "text": "   " }` no entra al arreglo. La respuesta es 400 y el texto del error es «Escribí una palabra.» Los clientes conectados no reciben un aviso nuevo.

## Lección 11. Qué se pierde al detener el proceso

La lista está en la variable `words` del proceso que imprimió `API en http://127.0.0.1:4000`.

Se vacía en cualquiera de estos casos:

- Ctrl+C en esa terminal y volver a ejecutar `npm run dev`.
- Guardar `server.js` o `words.js` mientras corre `npm run dev`, porque `--watch` crea un proceso nuevo.
- Cerrar la terminal donde corre el servidor.

Para verlo: enviá una palabra, detenés el proceso, lo volvés a levantar y hacés `GET /api/words`. La respuesta es `{ "words": [] }`. La palabra anterior no está en un archivo que se pueda volver a abrir.

Ese límite es intencional. Muestra que la memoria del proceso no sobrevive al proceso. El día de la base de datos, la misma prueba tiene que encontrar la palabra después del reinicio.

Al abrir de nuevo la pantalla, con la API en marcha, el evento `words` vuelve a traer la lista. Si la API está detenida, la pantalla muestra que el servidor no responde y no puede incorporar palabras nuevas.

## Lección 12. Cómo se entera la pantalla

`frontend/src/App.jsx` hace dos cosas con `http://127.0.0.1:4000`.

Al montar la pantalla, abre Socket.IO. El servidor le manda la lista actual en el evento `words`. Cada vez que alguien envía una palabra, ese evento vuelve a llegar, también a las otras pestañas. `App` reemplaza su copia y `WordCloud` dibuja la lista nueva sin recargar.

Al apretar Enviar, después de rechazar el texto vacío, hace `POST /api/words` con `{ "text": "..." }`. Si la respuesta trae la lista, la nube se actualiza enseguida. El evento `words` trae la misma lista a las demás pestañas.

Si `fetch` no logra hablar con el puerto 4000, o el socket se corta, el párrafo rojo dice: «El servidor no responde. La API tiene que estar en marcha en el puerto 4000.» «Escribí una palabra.» sigue siendo el mensaje del campo vacío. Son dos textos distintos.

Siguen afuera de este paso: PostgreSQL, Docker, el Dockerfile y Compose.

## Lección 13. Glosario

| Palabra | Significado en este proyecto |
| --- | --- |
| Proceso | El programa de Node mientras está en ejecución. La lista vive ahí |
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

## Lección 14. Comprobar que se entendió

Respondé sin mirar el código y después confirmá en el archivo. Para las dos últimas, usá la API en marcha.

1. ¿En qué archivo está el arreglo y en cuál están las rutas?
2. ¿Qué devuelve `GET /api/words` cuando nadie envió nada desde el último arranque?
3. ¿Qué tienen en común `volumen` y `Volumen` después de dos `POST`, y qué cambia en el texto guardado?
4. ¿Qué estado HTTP y qué cuerpo vuelve si el texto, ya limpio, queda vacío?
5. ¿En qué momento se llama a `publish`?
6. ¿Por qué `listWords` copia cada objeto en vez de devolver el arreglo interno?
7. Si guardás `words.js` con `npm run dev` corriendo, ¿siguen las palabras? ¿Por qué?
8. ¿La nube de http://127.0.0.1:5173 muestra la palabra que mandaste con `curl`?

Respuestas: 1, el arreglo está en `words.js` y las rutas en `server.js`. 2, `{ "words": [] }`. 3, comparten `id` y el contador queda en 2; el texto guardado pasa a ser el del último envío, `Volumen`. 4, 400 y `{ "error": "Escribí una palabra." }`. 5, después de un `POST` que `addWord` aceptó, y también, solo hacia el cliente nuevo, cuando alguien se conecta por Socket.IO. 6, para que la respuesta no sea el mismo arreglo que el servidor va a seguir modificando. 7, no siguen: `--watch` crea un proceso nuevo y el arreglo nace vacío. 8, sí, si la pantalla está abierta o se abre después: el evento `words` le entrega la lista del proceso.
