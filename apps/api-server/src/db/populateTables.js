/* eslint-disable no-console */

/*
 !!! before running this code, we need to create the tables from setup-tables.sql !!! (npm run db:setup will do that)
*/

import { pool } from "./pool.js";

import fs from "fs";
import path from "path";

import "dotenv/config";
import url from "url";

// needed to hash the password value
import bcrypt from "bcrypt";

const CLEAR_OLD_DATA_SQL = `
TRUNCATE TABLE box_inventory CASCADE;
TRUNCATE TABLE food_inventory CASCADE;
TRUNCATE TABLE boxes CASCADE;
TRUNCATE TABLE food CASCADE;
TRUNCATE TABLE categories CASCADE;
TRUNCATE TABLE hours CASCADE;
TRUNCATE TABLE foodbanks CASCADE;
TRUNCATE TABLE user_roles CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE passwords CASCADE;
`;

/**
 * How to run this code:
 
# if populating local db
node db/populateTables.js 

# if populating production db
# run it from your machine once after deployment of your app & db
node db/populateTables.js <production-db-url>
**/
// Get the current file's URL
const currentFileUrl = import.meta.url;

// Convert the URL to a file path
const currentFilePath = url.fileURLToPath(currentFileUrl);

// Get the directory name from the file path
const currentDirname = path.dirname(currentFilePath);

console.log(currentDirname);

