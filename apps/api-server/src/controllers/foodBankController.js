import AppError from "../errors/AppError.js";
import * as fbQueries from "../db/foodBankQueries.js";
import logger from "../utils/logger.js";
import { matchedData } from "express-validator";

/**
 * this method returns open data that is not private to the food bank (so no admin or staff info returned)
 * @param {} req
 * @param {*} res
 */
export async function getFoodBank(req, res) {
  logger.info("in getFoodBank");

  const data = matchedData(req, { locations: ["query"] });

  const id = req.query.id;
  const name = req.query.name;
  const city = req.query.city;
  const province = req.query.province;
  const country = req.query.country;
  const limit = data.limit; // <===  this is weird as I have no choice but to use data.limit instead of req.query.limit
  const offset = data.offset; // same situation as limit

  logger.info("req.query", req.query);
  logger.info(
    `id:  ${req.query.id}, limit: ${data.limit}, offset: ${data.offset}`,
  );
  try {
    const foodbanks = await fbQueries.getAllFoodBanks(
      {
        id,
        name,
        city,
        province,
        country,
      },
      limit,
      offset,
    );
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

  const authUserId = req.user?.id;

  const getFoodBankById = fbQueries.getFoodBankById(id);

  const isAdmin = fbQueries.isAdmin(authUserId, id);
  Promise.all([getFoodBankById, isAdmin])
    .then((responses) => {
      const [foodbank, isAdmin] = responses;
      logger.info(`admin.id vs req.user.id:  ${foodbank.admin} ${authUserId}`);
      if (!isAdmin) {
        if (foodbank.published) {
          // delete the keys that we shouldn't show
          delete foodbank.admin;
          delete foodbank.username;
          delete foodbank.fb_id;
          delete foodbank.user_id;
          delete foodbank.role;
          delete foodbank.email;
          logger.info(
            "this user is not the admin, so hide some details:",
            foodbank,
          );
        } else {
          foodbank = {}; //return blank as this food bank is not published yet for non-admins
        }
      }
      res.status(200).json({ data: foodbank });
    })
    .catch((error) => {
      if (error instanceof AppError) {
        throw error;
      } else {
        throw new AppError("Failed to get the indicated food bank", 500, error);
      }
    });
}

/**
 *
 * @param {} req
 * @param {*} res
 */
export async function getFoodBankHours(req, res) {
  logger.info("in getFoodBankHours");

  const id = Number(req.params.id);

  try {
    const hours = await fbQueries.getFoodBankHours(id);

    res.status(200).json({ data: hours });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    } else {
      throw new AppError(
        "Failed to get the indicated food bank's hours",
        500,
        error,
      );
    }
  }
}

/**
 * protected route for admin only
 */
export async function getFoodBankStaff(req, res) {
  logger.info(`in getFoodBankStaff`);
  const id = Number(req.params.id);
  try {
    const staff = await fbQueries.getFoodBankStaff(id, req.query?.role);
    logger.info("fb staff: ", staff);

    res.status(200).json({ data: staff });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    } else {
      throw new AppError(
        "Failed to get the indicated food bank's staff",
        500,
        error,
      );
    }
  }
}

export async function createFoodBank(req, res) {
  logger.info("in createFoodBank");
  const authUserId = req.user.id;
  try {
    const foodbank = await fbQueries.addNewFoodBank(
      Number(authUserId),
      req.body,
    );
    if (foodbank) {
      res.send(201).json({ data: foodbank });
    } else {
      throw new AppError("Failed to create a new food bank");
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    } else {
      throw new AppError("Failed to create food bank record", 500, error);
    }
  }
}
