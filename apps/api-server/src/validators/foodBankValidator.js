import { param, query } from "express-validator";

import logger from "../utils/logger.js";

import * as fbQueries from "../db/foodBankQueries.js";

/*
import { AppError } from "../errors/AppError.js";
import { ValidationError } from "../errors/ValidationError.js";
*/

export const checkFoodBankId = [
  param("id")
    .trim()
    .notEmpty()
    .isInt()
    .withMessage("The food bank id should be an int")
    .bail()
    .toInt()
]

export const checkLimit = [
  query("limit").optional()
    .customSanitizer((value = 10) => {
      const limit = Number(value);
      switch (limit) {
        case (limit < 1):
          return 1;
        case (limit > 50):
          return 50;
        case (isNaN(limit)):
          return 10;
        default:
          return limit;
      }
  })
]

export const checkOffset = [
  query("offset").optional().customSanitizer(value => {
    const offset = Number(value);
    const ret = value ? (isNaN(offset) ? 0 : offset) : 0;
    return ret;
  }),
]

/**
 * tries to confirm the authenticated user is an admin
 * 
 * @param {*} req 
 * @param {*} _res 
 * @param {*} next 
 */
export function checkAdmin(req, _res, next) {
  const userId = req.user.id;
  logger.info("in checkAdmin: " + userId);
  // get the foodbank's admin id to compare it against the authenticated user's id

  next();
}