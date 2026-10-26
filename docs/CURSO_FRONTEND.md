# Curso: cómo funciona el frontend

Este texto explica la carpeta `frontend/` para alguien que abre el proyecto por primera vez. Se puede leer de arriba hacia abajo. Cada lección usa solo lo que ya se explicó antes.

Al terminar vas a poder señalar un archivo y decir qué hace, y vas a poder seguir una palabra desde el teclado hasta el lugar donde aparece en la nube.

La pantalla habla con la API del puerto 4000. La lista que se dibuja vive en esta pestaña, y la lista que manda vive en el proceso de Node. Si recargás la página con la API en marcha, las palabras vuelven. Si la API está detenida, aparece un mensaje y la nube no puede guardar nada nuevo. Cómo se dibuja la nube no cambia: [el curso de la API](CURSO_BACKEND.md) explica quién guarda la lista.

Para leerlo con el código al lado:

```bash
cd frontend
npm install
npm run dev
```

Abrí http://127.0.0.1:5173 y dejá abierta la carpeta `frontend/src/`.

## Lección 1. Qué es el frontend

El frontend es la parte del programa que corre en el navegador. En este proyecto es la pregunta, el campo de texto, el botón Enviar y la nube de palabras.

El navegador solo entiende tres lenguajes:

| Lenguaje | Qué describe | En este proyecto |
| --- | --- | --- |
| HTML | La estructura: un título, un campo, un botón | Casi todo lo genera React. El HTML inicial está en `index.html` |
| CSS | El aspecto: colores, tamaños, animación | `src/index.css`, más algunas clases de Tailwind |
| JavaScript | El comportamiento: guardar la palabra y volver a dibujar | Los archivos `.jsx` y `placeInCloud.js` |

React es una biblioteca de JavaScript. Permite describir la pantalla como funciones. Vite es el programa que toma esos archivos y se los entrega al navegador mientras desarrollás.

## Lección 2. Las cuatro ideas de React que usa esta pantalla

No hace falta saber todo React. Esta pantalla usa cuatro ideas.

### Componente

Un componente es una función que devuelve un trozo de pantalla. `App`, `WordCloud` y `CloudBackground` son componentes. El nombre empieza con mayúscula para que React lo distinga de una etiqueta HTML como `div` o `button`.

### JSX

Dentro de la función hay algo que parece HTML:

```jsx
<button className="ok" type="submit">
  Enviar
</button>
```

Eso se llama JSX. Vite lo traduce a llamadas de JavaScript antes de que el navegador lo ejecute. En JSX el atributo de clase se escribe `className`, porque `class` ya significa otra cosa en JavaScript.

### Props

Una prop es un dato que un componente le pasa a otro. `App` le pasa la lista a la nube así:

```jsx
<WordCloud words={words} />
```

`WordCloud` la recibe como argumento:

```jsx
export default function WordCloud({ words }) {
```

`WordCloud` muestra esas palabras. No las crea ni las borra.

### Estado

El estado es la memoria de la pantalla mientras la pestaña sigue abierta. Se declara con `useState`:

```jsx
const [draft, setDraft] = useState('')
```

Esa línea crea dos cosas:

- `draft`: el valor actual. Empieza como un texto vacío.
- `setDraft`: la función que cambia ese valor.

Cuando llamás a `setDraft('hola')`, React vuelve a ejecutar el componente y dibuja la pantalla con el texto nuevo. Si modificaras `draft` con un `=` común, React no se enteraría y la pantalla quedaría vieja.

## Lección 3. El camino desde el navegador hasta la nube

Cuando abrís http://127.0.0.1:5173 ocurre esto, en orden:

1. El navegador pide `frontend/index.html`.
2. Ese archivo tiene un recuadro vacío, `<div id="root">`, y carga `src/main.jsx`.
3. `main.jsx` busca ese recuadro, carga los estilos y le pide a React que dibuje `App`.
4. `App` dibuja la pregunta, el formulario y, al principio, una lista de palabras vacía.
5. `App` le pasa esa lista a `WordCloud`.
6. `WordCloud` le pide a `placeInCloud` las posiciones y dibuja cada palabra encima de `CloudBackground`.

```text
index.html
    └── main.jsx              arranca React y carga index.css
            └── App.jsx       pregunta, formulario y lista de palabras
                    └── WordCloud.jsx
                            ├── placeInCloud.js       posiciones y tamaños
                            └── CloudBackground.jsx   dibujo de la nube
```

