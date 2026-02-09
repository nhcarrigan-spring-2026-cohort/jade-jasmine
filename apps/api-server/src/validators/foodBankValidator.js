import { param, query } from "express-validator";

/*
import * as fbQueries from "../db/foodBankQueries.js";
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