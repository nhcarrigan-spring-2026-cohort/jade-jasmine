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
  const dataFilePath = path.join(currentDirname, "./seed-files/fb-seed.json");
  const jsonData = fs.readFileSync(dataFilePath, "utf8");

  const data = JSON.parse(jsonData);

  const userValuesSQL = [];
  const pwdValuesSQL = [];

  const fbValuesSQL = [];
  //const roleValuesSQL = [];
  const user_role_relation = []; // made up of {role, user_id}

  // first pass sets up the users and their passwords only
  // we assume seeding data does not define duplicate users at all
  let count = 1;
  for (let i = 0; i < data.length; i++) {
    //name, unit_no, street, city, province, country, postal_code, website, phone, charity_registration_no, admin
    const fb = data[i];
    fbValuesSQL
      .push(`('${fb.name}','${fb.unit_no || `NULL`}','${fb.street}','${fb.city}','${fb.province}','${fb.country}','${fb.postal_code}','${fb.website || `NULL`}','${fb.phone || `NULL`}','${fb.charity_registration_no || `NULL`}','${count}')`);
    for (let j = 0; j < data[i].workers.length; j++) {
      // I've setup up the seed json to always list the admin user first and then all the staff after
      // this seeding doesn't allow for more than one admin per food bank (this scenario needs to be
      // tested dynamically by adding that 2nd admin later, so it is beyond the scope of the seed data)
      if (j === 0) {
        user_role_relation.push({ role: "admin", user_id: count });
      } else {
        user_role_relation.push({ role: "staff", user_id: count });
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
  
  //encrypt the passwords before storing them
  const TABLES_SETUP_SQL = `
    INSERT INTO users (username,email) VALUES ${userValuesSQL.join(",")};
    INSERT INTO passwords (user_id,user_password) VALUES ${pwdValuesSQL.join(",")};
    INSERT INTO foodbanks (name, unit_no, street, city, province, country, postal_code, website, phone, charity_registration_no, admin) VALUES ${fbValuesSQL.join(",")};
  `;

  //console.log(TABLES_SETUP_SQL);

  const client = await pool.connect();
  try {
    // setup a transaction so the queries are sequentially run

    await client.query("BEGIN");

    await client.query(CLEAR_OLD_DATA_SQL);
    await client.query(TABLES_SETUP_SQL);

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    return;
  } finally {
    client.release();
  }
  console.log("[Status]: user and password tables seeded");

  // second pass sets up the food banks and the user_roles

  console.log("[Status]: foodbank and user_roles tables seeded");

  // third pass sets up the hours, categories and boxes tables

  // fourth pass sets up the food tables and inventory tables

  return;
}
console.log("Starting seeding process which will take a couple of minutes:");
try {
  await addUserData();
} finally {
  console.log(
    "Seeding process has completed."
  );
  await pool.end();
}