A partir de ahí, cada tecla o cada envío repite los pasos 4, 5 y 6 con datos nuevos. El navegador no vuelve a pedir `index.html`.

## Lección 4. Mapa de la carpeta

```text
frontend/
├── index.html              página que recibe el navegador
├── package.json            nombre del proyecto, comandos y librerías
├── package-lock.json       versiones exactas instaladas
├── vite.config.js          plugins de Vite
├── .oxlintrc.json          reglas del revisor de código
├── .gitignore              archivos que Git no debe subir
├── README.md               cómo abrir la pantalla
├── public/
│   ├── favicon.svg         ícono de la pestaña
│   └── icons.svg           íconos de la plantilla de Vite; la pantalla no los usa
└── src/
    ├── main.jsx            punto de entrada
    ├── App.jsx             pantalla, formulario y la lista que llega de la API
    ├── WordCloud.jsx       nube visible y lista para lectores de pantalla
    ├── placeInCloud.js     cálculo de tamaño y posición
    ├── CloudBackground.jsx silueta verde
    └── index.css           colores, forma de la ventana y animación
```

`node_modules/` aparece después de `npm install`. Ahí están React, Vite y el resto de las librerías. No se edita y no se sube a Git.

## Lección 5. `index.html`, la página vacía

```html
<div id="root"></div>
<script type="module" src="/src/main.jsx"></script>
```

El `div` es el hueco donde React va a meter toda la interfaz. El `script` arranca el programa. `type="module"` permite usar `import` dentro de los archivos de `src/`.

El resto del archivo declara el idioma español, el título de la pestaña («Lluvia de palabras»), el ícono y que el ancho se adapte al celular.

## Lección 6. `main.jsx`, el arranque

El archivo completo hace cuatro cosas:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

1. Importa `StrictMode` desde React.
2. Importa `createRoot`, que conecta React con un elemento del HTML.
3. Importa `index.css`. Esa línea, sin usarla después, alcanza para que Vite incluya los estilos.
4. Importa el componente `App` y lo dibuja dentro de `#root`.

`document.getElementById('root')` es JavaScript del navegador: busca el elemento cuyo `id` es `root`.

`StrictMode` es una ayuda de desarrollo. React ejecuta algunas funciones dos veces para detectar errores. En la pantalla que ve quien usa el sitio, el resultado es el mismo.

## Lección 7. `App.jsx`, la pantalla

`App` es la pantalla entera. Guarda la pregunta, lo que la persona está escribiendo y la copia de la lista que va a dibujar. Esa copia llega de la API. La comparación de mayúsculas y el contador viven en `backend/src/words.js`.

### La pregunta

```jsx
const QUESTION = 'Definí Docker en una sola palabra.'
```

Está fija en el código. La pantalla todavía no deja cambiarla.

### La dirección de la API

```jsx
const API_URL = 'http://127.0.0.1:4000'
```

El formulario manda las palabras ahí. Socket.IO se conecta a la misma dirección para recibir la lista.

### Los datos que recuerda la pestaña

```jsx
const [draft, setDraft] = useState('')
const [error, setError] = useState('')
const [notice, setNotice] = useState('Todavía no hay palabras.')
const [words, setWords] = useState([])
const [serverDown, setServerDown] = useState(false)
const [sending, setSending] = useState(false)
```

| Dato | Qué guarda | Valor inicial |
| --- | --- | --- |
| `draft` | El texto del campo, letra por letra | `''` |
| `error` | El mensaje rojo si el envío no sirve | `''` |
| `notice` | Un aviso que leen los lectores de pantalla | «Todavía no hay palabras.» |
| `words` | La copia de la lista que alimenta la nube | `[]` |
| `serverDown` | Si el puerto 4000 no responde | `false` |
| `sending` | Si el envío todavía no volvió | `false` |

Cada palabra de esa lista tiene esta forma:

```js
{ id: "un-id-único", text: "Contenedor", count: 3 }
```

`id` no se ve. Sirve para que React sepa cuál palabra es cuál cuando la lista cambia. `text` es lo que se escribió. `count` es cuántas veces se envió.

### El campo está controlado

El input no guarda el texto por su cuenta. Su valor es siempre `draft`:

```jsx
<input
  value={draft}
  onChange={(event) => {
    setDraft(event.target.value)
    if (error) setError('')
  }}
/>
```

Cada tecla llama a `onChange`. `event.target.value` es el texto completo del campo en ese momento, no solo la tecla nueva. Si había un error, se borra al volver a escribir.

