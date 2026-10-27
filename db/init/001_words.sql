CREATE TABLE words (
  id uuid PRIMARY KEY,
  text text NOT NULL,
  normalized text NOT NULL UNIQUE,
  count integer NOT NULL CHECK (count > 0),
  question text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