async function addUserData() {
  const fbDataFilePath = path.join(currentDirname, "./seed-files/fb-seed.json");
  const foodDataFilePath = path.join(currentDirname, "./seed-files/food-seed.json");
  const foodQtyDataFilePath = path.join(
    currentDirname,
    "./seed-files/food-inventory-seed.json",
  );
  const categoryDataFilePath = path.join(
    currentDirname,
    "./seed-files/categories-seed.json",
  );
  const boxesDataFilePath = path.join(
    currentDirname,
    "./seed-files/boxes-seed.json",
  );
  const hrDataFilePath = path.join(
    currentDirname,
    "./seed-files/hours-seed.json",
  );
  let jsonData = fs.readFileSync(fbDataFilePath, "utf8");

  let data = JSON.parse(jsonData);

  const userValuesSQL = [];
  const pwdValuesSQL = [];

  const fbValuesSQL = [];
  const roleValuesSQL = [];
  const user_role_relation = []; // made up of {role, user_id, fb_id}

  // first pass sets up the foodbanks, users, passwords, and user_roles
  // we assume seeding data does not define duplicate users at all
  let count = 1;
  for (let i = 0; i < data.length; i++) {
    //name, description, email, unit_no, street, city, province, country, postal_code, website, phone, charity_registration_no, admin
    const fb = data[i];
    const NULL = 'NULL';
    fb.unit_no = fb.unit_no ? `'${fb.unit_no.replace(/'/g, "''")}'` : NULL;
    fb.description = fb.description
      ? `'${fb.description.replace(/'/g, "''")}'`
      : NULL;
    fb.email = fb.email ? `'${fb.email}'` : NULL;
    fb.website = fb.website ? `'${fb.website}'` : NULL;
    fb.charity_registration_no = fb.charity_registration_no ? `'${fb.charity_registration_no}'` : NULL;
    fbValuesSQL.push(
      `(
      ${fb.published},
      '${fb.name.replace(/'/g, "''")}',
      ${fb.description},
      ${fb.email},
      ${fb.unit_no},
      '${fb.street}','${fb.city}','${fb.province}',
      '${fb.country}','${fb.postal_code}',
      ${fb.website},
      '${fb.phone}',
      ${fb.charity_registration_no},
      '${fb.timezone}',
      '${count}')`,
    );
    for (let j = 0; j < data[i].workers.length; j++) {
      // I've setup up the seed json to always list the admin user first and then all the staff after
      // this seeding doesn't allow for more than one admin per food bank (this scenario needs to be
      // tested dynamically by adding that 2nd admin later, so it is beyond the scope of the seed data)
      if (j === 0) {
        user_role_relation.push({ role: "admin", user_id: count, fb_id: i });
        roleValuesSQL.push(`(${i + 1}, ${count}, 'admin')`);
      } else {
        user_role_relation.push({ role: "staff", user_id: count, fb_id: i });

        roleValuesSQL.push(`(${i + 1}, ${count}, 'staff')`);
      }
      userValuesSQL.push(
        `('${fb.workers[j].username}', '${fb.workers[j].email}')`,
      );

      const hashedPassword = await bcrypt.hash(
        fb.workers[j].password,
        Number(process.env.HASH_SALT),
      );
      pwdValuesSQL.push(`(${count++}, '${hashedPassword}')`);
    }
  }

  // second pass sets up the food bank hours, categories and boxes

  const hourValuesSQL = [];
  jsonData = fs.readFileSync(hrDataFilePath, "utf8");
  data = JSON.parse(jsonData);

  for (let i = 0; i < data.length; i++) {
    hourValuesSQL.push(
      `(${data[i].fb_id}, ${data[i].weekday}, '${data[i].opening_hr}', '${data[i].closing_hr}')`,
    );
  }

  const categoryValuesSQL = [];
  jsonData = fs.readFileSync(categoryDataFilePath, "utf8");
  data = JSON.parse(jsonData);

  for (let i = 0; i < data.length; i++) {
    categoryValuesSQL.push(`(${data[i].fb_id}, '${data[i].name}')`);
  }

  const boxesValuesSQL = [];
  const boxesQtyValuesSQL = [];
  jsonData = fs.readFileSync(boxesDataFilePath, "utf8");
  data = JSON.parse(jsonData);

  for (let i = 0; i < data.length; i++) {
    boxesValuesSQL.push(
      `(${data[i].fb_id}, '${data[i].name}', ${data[i].min})`,
    );
    boxesQtyValuesSQL.push(
      `(${data[i].fb_id}, ${i+1}, ${data[i].min})`,
    );
  }

  const foodValuesSQL = [];
  jsonData = fs.readFileSync(foodDataFilePath, "utf8");
  data = JSON.parse(jsonData);

  for (let i = 0; i < data.length; i++) {
    foodValuesSQL.push(
      `(${data[i].fb_id}, '${data[i].name}', '${data[i].description}', ${data[i].category}, ${data[i].box},'${data[i].min}')`,
    );
  }

  ;
  
  const foodQtyValuesSQL = [];
  jsonData = fs.readFileSync(foodQtyDataFilePath, "utf8");
  data = JSON.parse(jsonData);

  for (let i = 0; i < data.length; i++) {
    foodQtyValuesSQL.push(
      `(${data[i].fb_id}, ${data[i].food_id}, ${data[i].quantity})`,
    );
  }
  const TABLES_SETUP_SQL = `
    INSERT INTO users (username,email) VALUES ${userValuesSQL.join(",")};
    INSERT INTO passwords (user_id,user_password) VALUES ${pwdValuesSQL.join(",")};
    INSERT INTO foodbanks (published, name, description, email, unit_no, street, city, province, country, postal_code, website, phone, charity_registration_no, timezone, admin) VALUES ${fbValuesSQL.join(",")};
    INSERT INTO user_roles (fb_id, user_id, role) VALUES ${roleValuesSQL.join(",")};    
    INSERT INTO hours (fb_id,weekday,opening_hr,closing_hr) VALUES ${hourValuesSQL.join(",")};
    INSERT INTO categories (fb_id,name) VALUES ${categoryValuesSQL.join(",")};
    INSERT INTO boxes (fb_id,name,min) VALUES ${boxesValuesSQL.join(",")};
    INSERT INTO box_inventory (fb_id,box_id,quantity) VALUES ${boxesQtyValuesSQL.join(",")};
    INSERT INTO food (fb_id,name,description,category,box,min) VALUES ${foodValuesSQL.join(",")};
    INSERT INTO food_inventory (fb_id,food_id,quantity) VALUES ${foodQtyValuesSQL.join(",")};
  `;
  
    
  console.log(TABLES_SETUP_SQL);
  const client = await pool.connect();
  try {
    // setup a transaction so the queries are sequentially run

    await client.query("BEGIN");

    await client.query(CLEAR_OLD_DATA_SQL);
    await client.query(TABLES_SETUP_SQL);

    await client.query("COMMIT");

    console.log("[Status]: user, user_roles and password tables seeded");

    console.log("[Status]: foodbank and hours table seeded");
  } catch (err) {
    await client.query("ROLLBACK");

    console.error(err);

    return;
  } finally {
    client.release();
  }

  // third pass sets up the food tables and inventory tables

  return;
}
console.log("Starting seeding process which will take a couple of minutes:");
try {
  await addUserData();
} finally {
  console.log("Seeding process has completed.");
  await pool.end();
}