`maxLength={32}` impide pasar de 32 caracteres. `autoComplete="off"` y `spellCheck={false}` le piden al navegador que no sugiera ni subraye la palabra.

### Qué se dibuja

El `return` de `App` arma, de arriba hacia abajo:

1. El fondo (`.desktop`) y la ventana centrada (`.window`).
2. Tres círculos en la barra superior. Son decoración: no cierran ni minimizan. `aria-hidden="true"` le dice al lector de pantalla que los ignore.
3. La pregunta.
4. El formulario: una etiqueta invisible, el campo y el botón Enviar.
5. El párrafo del error.
6. El aviso `notice`, también invisible en la pantalla y audible para un lector de pantalla.
7. `<WordCloud words={words} />`.

Las clases que empiezan con palabras cortas (`flex`, `min-h-dvh`, `sm:flex-row`) vienen de Tailwind. Las clases con nombre propio (`.window`, `.field`, `.ok`) están definidas en `index.css`. Las dos conviven en el mismo elemento.

## Lección 8. Qué pasa al apretar Enviar

Seguí el ejemplo con la palabra `Contenedor`. La API tiene que estar en marcha.

### Paso 1. El formulario no recarga la página

```jsx
function onSubmit(event) {
  event.preventDefault()
```

Sin esa línea, el navegador enviaría el formulario y recargaría todo.

### Paso 2. Se limpia el texto

```jsx
const text = draft.trim().replace(/\s+/g, ' ')
```

`trim()` saca espacios al principio y al final. `replace(/\s+/g, ' ')` reemplaza cualquier racha de espacios o saltos de línea por un solo espacio. `  contenedor   ` queda en `contenedor`.

### Paso 3. El vacío se rechaza en la pantalla

```jsx
if (!text) {
  setError('Escribí una palabra.')
  return
}
```

Si después de limpiar no queda nada, se muestra el error y la función termina. Ese pedido no sale de la pestaña. El servidor repite la misma regla por si el texto llega por `curl`.

El párrafo del error tiene `id="error-palabra"`. El campo, cuando hay error, apunta a ese párrafo con `aria-describedby` y se marca `aria-invalid`.

### Paso 4. El texto viaja a la API

```jsx
const response = await fetch(`${API_URL}/api/words`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ text }),
})
```

`fetch` hace el `POST`. El cuerpo es JSON con la propiedad `text`. Mientras espera, `sending` es verdadero y el botón queda deshabilitado.

Si la respuesta no es 200, el párrafo muestra `error` del servidor, por ejemplo el límite de 32 caracteres. El campo no se vacía.

Si el puerto 4000 no contesta, `fetch` lanza un error. `serverDown` pasa a verdadero y el párrafo muestra: «El servidor no responde. La API tiene que estar en marcha en el puerto 4000.» La palabra escrita sigue en el campo.

### Paso 5. La lista vuelve y se vacía el campo

Si el `POST` se aceptó, se borra el error, se vacía el campo y `words` pasa a ser `body.words`, la lista completa que devolvió la API. El aviso para el lector de pantalla dice cuántas veces va la palabra que cambió.

Esa misma lista también llega por Socket.IO, en el evento `words`. Al abrir la página, el evento trae lo que ya estaba guardado. Cuando otra pestaña envía una palabra, este evento actualiza la nube sin recargar.

### Paso 6. React vuelve a dibujar

`words` cambió, así que `App` se ejecuta otra vez y le pasa la lista nueva a `WordCloud`. Ahí empieza la lección siguiente. La nube no sabe si la lista salió de esta pestaña o de otra.

## Lección 9. `WordCloud.jsx`, de la lista al dibujo

`WordCloud` recibe `words` y hace tres trabajos: medir el recuadro, calcular posiciones y pintar.

### Medir el recuadro

```jsx
const stageRef = useRef(null)
const [aspect, setAspect] = useState(1.8)
```

`useRef` guarda un puntero al `div` real de la nube. No provoca un redibujado cuando cambia. `aspect` es el ancho dividido el alto. Empieza en `1.8` hasta que se mide de verdad.

```jsx
useLayoutEffect(() => {
  const node = stageRef.current
  if (!node) return

  const update = () => {
    const next = node.clientWidth / Math.max(node.clientHeight, 1)
    setAspect((current) =>
      Math.abs(current - next) < 0.02 ? current : next,
    )
  }

  update()
  const observer = new ResizeObserver(update)
  observer.observe(node)
  return () => observer.disconnect()
}, [])
```

