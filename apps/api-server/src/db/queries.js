import { pool } from "./db/pool.js";

export async function getUserByUsername(username) {
  console.log("in getUserByUsername: ", username);
  const { rows } = await pool.query(
    "SELECT id,username,email FROM users WHERE username=$1;",
    [username],
  );
  return rows;
}

export async function getUserById(id) {
  console.log("in getUserById: ", id);
  const { rows } = await pool.query(
    "SELECT id,username,email FROM users WHERE id=$1;",
    [id],
  );
  return rows;
}

export async function getUserPassword(username) {
  console.log("in getUserPassword: ", username);
  const { rows } = await pool.query(
    "SELECT id,username,email,password FROM users INNER JOIN user_passwords ON users.id=password.user_id WHERE username=$1;",
    [username],
  );
  return rows;
}