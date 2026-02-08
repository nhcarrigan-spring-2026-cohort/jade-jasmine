import { pool } from "./pool.js";
import logger from "../utils/logger.js";
//import AppError from "../errors/AppError.js";

export async function getAllFoodBanks({id,name,city,province,country}, limit=10, offset=0) {
  logger.info("in getAllFoodBanks:", { id, name, city, province, country, limit, offset });

  let count = 1;
  const whereParams = [];
  let whereClause = [];
  id && whereParams.push(id) && whereClause.push(`id=$${count++}`);  
  name &&
    whereParams.push(name) &&
    whereClause.push(`name ILIKE $${count++}`);
  city &&
    whereParams.push(city) &&
    whereClause.push(`city ILIKE $${count++}`);
  province &&
    whereParams.push(province) &&
    whereClause.push(`province ILIKE $${count++}`);
  country &&
    whereParams.push(country) &&
    whereClause.push(`country ILIKE $${count++}`);

  whereClause = whereClause.length === 0 ? "" : whereClause.length === 1 ? `WHERE ${whereClause}` : `WHERE ${whereClause.join(' AND ')}`;
  
  const { rows } = await pool.query(
    `SELECT id,name,unit_no,street,city,province,country,postal_code,longitude,latitude,website,phone,fax,charity_registration_no,timezone FROM foodbanks  ${whereClause} ORDER BY country,province,city LIMIT ${limit} OFFSET ${offset};`,
    whereParams,
  );
  return rows;
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
    "SELECT * FROM foodbanks AS fb INNER JOIN users ON admin=users.id INNER JOIN user_roles AS ur ON users.id=ur.user_id WHERE fb.id=$1 ORDER BY country,province,city;"
  , [id]);
  return rows[0];
}
  