`useLayoutEffect` corre después de armar el HTML y antes de que el navegador lo muestre. Así la primera medición llega a tiempo.

`update` calcula la proporción. `Math.max(..., 1)` evita dividir por cero si el alto todavía es 0. Si la proporción nueva difiere de la actual en menos de `0.02`, se conserva la anterior. Eso evita recalcular la nube por un cambio de un píxel.

`ResizeObserver` llama a `update` cada vez que el recuadro cambia de tamaño, por ejemplo al rotar el celular o achicar la ventana. La función que devuelve el efecto (`return () => observer.disconnect()`) se ejecuta cuando el componente se deja de mostrar, y suelta al observador.

El `[]` final significa: instalá este efecto una sola vez, al aparecer el componente.

### Calcular y recordar

```jsx
const visibleWords = useMemo(
  () => placeInCloud(words, aspect),
  [words, aspect],
)
```

`useMemo` guarda el resultado de `placeInCloud`. Vuelve a llamarla solo si cambió `words` o `aspect`. Cada palabra que devuelve trae, además del texto y el contador, `x`, `y` y `size`.

### Dos representaciones de la misma lista

La nube visual es difícil de leer para un lector de pantalla: las palabras no están en orden de lectura y el tamaño es un dato visual. Por eso el componente pinta la lista dos veces.

La primera es una lista común, invisible en la pantalla (`sr-only`), con el texto y la cantidad:

```jsx
<ul className="sr-only" aria-label="Palabras de la nube">
  {visibleWords.map((word) => (
    <li key={word.id}>
      {word.text}, {word.count} {times}
    </li>
  ))}
</ul>
```

`key={word.id}` le dice a React cuál `li` corresponde a cuál palabra. Tiene que ser estable. Por eso el `id` se creó al enviar y no cambia cuando sube el contador.

La segunda es el dibujo. Lleva `aria-hidden="true"` para no repetir en voz lo que la lista ya dijo:

```jsx
<div className="stage" ref={stageRef}>
  <CloudBackground />
  <div className="cloud-float" aria-hidden="true">
    {visibleWords.map((word) => (
      <span
        key={word.id}
        className="cloud-anchor"
        style={{ '--x': `${word.x}%`, '--y': `${word.y}%` }}
      >
        <span className="cloud-word" style={{ '--size': word.size }}>
          {word.text}
        </span>
      </span>
    ))}
  </div>
</div>
```

`ref={stageRef}` conecta este `div` con la medición de la proporción.

`--x`, `--y` y `--size` son variables de CSS. El estilo de `.cloud-anchor` las usa para poner cada palabra en su porcentaje. `.cloud-word` las usa para el tamaño de la letra. El cálculo de esos números está en el archivo siguiente.

## Lección 10. `placeInCloud.js`, dónde se sienta cada palabra

Este archivo no conoce el HTML. Recibe la lista y la proporción del recuadro. Devuelve la misma lista con tamaño y coordenadas.

La función pública es la última:

```js
export default function placeInCloud(words, aspect) {
  if (words.length === 0) return []
  return packTokens(buildTokens(words), aspect)
}
```

Si no hay palabras, devuelve una lista vacía y la nube queda solo con la silueta. Si hay, primero calcula tamaños (`buildTokens`) y después las ubica (`packTokens`).

### Paso 1. El tamaño depende de las repeticiones

```js
function buildTokens(words) {
  const ranked = [...words].sort(
    (left, right) =>
      right.count - left.count ||
      left.text.localeCompare(right.text, 'es'),
  )
  const maxCount = ranked[0].count

  return ranked.map((word) => ({
    id: word.id,
    text: word.text,
    count: word.count,
    size: Math.round(15 + 16 * (word.count / maxCount)),
  }))
}
```

`[...words]` copia la lista antes de ordenarla. Ordenar la original cambiaría el estado de `App`.

El orden es: más repetida primero. Si empatan, orden alfabético en español.

`maxCount` es el contador de la más dicha. El tamaño sale de esta cuenta:

```text
tamaño = redondear(15 + 16 × contador / máximo)
```

El resultado queda entre 15 y 31.

Ejemplo. Alguien envió `imagen` dos veces, `contenedor` una y `volumen` una:

| Palabra | Contador | Cuenta | Tamaño |
| --- | --- | --- | --- |
| imagen | 2 | 15 + 16 × 2/2 | 31 |
| contenedor | 1 | 15 + 16 × 1/2 | 23 |
| volumen | 1 | 15 + 16 × 1/2 | 23 |

