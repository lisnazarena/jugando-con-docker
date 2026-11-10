# Usar Lluvia de palabras en el aula

Esta guía deja el proyecto listo para una clase real y dice qué hace el profesor y qué hacen los alumnos. La aplicación corre en la computadora del profesor, con Docker Compose. Los alumnos entran desde el celular o la notebook, por el mismo Wi-Fi, sin instalar nada y sin cuenta.

No hace falta un servidor en internet ni Kubernetes. «En producción», para esta entrega, significa los tres contenedores encendidos y el enlace de la actividad abierto para el aula.

## Antes de empezar

En la computadora del profesor:

- Ubuntu con Docker y Docker Compose versión 2 (`docker compose`, no `docker-compose` suelto).
- Git.
- Acceso al repositorio. Hoy es privado: GitHub tiene que reconocer la cuenta.
- El puerto 8088 libre.
- Profesor y alumnos en la misma red Wi-Fi. El puerto 8088 de esta máquina tiene que aceptarlos. Si hay un firewall, la excepción es ese puerto, no el 5432 ni el 5435.

Los alumnos solo necesitan un navegador.

## 1. Levantar desde cero

En la computadora del profesor:

```bash
git clone https://github.com/lisnazarena/jugando-con-docker.git
cd jugando-con-docker
git checkout feature/contenedores
cp .env.example .env
```

Abrí `.env` y definí la contraseña del panel en `TEACHER_PASSWORD`. El ejemplo trae `aula-de-prueba`. Cambiala antes de la clase. Esa clave no va al repositorio y los alumnos no la usan.

La clave `POSTGRES_PASSWORD` es de la base. Dejala en el archivo. No hace falta abrir PostgreSQL desde los celulares: el puerto 5435 queda solo en esta máquina.

Levantá los tres contenedores:

```bash
docker compose up --build
```

La primera vez descarga imágenes y compila la pantalla. Puede tardar varios minutos. Cuando los tres servicios hayan arrancado, en otra terminal:

```bash
docker compose ps
```

Tienen que figurar `web`, `api` y `db`. `db` queda `healthy`. `web` publica `8088`. `api` no publica el puerto 4000.

La próxima vez, si el código no cambió, alcanza con:

```bash
docker compose up
```

Si cambiaste `TEACHER_PASSWORD` con los contenedores ya creados, la API sigue con la clave anterior hasta recrearla:

```bash
docker compose up -d --no-build --force-recreate api
```

## 2. Dirección que van a usar los alumnos

`127.0.0.1` solo funciona en la computadora del profesor. Un celular no llega a esa dirección.

En la máquina del profesor:

```bash
hostname -I
```

Usá la primera dirección, la de la red del aula. Si fuera `192.168.1.20`, la aplicación es:

```text
http://192.168.1.20:8088
```

El panel del profesor tiene que abrirse con esa misma dirección:

```text
http://192.168.1.20:8088/profesor
```

El enlace que el panel copia para los alumnos sale de la dirección que hay en la barra del navegador. Si el profesor entra por `127.0.0.1`, el enlace que comparte también dice `127.0.0.1` y en los celulares no abre.

## 3. Probar antes de que entren los alumnos

Hacelo en la computadora del profesor, con la dirección de la red.

1. Abrí `http://IP-DEL-AULA:8088`. Tiene que verse «Lluvia de palabras» y el botón del panel.
2. Entrá a `/profesor` y escribí el valor de `TEACHER_PASSWORD`. Aparece el banco. La primera vez, con el volumen vacío, ya hay 7 categorías y 5 preguntas de ejemplo.
3. En una pregunta, pulsá **Iniciar**. El panel muestra un enlace `http://IP-DEL-AULA:8088/a/` y un código de seis caracteres.
4. Abrí ese enlace en dos pestañas. Las dos muestran la misma pregunta y un campo para escribir.
5. Enviá la misma palabra en las dos. En las dos tiene que pasar a 2 veces, sin recargar, y verse más grande.
6. En el panel, pulsá **Finalizar**. En las pestañas el campo queda deshabilitado y se lee que las palabras quedan guardadas.
7. Desde un celular, en el mismo Wi-Fi, abrí el inicio y el enlace de una actividad nueva. Si el celular no carga, el puerto 8088 no está llegando a la red. Revisá la IP y el firewall antes de llamar a los alumnos.

