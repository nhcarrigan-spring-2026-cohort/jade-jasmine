import { param, query } from "express-validator";

import logger from "../utils/logger.js";

import * as fbQueries from "../db/foodBankQueries.js";

import AppError from "../errors/AppError.js";
import ValidationError from "../errors/ValidationError.js";

export const checkFoodBankId = [
  param("id")
    .trim()
    .notEmpty()
    .isInt()
    .withMessage("The food bank id should be an int")
    .bail()
    .toInt(),
];

export const checkLimit = [
  query("limit")
    .optional()
    .customSanitizer((value = 10) => {
      const limit = Number(value);
      switch (limit) {
        case limit < 1:
          return 1;
        case limit > 50:
          return 50;
        case isNaN(limit):
          return 10;
        default:
          return limit;
      }
    }),
];

export const checkOffset = [
  query("offset")
    .optional()
    .customSanitizer((value) => {
      const offset = Number(value);
      const ret = value ? (isNaN(offset) ? 0 : offset) : 0;
      return ret;
    }),
];
/*
{
  "0": {
    "enumlabel": "admin"
  },
  "1": {
    "enumlabel": "staff"
  },
  "2": {
    "enumlabel": "volunteer"
  }
}
  */
export async function checkRole(req, _res, next) {
  logger.info("in checkRole: ", req.query.role)
  if (req.query.role) {
    try {
      const roles = await fbQueries.getAllRoles();
      logger.info("all roles found: ", roles)
    
      // check that the query(role) matches one of the enumerated roles we have
      const foundRole = Object.values(roles).reduce((acc, curr) => {
        return acc || (curr.enumlabel === req.query.role)
      }, false)
      
      if (!foundRole) {
        throw new ValidationError("Cannot recognize this role value.")
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      } else {
        throw new AppError("Failed to get the list of staff roles", 500, error);
      }
    }
  }
  next();
}

/**
 * tries to confirm the authenticated user is an admin
 *
 * @param {*} req
 * @param {*} _res
 * @param {*} next
 */
export async function checkAdmin(req, _res, next) {
  const authUserId = req.user.id;
  logger.info("in checkAdmin: " + authUserId);
  // get the foodbank's admin id to compare it against the authenticated user's id
  try {
    const foodbank = await fbQueries.getFoodBankById(authUserId);
    if (Number(foodbank.admin) !== authUserId) {
      throw new ValidationError(
        "This user is not this food bank's administrator.",
      );
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    } else {
      throw new AppError("Failed to get the food bank admin id", 500, error);
    }
  }
  next();
}