Si todas fueron dichas una vez, todas quedan en 31. El tamaño compara contra la más repetida de esta nube, no contra un máximo fijo del curso.

### Paso 2. Una grilla de puntos dentro de la silueta

`makeCandidates` se ejecuta una sola vez, cuando el archivo se carga. Arma puntos cada 12 unidades, con `x` entre -340 y 340 e `y` entre -205 y 175.

Un punto entra a la lista si cae dentro de la nube. La nube, para este cálculo, es una elipse central más cinco óvalos que imitan los lóbulos del dibujo:

```js
const body = (x / 300) ** 2 + (y / 145) ** 2 <= 1
```

Esa fórmula es la de una elipse: un punto está adentro cuando el resultado es menor o igual a 1. Cada lóbulo usa la misma idea, con su propio centro (`cx`, `cy`) y sus propios radios (`rx`, `ry`).

Después los puntos se ordenan desde el centro hacia afuera:

```js
points.sort((a, b) => a.x ** 2 + a.y ** 2 - (b.x ** 2 + b.y ** 2))
```

`x² + y²` es la distancia al centro, sin la raíz cuadrada. Para ordenar alcanza con comparar ese número. La lista queda en `CANDIDATES` y se reutiliza en cada envío.

### Paso 3. La más grande va primera

```js
function orderFromCenter(tokens) {
  const ordered = [...tokens]
  let biggest = 0

  ordered.forEach((token, index) => {
    if (token.size > ordered[biggest].size) biggest = index
  })

  const [center] = ordered.splice(biggest, 1)
  return [center, ...ordered]
}
```

Saca de la lista la de mayor `size` y la pone al frente. El resto conserva el orden anterior. Con el orden que arma `buildTokens`, la primera palabra ya es una de las más grandes: a igual tamaño, la comparación usa `>` y se queda con la que ya estaba adelante, que es la primera en orden alfabético entre las más repetidas. La función sigue siendo la que decide el centro por si más adelante la lista llegara en otro orden.

### Paso 4. Cada palabra ocupa un rectángulo

```js
function tokenBox(token, shrink, aspect) {
  const size = token.size * shrink

  return {
    size,
    w: Math.max(size, token.text.length * size * 0.62),
    h: size * 1.15 * aspect,
  }
}
```

`shrink` vale 1 en el primer intento. Si las palabras no entran, los intentos siguientes lo bajan y todo el rectángulo se achica.

`w` es el ancho estimado. Como mínimo es el tamaño de una letra. Si el texto es largo, se estima en `cantidad de letras × tamaño × 0.62`. `h` es el alto. Se multiplica por `aspect` porque el recuadro de la pantalla no es cuadrado: un mismo número en vertical y en horizontal no representa la misma distancia visual.

### Paso 5. Buscar un lugar que no pise a otra

```js
function overlaps(current, other, aspect) {
  return (
    Math.abs(current.x - other.x) < (current.w + other.w) / 2 + 10 &&
    Math.abs(current.y - other.y) < (current.h + other.h) / 2 + 8 * aspect
  )
}
```

Dos rectángulos se pisan cuando están demasiado cerca en horizontal y también en vertical. El `+ 10` y el `+ 8 * aspect` agregan un margen para que las palabras no queden pegadas.

`layoutTokens` recorre las palabras en el orden del paso 3. Para cada una prueba los puntos de `CANDIDATES`, del centro hacia afuera, y se queda con el primero cuyo rectángulo no pisa a las que ya se ubicaron. Si una palabra no encuentra ningún punto, la función devuelve `null`: ese intento falló.

### Paso 6. Achicar y reintentar

```js
let shrink = 1
let placed = null

for (let attempt = 0; attempt < 16 && !placed; attempt += 1) {
  placed = layoutTokens(tokens, shrink, aspect)
  shrink *= 0.82
}
```

Hay hasta 16 intentos. Cada uno multiplica los tamaños por 0,82. El primero prueba al tamaño completo. Si `layoutTokens` devuelve la lista ubicada, el `&& !placed` corta el ciclo.

### Paso 7. Si igual no entran

```js
return toStage(placed ?? forceTokens(tokens, shrink, aspect))
```

`??` usa el lado derecho solo cuando `placed` quedó en `null`. `forceTokens` reparte las palabras por la grilla aunque se superpongan: salta de punto en punto con un paso parejo. La nube muestra todas las palabras aunque el acomodo prolijo no haya alcanzado.

### Paso 8. Pasar a porcentajes de la pantalla

