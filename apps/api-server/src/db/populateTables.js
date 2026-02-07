/* eslint-disable no-console */
//before running this code, we need to create the tables from setup-tables.sql
import { pool } from "./pool.js";
//import * as userQueries from "./userQueries.js";

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

  const user_role_relation = []; // made up of {role, user_id}
  //const roleValuesSQL = [];
  //const foodbankValuesSQL = [];

  // first pass sets up the users and their passwords only
  // we assume seeding data does not define duplicate users at all
  let count = 1;
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].workers.length; j++) {

      // I've setup up the seed json to always list the admin user first and then all the staff after
      // this seeding doesn't allow for more than one admin per food bank (this scenario needs to be 
      // tested dynamically by adding that 2nd admin later, so it is beyond the scope of the seed data)
      if (j === 0) {
        user_role_relation.push({ role: 'admin', user_id: count })
      } else {
        user_role_relation.push({ role: "staff", user_id: count });
      }
      userValuesSQL.push(
        `('${data[i].workers[j].username}', '${data[i].workers[j].email}')`,
      );

      const hashedPassword = await bcrypt.hash(
        data[i].workers[j].password,
        Number(process.env.HASH_SALT),
      );
      pwdValuesSQL.push(`(${count++}, '${hashedPassword}')`);
    }
  }

  //encrypt the passwords before storing them
  const USER_SETUP_SQL = `
    INSERT INTO users (username,email) VALUES ${userValuesSQL.join(",")};
    INSERT INTO passwords (user_id,user_password) VALUES ${pwdValuesSQL.join(",")};
  `;

  console.log(USER_SETUP_SQL);

  const client = await pool.connect();
  try {
    // setup a transaction so the queries are sequentially run

    await client.query("BEGIN");
    await pool.query(CLEAR_OLD_DATA_SQL);
    await pool.query(USER_SETUP_SQL);

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    return;
  } finally {
    client.release();
  }
  console.log("[status]: user and password tables seeded");

  // second pass sets up the food banks and the user_roles

  /**
  for (let i = 0; i < perfumeData.length; i++) {
    const perfumeRow = await getPerfumeByName(perfumeData[i].perfume_name);
    await setPerfumeBrand(perfumeRow.perfume_id, perfumeData[i].brand_name);
    await setPerfumeCategory(
      perfumeRow.perfume_id,
      perfumeData[i].category_name,
      perfumeData[i].category_type
    );
    await setPerfumePrice(
      perfumeRow.perfume_id,
      Number(perfumeData[i].price > 0) ? perfumeData[i].price : 0.01
    );
    await setPerfumeInventory(
      perfumeRow.perfume_id,
      Math.floor(Math.random() * 3)
    );
  }

  const hautePerfumeRow = await getPerfumeByName("Calvin Klein Beauty"); //get one perfume to mark as 'haute' category
  if (!hautePerfumeRow) {
    throw new Error("populate tables failed. Unable to find a perfume to set to haute couture.");
  }
  const category_id = await addCategory("couture", "haute");
  console.log(category_id);
  await addPerfumeCategory(hautePerfumeRow.perfume_id, category_id);
  console.log("brand, category and perfumes tables seeded");
  */
  return;
}
console.log("Starting seeding process which will take a minute:")
await addUserData();
console.log("Seeding process has completed. Please wait for remaining steps.")
