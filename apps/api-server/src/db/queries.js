import { pool } from "./pool.js";

export async function findOtherUser(userId, email) {
  console.log("in findOtherUser: ", userId, email);
  const { rows } = await pool.query(
    "SELECT id,username,email FROM users WHERE email=$1 AND id<>$2;",
    [email, userId],
  );
  return rows[0]; //return only the first row which hopefully exists
}

export async function getUserByEmail(email) {
  console.log("in getUserByEmail: ", email);
  const { rows } = await pool.query(
    "SELECT id,username,email FROM users WHERE email=$1;",
    [email],
  );
  return rows[0]; //return only the first row which hopefully exists
}

export async function getUserByUsername(username) {
  console.log("in getUserByUsername: ", username);
  const { rows } = await pool.query(
    "SELECT user_id,username,email FROM users WHERE username=$1;",
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
    "SELECT id,username,email,pw.user_password FROM users INNER JOIN passwords AS pw ON users.id=pw.user_id WHERE username=$1;",
    [username],
  );
  return rows[0]; // return the first row only
}

export async function addNewUser(username, email, password) {
  console.log("in addNewUser:", username, email);

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
    console.error("Add User Transaction failed:", error);
    throw error;
  } finally {
    client.release();
  }
}