Hasta acá `x` e `y` son coordenadas de la grilla, con el cero en el centro de la silueta. La pantalla necesita porcentajes, donde 50 es el centro del recuadro.

`toStage` hace esto:

1. Mira el borde izquierdo, derecho, superior e inferior de todas las palabras ya ubicadas.
2. Calcula el centro de ese grupo.
3. Elige una escala para que el grupo entre en el recuadro: como máximo un 86 % del ancho y un 78 % del alto.
4. Convierte cada palabra:

```js
x: 50 + (word.x - centerX) * scale,
y: 50 + (word.y - centerY) * scale,
size: word.size * scale,
```

Esos tres números son los que `WordCloud` escribe en `--x`, `--y` y `--size`.

## Lección 11. `CloudBackground.jsx`, la silueta

Este componente siempre dibuja lo mismo. No recibe palabras.

Usa SVG, un formato de dibujo que se define con números. Se ve nítido en un celular y en un monitor grande. `viewBox="0 0 600 340"` es el sistema de coordenadas interno del dibujo. `preserveAspectRatio="xMidYMid meet"` lo centra y lo encaja entero dentro del recuadro.

Hay tres capas del mismo contorno, dibujadas con `<path>`:

1. Un relleno verde desenfado (`feGaussianBlur`). Hace el resplandor.
2. El cuerpo, con un degradado de menta claro a verde oscuro y un borde.
3. Una línea clara en la parte de arriba, con poca opacidad. Simula un brillo.

`aria-hidden="true"` y `focusable="false"` marcan el dibujo como decorativo: no se anuncia y no recibe foco del teclado.

La forma que se ve y la forma que usa `placeInCloud` para aceptar puntos son parientes, no la misma ecuación. La grilla imita la silueta con una elipse y cinco óvalos. El SVG describe el contorno con curvas. Por eso una palabra puede quedar cerca del borde del dibujo y, alguna vez, un poco afuera de un lóbulo. El paso de `toStage` las vuelve a centrar como grupo dentro del recuadro.

## Lección 12. `index.css`, cómo se ve

La primera línea activa Tailwind:

```css
@import "tailwindcss";
```

Tailwind ofrece clases cortas que se escriben en el JSX. En `App` se usan estas:

| Clase | Efecto |
| --- | --- |
| `flex` | Pone los hijos en fila o en columna |
| `flex-col` | Columna |
| `sm:flex-row` | En pantallas de 640 px o más, el campo y el botón quedan en fila |
| `min-h-dvh` | Alto mínimo igual al de la pantalla visible |
| `items-center` | Centra en el eje cruzado |
| `justify-center` | Centra en el eje principal |
| `sm:flex-1` | En pantallas anchas, el campo ocupa el espacio libre |
| `sr-only` | Deja el elemento solo para lectores de pantalla |

El resto del archivo son las clases propias del proyecto.

### La página y la ventana

`.desktop` pinta el fondo verde oscuro, con dos luces suaves arriba y a un costado.

`.window` es la tarjeta: ancho máximo de 1000 px, borde redondeado, sombra y un fondo casi opaco. `backdrop-filter: blur(18px)` desenfoca lo que hubiera detrás.

`.titlebar` y `.title-button` son los tres puntos de arriba. `.mark-min`, `.mark-max` y `.mark-close` están en `display: none`: los círculos se ven, las marcas internas no.

`.panel` es el interior, con separación de 22 px entre la pregunta, el formulario y la nube.

### La pregunta, el campo y el botón

`.question` usa `clamp(25px, 4vw, 36px)`. El tamaño crece con el ancho de la ventana, sin bajar de 25 px ni pasar de 36 px.

`.field` es el input: fondo oscuro, borde verde y, al enfocarlo, un anillo suave.

`.ok` es el botón. El degradado va de menta claro a menta más intenso. Al pasar el mouse sube 1 px. Al apretarlo se achica un poco. `:focus-visible` dibuja un contorno cuando se llega con el teclado.

`.form-error` reserva un renglón bajo el formulario. El color es un rojo claro. Si no hay error, el párrafo sigue ahí, vacío, y el hueco mínimo evita que la nube salte cuando aparece el mensaje.

### El escenario de la nube

`.stage` es el recuadro donde viven el dibujo y las palabras. Su alto es `clamp(350px, 55vh, 530px)`, con un mínimo de 300 px. `vh` es un porcentaje del alto de la ventana.

