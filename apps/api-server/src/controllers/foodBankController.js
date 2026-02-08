import AppError from "../errors/AppError.js";
import * as fbQueries from "../db/foodBankQueries.js";
import logger from "../utils/logger.js";

/**
 * this method returns open data that is not private to the food bank (so no admin or staff info returned)
 * @param {} req
 * @param {*} res
 */
export async function getFoodBank(req, res) {
  logger.info("in getFoodBank");

  const id = req.query.id;
  const name = req.query.name;
  const city = req.query.city;
  const province = req.query.province;
  const country = req.query.country;
  const limit = req.limit; // <===  this is weird as I have no choice but to use req.limit instead of req.query.limit
  const offset = req.offset; // same situation as limit

  logger.info("req.query", req.query);
  logger.info(`id:  ${req.query.id}, limit: ${req.query.limit}, offset: ${req.query.offset}`)
  try {
    const foodbanks = await fbQueries.getAllFoodBanks({
      id,
      name,
      city,
      province,
      country,
    }, limit, offset);
    res.status(200).json({ data: foodbanks });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    } else {
      throw new AppError("Failed to get a list of food banks", 500, error);
    }
  }
}


/**
 * if the logged in user is not the admin of the food bank, then
 * this method returns open data that is not private to the food bank (so no admin data)
 * otherwise, it will return the admin id and username too
 * 
 * @param {} req
 * @param {*} res
 */
export async function getFoodBankDetails(req, res) {
  logger.info("in getFoodBankDetails");

  //logger.info("req", req);
  const id = Number(req.params.id);
  
  try {
    const foodbank = await fbQueries.getFoodBankById(id);
    logger.info("foodbank: ", foodbank)
    
  logger.info(`admin.id vs req.user.id:  ${foodbank.admin} ${req.user.id}`)
    if (Number(foodbank.admin) !== req.user.id) {
      // delete the keys that we shouldn't show
      delete foodbank.admin;
      delete foodbank.username;
      delete foodbank.fb_id;
      delete foodbank.user_id;
      delete foodbank.role;
      delete foodbank.email;
      logger.info("this user is not the admin, so hide some details:", foodbank);
    } 
    res.status(200).json({ data: foodbank });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    } else {
      throw new AppError("Failed to get the indicated food bank", 500, error);
    }
  }
}
