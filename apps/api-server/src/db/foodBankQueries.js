import { pool } from "./pool.js";
import logger from "../utils/logger.js";
//import AppError from "../errors/AppError.js";

export async function getFoodBankHours(id) {
  logger.info(`in getFoodBankHours: ${id}`);
  const { rows } = await pool.query(
    "SELECT * FROM hours WHERE fb_id=$1 ORDER BY weekday",
    [id],
  );
  return rows;
}

export async function getAllRoles() {
  logger.info(`in getAllRoles`);
  const sql = `SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_type.oid = pg_enum.enumtypid WHERE pg_type.typname = 't_role';`;
  const { rows } = await pool.query(sql);
  return rows;
}

export async function getFoodBankStaff(id, role) {
  logger.info(`in getFoodBankStaff: ${id} \n role: ${role}`);
  const params = [id];
  let roleConstraint = "";
  if (role) {
    params.push(role);
    roleConstraint = "AND role=$2";
  }
  const { rows } = await pool.query(
    `SELECT user_id,role,username,email FROM user_roles AS ur INNER JOIN users ON ur.user_id=users.id WHERE fb_id=$1 ${roleConstraint} ORDER BY role`,
    params,
  );
  return rows;
}

export async function getAllFoodBanks(
  { id, name, city, province, country },
  limit = 10,
  offset = 0,
) {
  logger.info("in getAllFoodBanks:", {
    id,
    name,
    city,
    province,
    country,
    limit,
    offset,
  });

  let count = 1;
  const whereParams = [];
  let whereClause = [];
  id && whereParams.push(id) && whereClause.push(`id=$${count++}`);
  name && whereParams.push(name) && whereClause.push(`name ILIKE $${count++}`);
  city && whereParams.push(city) && whereClause.push(`city ILIKE $${count++}`);
  province &&
    whereParams.push(province) &&
    whereClause.push(`province ILIKE $${count++}`);
  country &&
    whereParams.push(country) &&
    whereClause.push(`country ILIKE $${count++}`);

  whereClause =
    whereClause.length === 0
      ? ""
      : whereClause.length === 1
        ? `WHERE ${whereClause}`
        : `WHERE ${whereClause.join(" AND ")}`;

  const { rows } = await pool.query(
    `SELECT id,name,description,email,unit_no,street,city,province,country,postal_code,longitude,latitude,website,phone,fax,charity_registration_no,timezone FROM foodbanks  ${whereClause} ORDER BY country,province,city LIMIT ${limit} OFFSET ${offset};`,
    whereParams,
  );
  return rows;
}

export async function findByNameAndAddress(
  name,
  street,
  city,
  province,
  country,
) {
  logger.info(`in findByNameAndAddress: `, {
    name,
    street,
    city,
    province,
    country,
  });
  const { rows } = await pool.query(
    "SELECT id from foodbanks WHERE name ILIKE $1 AND street ILIKE $2 AND city ILIKE $3 AND province ILIKE $4 AND country ILIKE $5",
    [name, street, city, province, country],
  );
  return rows;
}

export async function isNewCharity(charity_no) {
  logger.info(`in isNewCharity: charity_no: ${charity_no}`);
  const { rows } = await pool.query(
    "SELECT 1 FROM foodbanks WHERE charity_registration_no=$1;",
    [charity_no],
  );
  return Object.keys(rows).length === 0; // none found means this is indeed a new charity
}

/**
 * returns true if the userId is one of the admins of this foodbank
 * checks the user_roles table for that info
 * @param {*} userId
 * @param {*} fbId
 */
export async function isAdmin(userId, fbId) {
  logger.info(`in isAdmin: ${userId}, ${fbId}`);
  const { rows } = await pool.query(
    "SELECT 1 FROM user_roles WHERE fb_id=$1 AND user_id=$2 AND role='admin'",
    [fbId, userId],
  );
  return Object.keys(rows).length > 0;
}
/**
 * returns a detailed view of the foodbank and its admin/staff
 * use only if authorized!
 *
 * @param {*} id
 * @returns
 */
export async function getFoodBankById(id) {
  logger.info("in getFoodBankById");
  const { rows } = await pool.query(
    "SELECT published, name, description, fb.email as fb_email, unit_no, street, city, province, country, postal_code, website, phone, fax, charity_registration_no, timezone, admin, username, users.email as admin_email FROM foodbanks AS fb INNER JOIN users ON admin=users.id INNER JOIN user_roles AS ur ON users.id=ur.user_id WHERE fb.id=$1 ORDER BY country,province,city;",
    [id],
  );
  return rows[0];
}

/**
 * the authenticated user becomes the admin of this new food bank
 * Three tables are modified. The foodbanks, the user_roles and the hours
 *
 * @param {} body
 */
export async function addNewFoodBank(adminId, body) {
  logger.info("in addNewFoodBank:", body);
  const {
    fbname,
    published = "true",
    description = null,
    charity_no = null,
    phone = null,
    fax = null,
    email = null,
    website = null,
    unit_no = null,
    street,
    city,
    province,
    country,
    timezone,
    postal_code,
  } = body;
  const sql =
    "INSERT INTO foodbanks (published, name, description, email, unit_no, street, city, province, country, postal_code, website, phone, fax, charity_registration_no, timezone, admin) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING id,published, name, description, email, unit_no, street, city, province, country, postal_code, website, phone, fax, charity_registration_no, timezone, admin";
  logger.info(`sql is: ${sql}`);
  const values = [
    published,
    fbname,
    description,
    email,
    unit_no,
    street,
    city,
    province,
    country,
    postal_code,
    website,
    phone,
    fax,
    charity_no,
    timezone,
    adminId,
  ];
  logger.info(`values are: ${values}`);
  const { rows } = await pool.query(sql, values);
  logger.info(`row: `, rows[0]);
  return rows["0"];
}