`container-type: inline-size` convierte ese recuadro en un contenedor de tamaño. Gracias a eso, `1cqw` significa el 1 % del ancho de `.stage`, no de toda la página.

`.cloud-background` y `.cloud-float` ocupan todo el recuadro (`inset: 0` y `inset: 8px`) y se mueven juntas con la animación `float`: 10 px a la derecha y 14 px hacia arriba, en un ciclo de 8 segundos.

`.cloud-anchor` coloca cada palabra:

```css
.cloud-anchor {
  position: absolute;
  left: var(--x);
  top: var(--y);
  transform: translate(-50%, -50%);
}
```

`left` y `top` usan los porcentajes que calculó `placeInCloud`. `translate(-50%, -50%)` corre la palabra la mitad de su propio ancho y de su propio alto, así el centro del texto cae sobre ese punto.

`.cloud-word` define la letra:

```css
.cloud-word {
  font-size: calc(var(--size) * 1cqw);
  white-space: nowrap;
}
```

Si `--size` es 31 y el recuadro mide 500 px de ancho, la letra mide `31 × 5 px = 155 px` solo en la cuenta cruda. En la práctica `toStage` ya multiplicó `size` por una escala menor que 1, así que el número que llega a `--size` es más chico y el texto entra en la silueta. `white-space: nowrap` impide que una frase corta se parta en dos renglones.

Las palabras pares usan otra animación (`word-drift-alt`) y un retardo distinto. Algunas posiciones de la lista cambian el verde del texto. El movimiento de cada palabra es de unos 6 u 8 px, independiente del movimiento de toda la nube.

### Celular y movimiento reducido

Debajo de 600 px de ancho, baja el relleno de la ventana, el botón pasa a ocupar todo el ancho y el recuadro de la nube queda en 390 px de alto.

Si el sistema tiene activada la opción de reducir movimiento, se apagan las animaciones de la nube, de las palabras, del campo y del botón:

```css
@media (prefers-reduced-motion: reduce) {
  .cloud-background,
  .cloud-float,
  .cloud-word,
  .field,
  .ok {
    animation: none;
    transition: none;
  }
}
```

## Lección 13. Los archivos que no se ven en la pantalla

### `package.json`

Describe el proyecto y los comandos:

| Comando | Qué hace |
| --- | --- |
| `npm install` | Descarga las librerías en `node_modules/` |
| `npm run dev` | Levanta Vite para trabajar, con recarga al guardar |
| `npm run build` | Genera el sitio listo para publicar, en `dist/` |
| `npm run preview` | Sirve esa carpeta `dist/` para revisarla |
| `npm run lint` | Revisa el código con oxlint |

En `dependencies` están las librerías que la página usa: React, React DOM, Tailwind y el cliente de Socket.IO. En `devDependencies` están las que solo hacen falta al desarrollar: Vite, el plugin de React, los tipos de TypeScript para el editor y oxlint. El código de `src/` es JavaScript. Esos tipos ayudan al editor a marcar errores, y no cambian lo que se ejecuta.

`"type": "module"` permite `import` y `export` en los archivos del proyecto.

### `package-lock.json`

Anota la versión exacta de cada librería, incluidas las que React y Vite piden por su cuenta. `npm install` en otra máquina reproduce la misma instalación. No se edita a mano.

### `vite.config.js`

