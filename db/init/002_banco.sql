-- Banco de preguntas y actividades.
-- La tabla words sigue existiendo: la nube actual la usa hasta que el enlace del alumno esté listo.
-- Este archivo corre solo en un volumen vacío. En una base que ya tiene datos hay que aplicarlo a mano.

CREATE TABLE IF NOT EXISTS categorias (
  id uuid PRIMARY KEY,
  nombre text NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS preguntas (
  id uuid PRIMARY KEY,
  categoria_id uuid NOT NULL REFERENCES categorias (id),
  texto text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS actividades (
  id uuid PRIMARY KEY,
  pregunta_id uuid REFERENCES preguntas (id) ON DELETE SET NULL,
  codigo text NOT NULL UNIQUE,
  texto_pregunta text NOT NULL,
  categoria_nombre text NOT NULL,
  estado text NOT NULL CHECK (estado IN ('preparada', 'abierta', 'cerrada')),
  iniciada_en timestamptz,
  finalizada_en timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS palabras (
  id uuid PRIMARY KEY,
  actividad_id uuid NOT NULL REFERENCES actividades (id) ON DELETE CASCADE,
  texto text NOT NULL,
  normalizado text NOT NULL,
  cantidad integer NOT NULL CHECK (cantidad > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (actividad_id, normalizado)
);

CREATE TABLE IF NOT EXISTS sesiones (
  id uuid PRIMARY KEY,
  huella text NOT NULL UNIQUE,
  creada_en timestamptz NOT NULL DEFAULT now(),
  vence_en timestamptz NOT NULL
);

INSERT INTO categorias (id, nombre)
SELECT gen_random_uuid(), semilla.nombre
FROM (
  VALUES
    ('Tecnología'),
    ('Informática'),
    ('Docker y contenedores'),
    ('Programación'),
    ('Educación'),
    ('Trabajo en equipo'),
    ('Temas libres')
) AS semilla (nombre)
WHERE NOT EXISTS (
  SELECT 1 FROM categorias WHERE categorias.nombre = semilla.nombre
);

INSERT INTO preguntas (id, categoria_id, texto)
SELECT gen_random_uuid(), categorias.id, semilla.texto
FROM (
  VALUES
    ('Docker y contenedores', 'Definí Docker en una sola palabra.'),
    ('Docker y contenedores', '¿Qué problema resuelve un contenedor?'),
    ('Programación', 'Definí un programa en una sola palabra.'),
    ('Trabajo en equipo', 'Una palabra para el trabajo en grupo.'),
    ('Educación', '¿Qué es aprender, en una palabra?')
) AS semilla (categoria, texto)
JOIN categorias ON categorias.nombre = semilla.categoria
WHERE NOT EXISTS (
  SELECT 1 FROM preguntas WHERE preguntas.texto = semilla.texto
);
