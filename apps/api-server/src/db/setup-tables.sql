-- Note: all this code is to be thrown away if we use jwt bearer tokens instead
-- the next create+alter+create are from table.sql for connect-pg-simple npm module. 
-- I have modified them to run once to avoid errors during setup.

CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

DO $$
BEGIN
  -- Create primary key only if it doesn't already exist
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'session_pkey'
  ) THEN
    ALTER TABLE "session"
      ADD CONSTRAINT session_pkey PRIMARY KEY ("sid");
  END IF;

  -- Create index only if it doesn't already exist
  IF NOT EXISTS (
    SELECT 1
    FROM pg_class
    WHERE relname = 'IDX_session_expire'
  ) THEN
    CREATE INDEX "IDX_session_expire"
      ON "session" ("expire");
  END IF;

END$$;

DROP DOMAIN IF EXISTS t_username CASCADE;

CREATE DOMAIN t_username AS VARCHAR(32)
CHECK (
  length(VALUE) BETWEEN 1 AND 32
);

DROP TABLE IF EXISTS users CASCADE ;

CREATE TABLE users ( 
    id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY, 
    username t_username NOT NULL UNIQUE, 
    email TEXT NOT NULL UNIQUE 
);

DROP TABLE IF EXISTS passwords;

CREATE TABLE passwords (
    user_id int PRIMARY KEY REFERENCES users(id), 
    user_password VARCHAR(64) NOT NULL
);
