import { param,query } from "express-validator";

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
  

export const checkOffset = [
  query("offset").customSanitizer(value => {
    const ret = value ? (isNaN(value) ? 0 : Number(value)) : 0;
    return ret;
  }),
]