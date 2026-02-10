
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


DROP TABLE IF EXISTS foodbanks CASCADE ;

CREATE TABLE foodbanks (
  id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(75) NOT NULL,
  unit_no VARCHAR(10),
  street VARCHAR(50) NOT NULL,
  city VARCHAR(20) NOT NULL,
  province VARCHAR(20) NOT NULL,
  country VARCHAR(20) NOT NULL,
  postal_code VARCHAR(12) NOT NULL,
  longitude DECIMAL(9,6),
  latitude DECIMAL(9,6),
  website TEXT,
  phone VARCHAR(20),
  fax VARCHAR(20),
  charity_registration_no VARCHAR(30),
  timezone TEXT NOT NULL,
  admin INT NOT NULL REFERENCES users(id)
);


DROP TYPE IF EXISTS role_type CASCADE ;

CREATE TYPE t_role AS ENUM (
  'admin',
  'staff',
  'volunteer'
);


DROP TABLE IF EXISTS user_roles CASCADE ;

CREATE TABLE user_roles (
  fb_id INT NOT NULL REFERENCES foodbanks(id),
  user_id INT NOT NULL REFERENCES users(id),
  role t_role NOT NULL,
  PRIMARY KEY (fb_id, user_id, role)
);

DROP DOMAIN IF EXISTS t_weekday CASCADE;

CREATE DOMAIN t_weekday AS INT
CHECK (
  VALUE BETWEEN 1 AND 7
);

DROP TABLE IF EXISTS hours CASCADE ;

CREATE TABLE hours (
  id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY, 
  fb_id INT NOT NULL REFERENCES foodbanks(id),
  weekday t_weekday NOT NULL DEFAULT 1,
  opening_hr TIME NOT NULL,
  closing_hr TIME NOT NULL,  
  temporarily_closed BOOLEAN DEFAULT FALSE
);

DROP TABLE IF EXISTS categories CASCADE;

CREATE TABLE categories (
  id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY, 
  fb_id INT NOT NULL REFERENCES foodbanks(id),
  name VARCHAR(25) NOT NULL,
  UNIQUE (fb_id, name)
);

DROP INDEX IF EXISTS categories_idx CASCADE;

CREATE UNIQUE INDEX categories_idx ON categories (fb_id, name);

DROP TABLE IF EXISTS boxes CASCADE;

CREATE TABLE boxes (
  id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY, 
  fb_id INT REFERENCES foodbanks(id),
  name VARCHAR(35) NOT NULL,
  min INT DEFAULT 0,
  UNIQUE (fb_id, name)
);


DROP INDEX IF EXISTS box_idx CASCADE;

CREATE UNIQUE INDEX box_idx ON boxes (fb_id, name);

DROP TABLE IF EXISTS food CASCADE;

CREATE TABLE food (
  id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY, 
  fb_id int NOT NULL REFERENCES foodbanks(id),
  name VARCHAR(30) NOT NULL,
  description VARCHAR(100),
  category INT NOT NULL REFERENCES categories(id),
  box INT REFERENCES boxes(id),
  barcode VARCHAR(13),
  min INT DEFAULT 0
);


DROP TABLE IF EXISTS food_inventory CASCADE;

CREATE TABLE food_inventory (
  fb_id INT NOT NULL REFERENCES foodbanks(id),
  food_id INT NOT NULL REFERENCES food(id),
  quantity INT DEFAULT 0,
  PRIMARY KEY (fb_id, food_id)
);

DROP TABLE IF EXISTS box_inventory CASCADE;

CREATE TABLE box_inventory (
  fb_id INT NOT NULL REFERENCES foodbanks(id),
  box_id INT NOT NULL REFERENCES boxes(id),
  quantity INT DEFAULT 0,
  PRIMARY KEY (fb_id, box_id)
);