Consulta opcional, para ver que las palabras quedaron en la base:

```bash
docker compose exec db psql -U lluvia -d lluvia -c "SELECT actividades.codigo, palabras.texto, palabras.cantidad FROM palabras JOIN actividades ON actividades.id = palabras.actividad_id ORDER BY palabras.created_at;"
```

## 4. Qué hace el profesor

1. Conectate al Wi-Fi del aula.
2. En la carpeta del proyecto, si los contenedores estaban detenidos:

```bash
docker compose up -d
```

3. Abrí el panel con la IP de la máquina, no con `127.0.0.1`:

```text
http://IP-DEL-AULA:8088/profesor
```

4. Escribí la contraseña de `TEACHER_PASSWORD`.
5. Elegí una pregunta del banco o creá una. Para crearla: categoría, texto de hasta 200 caracteres y **Crear**.
6. Pulsá **Iniciar** en la pregunta de esta clase. El estado queda `abierta`.
7. Copiá el enlace que aparece y proyectalo o pasalo por el medio que use el aula. Tiene que empezar por `http://IP-DEL-AULA:8088/a/`.
8. Dejá abierta esa pantalla del alumno, proyectada, para que el curso vea la nube.
9. Cuando termine la ronda, en el panel pulsá **Finalizar**. El campo de los alumnos se desactiva solo. Las palabras siguen guardadas.
10. Para otra pregunta, iniciá otra actividad y compartí el enlace nuevo. El anterior no cambia de pregunta.

Editar o borrar una pregunta del banco no reescribe una actividad ya iniciada. Cada actividad guarda una copia del texto del momento en que se inició, y sus palabras son suyas.

## 5. Qué hacen los alumnos

1. Conectate al mismo Wi-Fi que la computadora del profesor.
2. Abrí el enlace que proyectó el profesor. No hace falta cuenta ni contraseña.
3. Leé la pregunta.
4. Escribí una palabra o una frase corta, de hasta 32 caracteres, y pulsá **Enviar**.
5. La nube se actualiza sola. Si otra persona envía la misma palabra, el número sube y esa palabra se dibuja más grande.
6. Cuando el profesor cierra la actividad, el campo deja de aceptar envíos. Las palabras quedan en la pantalla.

Si el enlace no abre, casi siempre es la red o una dirección `127.0.0.1`. Pedile al profesor el enlace que empieza con la IP del aula.

## 6. Cerrar la clase

Detener los contenedores no borra las preguntas ni las palabras:

```bash
docker compose stop
```

Para volver a usarlas otro día, desde la misma carpeta:

```bash
docker compose up -d
```

El volumen se llama `jugando-con-docker_pgdata`. Mientras exista, las actividades siguen.

Este comando sí borra las palabras y las preguntas. No lo uses al terminar una clase:

```bash
docker compose down -v
```

## 7. Si algo no responde

| Qué se ve | Qué hacer |
| --- | --- |
| El panel dice «La contraseña no coincide.» | Es la de `TEACHER_PASSWORD` en `.env`, la que tenía el contenedor al arrancar. Vaciala el campo por si el navegador pegó otra clave. Si acabás de cambiar `.env`, recreá `api` con el comando de la sección 1. |
| La página del profesor abre y el celular no | El enlace usa `127.0.0.1`, o el celular está en otra red, o el firewall tapa el 8088. |
| La nube no crece en la otra pantalla | Las dos tienen que estar en el mismo enlace `/a/` y el mismo código, con la actividad abierta. |
| `docker compose ps` no muestra los tres | Desde la carpeta del proyecto, `docker compose up -d` y esperá a que `db` diga `healthy`. |
| Después de un corte vuelve solo | `restart: unless-stopped` reinicia el mismo contenedor si el proceso termina solo. Hay unos segundos sin ese servicio. Un `docker compose stop` lo deja detenido hasta el próximo `up`. |
