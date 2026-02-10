import { body, param, query } from "express-validator";

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

export async function checkRole(req, _res, next) {
  logger.info("in checkRole: ", req.query.role);
  if (req.query.role) {
    try {
      const roles = await fbQueries.getAllRoles();
      logger.info("all roles found: ", roles);

      // check that the query(role) matches one of the enumerated roles we have
      const foundRole = Object.values(roles).reduce((acc, curr) => {
        return acc || curr.enumlabel === req.query.role;
      }, false);

      if (!foundRole) {
        throw new ValidationError("Cannot recognize this role value.");
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

const checkName = () => {
  return body("name")
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty")
    .bail()
    .isLength({ max: 75 })
    .withMessage("Name cannot exceed 75 characters in length")
};

const checkCity = () => {
  return body("city")
    .trim()
    .notEmpty()
    .withMessage("City must be provided")
    .bail()
    .isLength({ max: 20 })
    .withMessage("City cannot exceed 20 characters in length")
};

const checkProvince = () => {
  return body("province")
    .trim()
    .notEmpty()
    .withMessage("Province must be provided")
    .bail()
    .isLength({ max: 20 })
    .withMessage("Province cannot exceed 20 characters in length")
};

const checkCountry = () => {
  return body("country")
    .trim()
    .notEmpty()
    .withMessage("Country must be provided")
    .bail()
    .isLength({ max: 20 })
    .withMessage("Country cannot exceed 20 characters in length")
};

const checkStreet = () => {
  return body("street")
    .trim()
    .notEmpty()
    .withMessage("Street must be provided")
    .bail()
    .isLength({ max: 50 })
    .withMessage("Street cannot exceed 50 characters in length")
};

const checkWebsite = () => {
  return body("website")
    .trim()
    .optional()
    .isURL()
    .withMessage("The website address does not appear to be valid")
};

const checkEmail = () => {
  return body("email")
    .trim()
    .optional()
    .isEmail()
    .withMessage("Provide a valid email address.")
};

const checkDesc = () => {
  return body("description")
    .trim()
    .optional()
    .isLength({ max: 150 })
    .withMessage("Description cannot exceed 150 characters in length");
};

const checkCharityNum = () => {
  return body('charity_no').trim()
  .optional().isLength({max: 30}).withMessage("Charity registration number cannot exceed 30 characters in length")
}

const checkUnitNo = () => {
  return body('unit_no').trim().optional()
  .isLength({max: 10}).withMessage("Unit no. cannot exceed 10 characters in length")
}

function isValidIANAZone(timeZone) {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timeZone });
    return true;
  // eslint-disable-next-line no-unused-vars
  } catch (e) {
    return false;
  }
}

const checkTimezone = () => {
  return body('timezone').trim().notEmpty().withMessage("Timezone is required").bail()
    .custom(value => {
      if (isValidIANAZone(value)) {
        return true;
      } else {
        throw new ValidationError("The timezone value is not a valid IANA zone")
    }
  })
}

const checkPhone = () => {
  return body('phone').trim().optional().isMobilePhone('any').withMessage("Phone number does not appear to be valid")
}

const checkFax = () => {
  return body('fax').trim().optional().isMobilePhone('any').withMessage("Fax number does not appear to be valid")
}

const checkPostalCode = () => {
  return body('postal_code').trim().notEmpty().withMessage("Postal code is required").bail()
  .isPostalCode('any').withMessage("Invalid postal code")
}
export const checkFoodBankFields = [
  checkName(),
  checkCity(),
  checkCountry(),
  checkProvince(),
  checkStreet(),
  checkWebsite(),
  checkEmail(),
  checkDesc(),
  checkUnitNo(),
  checkPhone(),
  checkFax(),
  checkCharityNum(),
  checkTimezone(),
  checkPostalCode(),
];
