import { pool } from "./pool.js";
import logger from "../utils/logger.js";

export async function findOtherUser(userId, email) {
  logger.info("in findOtherUser: ", userId, email);
  const { rows } = await pool.query(
    "SELECT id,username,email FROM users WHERE email=$1 AND id<>$2;",
    [email, userId],
  );
  return rows[0]; //return only the first row which hopefully exists
}

export async function findOtherUserByUsername(userId, username) {
  logger.info("in findOtherUserByUsername: ", userId, username);
  const { rows } = await pool.query(
    "SELECT id,username,email FROM users WHERE username=$1 AND id<>$2;",
    [username, userId],
  );
  return rows[0]; //return only the first row which hopefully exists
}


export async function getUserByEmail(email) {
  logger.info("in getUserByEmail: ", email);
  const { rows } = await pool.query(
    "SELECT id,username,email FROM users WHERE email=$1;",
    [email],
  );
  return rows[0]; //return only the first row which hopefully exists
}

export async function getUserByUsername(username) {
  logger.info("in getUserByUsername: ", username);
  const { rows } = await pool.query(
    "SELECT id,username,email FROM users WHERE username=$1;",
    [username],
  );
  return rows;
}

export async function getUserById(id) {
  logger.info("in getUserById: ", id);
  const { rows } = await pool.query(
    "SELECT id,username,email FROM users WHERE id=$1;",
    [id],
  );
  return rows;
}

export async function getUserPassword(username) {
  logger.info("in getUserPassword: ", username);
  const { rows } = await pool.query(
    "SELECT id,username,email,pw.user_password FROM users INNER JOIN passwords AS pw ON users.id=pw.user_id WHERE username=$1;",
    [username],
  );
  return rows[0]; // return the first row only
}

export async function addNewUser(username, email, password) {
  logger.info("in addNewUser:", username, email);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `INSERT INTO users (username, email)
       VALUES ($1, $2)
       RETURNING id, username, email;`,
      [username, email],
    );

    const user = rows[0];

    await client.query(
      `INSERT INTO passwords (user_id, user_password)
       VALUES ($1, $2);`,
      [user.id, password],
    );

    await client.query("COMMIT");
    return user;
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error("Add User Transaction failed:", error);
    throw error;
  } finally {
    client.release();
  }
}