```js
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

El plugin `react()` traduce el JSX. El plugin `tailwindcss()` lee `@import "tailwindcss"` y genera el CSS que el navegador entiende. Vite, además, sirve los archivos en el puerto 5173 y vuelve a cargar la página cuando guardás un archivo de `src/`.

### `.oxlintrc.json`

Configura el revisor que corre con `npm run lint`. La regla `react/rules-of-hooks` marca como error un uso incorrecto de `useState`, `useRef`, `useMemo` o `useLayoutEffect`. Esas funciones tienen que llamarse siempre en el mismo orden, en la parte de arriba del componente, fuera de un `if`.

### `.gitignore`

Le dice a Git que ignore `node_modules/`, la carpeta `dist/` y archivos de registro. Esas carpetas se pueden volver a generar.

### `public/`

Lo que está en `public/` se copia tal cual y se puede pedir por su ruta. `/favicon.svg` es el ícono de la pestaña, enlazado desde `index.html`. `icons.svg` vino con la plantilla de Vite. Ningún componente lo importa.

### `README.md` de `frontend/`

Recuerda los comandos para abrir la pantalla. Esa pantalla envía las palabras a la API del puerto 4000.

## Lección 14. Un recorrido completo, ya con todos los archivos

Alguien abre la pestaña, escribe `volumen` y aprieta Enviar. La segunda vez escribe `Volumen`.

1. `index.html` ya está cargado. `main.jsx` ya dibujó `App`. `words` es `[]`.
2. Cada letra de `volumen` actualiza `draft`. La nube no cambia.
3. Enviar llama a `onSubmit`. El texto limpio es `volumen`. El `POST` llega a la API. La API agrega `{ id, text: "volumen", count: 1 }` y devuelve la lista. `draft` vuelve a `''`. `notice` pasa a «Se agregó volumen. Va 1 vez.»
4. `WordCloud` recibe una lista de un elemento. Mide `.stage` y llama a `placeInCloud`.
5. `buildTokens` le da tamaño 31, porque es la única y por lo tanto la máxima.
6. `layoutTokens` la pone en el primer punto libre, el más cercano al centro.
7. `toStage` traduce eso a un porcentaje cerca de 50, 50.
8. El JSX pinta un `<li>` invisible y un `<span>` visible encima de la silueta.
9. Al enviar `Volumen`, la API la reconoce como la misma palabra. El contador pasa a 2. El texto visible pasa a `Volumen`, con la mayúscula del último envío. El `id` sigue siendo el mismo, así que React actualiza esa palabra en lugar de crear otra. Otra pestaña abierta recibe la misma lista por el evento `words`.

## Lección 15. Glosario

| Palabra | Significado en este proyecto |
| --- | --- |
| Componente | Función que devuelve un trozo de pantalla: `App`, `WordCloud`, `CloudBackground` |
| JSX | La sintaxis parecida a HTML dentro de JavaScript |
| Prop | Dato que un componente le entrega a otro. `words` viaja de `App` a `WordCloud` |
| Estado | Dato que React recuerda y que, al cambiar, vuelve a dibujar. `draft`, `error`, `notice`, `words` |
| Hook | Función de React cuyo nombre empieza con `use`: `useState`, `useRef`, `useMemo`, `useLayoutEffect` |
| Render | Volver a ejecutar un componente para describir la pantalla con los datos nuevos |
| Vite | Herramienta que traduce JSX y CSS y sirve la página en desarrollo |
| Tailwind | Conjunto de clases cortas de CSS (`flex`, `sr-only`, `sm:flex-row`) |
| SVG | Dibujo definido con etiquetas y números. Lo usa la silueta |
| Variable CSS | Un valor con nombre, como `--x`, que el estilo lee con `var(--x)` |

## Lección 16. Comprobar que se entendió

Respondé sin mirar el código y después confirmá en el archivo.

1. ¿Qué archivo se ejecuta primero después de `index.html`?
2. ¿Dónde está guardada la lista de palabras: en `WordCloud` o en `App`?
3. ¿Qué pasa con `Contenedor` y `contenedor`?
4. ¿Por qué el campo se vacía después de un envío válido?
5. ¿Qué número sube cuando la misma palabra se envía otra vez, y qué número decide el tamaño de la letra?
6. ¿Para qué existen a la vez la lista `sr-only` y la nube con `aria-hidden`?
7. ¿Qué función evita que el formulario recargue la página?
8. Si cerrás la pestaña y la volvés a abrir, ¿siguen las palabras? ¿Por qué?

Respuestas: 1, `main.jsx`. 2, la copia que se dibuja está en `App`, dentro de `words`. La lista que manda está en la API. `WordCloud` solo la muestra. 3, cuentan como la misma y comparten contador; esa decisión la toma `words.js` en el backend. 4, porque un `POST` aceptado llama a `setDraft('')`. 5, sube `count` en la API; el tamaño sale de comparar ese `count` con el máximo de la lista. 6, la lista le lee el contenido a quien usa un lector de pantalla, y la nube es la versión visual de los mismos datos. 7, `event.preventDefault()`. 8, siguen mientras la API siga en marcha: al abrir la pestaña, el evento `words` trae la lista del proceso. Si ese proceso se detuvo, la lista se perdió y la pantalla avisa que el servidor no responde.

## Qué mirar cuando esto cambie

La pantalla ya envía y escucha. El curso de esa API está en [CURSO_BACKEND.md](CURSO_BACKEND.md). `WordCloud`, `placeInCloud` y `CloudBackground` siguen recibiendo una lista terminada: no les importa si salió de esta pestaña o de otra.

Lo que todavía falta es que esa lista sobreviva cuando el proceso de la API se detiene. Eso es la base de datos.
