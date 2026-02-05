
import * as userQueries from "../db/queries.js";
import { body, param, checkExact } from "express-validator";

import logger from "../utils/logger.js";

/**
 * 
 * @param {*} optional 
 * @param {*} isParam is true if the uid is in the route params, otherwise it is assumed it is in the body
 */
const checkUserId = (isParam) => {
  const ch1 = isParam ? param('uid') : body('uid');
  return ch1.trim().notEmpty().withMessage("A user id is required to complete the request.")
    .custom( async (value) => {
    
    logger.info("try to validate if the user id exists: ", value);
    try {
      const userRow = await userQueries.getUserById(value);

      logger.info("user row found: ", userRow);
      if (!userRow) {
        throw new Error(
          "This user id is invalid."
        );
      } else {
        return true;
      }
    } catch (error) {
      logger.error(error, { stack: error.stack });
      throw error;
    }
  })
}

const checkUsername = (optional) => {
  let ch1 = body("username").trim();
  ch1 = optional ? ch1.optional({ checkFalsy: true }) : ch1;
  return ch1
    .notEmpty()
    .withMessage("A username is required.")
    .isLength({ min: 1, max: 25 })
    .withMessage("Usernames need to be between 1 and 25 characters long.")
    .custom(async (value, { req }) => {
      logger.info("try to validate if the username is unique: ", value);
      try {
        const userRow = optional
          ? await userQueries.findOtherUserByUsername(req.user.id, value)
          : await userQueries.getUserByUsername(value);

        logger.info("user row found: ", userRow);
        if (userRow) {
          throw new Error(
            optional
              ? "This username cannot be used"
              : "This username has already been registered. You must login instead.",
          );
        } else {
          return true;
        }
      } catch (error) {
        logger.error(error, {stack: error.stack})
        throw error;
      }
    });
}

const checkEmail = (optional) => {
  let ch1 = body('email').trim();
  ch1 = optional ? ch1.optional({ checkFalsy: true }) : ch1;
  return ch1
  .notEmpty()
  .withMessage("An email is required.")
  .isEmail()
  .withMessage("Provide a valid email address.")
  .custom(async (value, {req}) => {
    logger.info("try to validate if the email is unique: ", value);
    try {

      const userRow = optional ? await userQueries.findOtherUser(req.user.id, value) : await userQueries.getUserByEmail(value);
      
      logger.info("user row found: ", userRow);
      if (userRow) {
        throw new Error(
          optional ? "This email address cannot be used" : "This email has already been registered. You must login instead."
        );
      } else {
        return true;
      }
    } catch (error) {
        logger.error(error, { stack: error.stack });
      throw error;
    }
  })
}


const checkPassword = (optional, paramName="new-password") => {
  let ch1 = body(paramName).trim()
  ch1 = optional ? ch1.optional() : ch1;
  return ch1
  .notEmpty()
  .withMessage("A password is required.")
  .isLength({ min: 8 })
  .withMessage(
    "A minimum length of 8 characters is needed for the password. Ideally, aim to use 15 characters at least."
  )
  .hide("*****");
}

const checkPasswordConfirmation = () => {
  const ch1 = body("confirm-password").if(body("new-password").notEmpty()).trim();
  return ch1
  .notEmpty()
  .withMessage("A password confirmation is required.")
  .custom((value, { req }) => {
    if (value !== req.body['new-password']) {
      throw new Error(
        "The password confirmation must match the password value."
      );
    } else {
      return true;
    }
  })
  .hide('*****');
}

// used when accessing the user's own projects or comments
export const validateUserId = [
  checkUserId(true),
]

// used for user updates
export const validateOptionalUserFields = [
  checkExact(
    [
      checkEmail(true),
      checkUsername(true),
      checkPassword(true),
      checkPasswordConfirmation(),
    ],
    {
      message: "Too many fields specified.",
    }
  ),
];

// used for creating a new user
export const validateUserFields = [
  checkExact(
    [
      checkEmail(false),
      checkUsername(false),
      checkPassword(false),
      checkPasswordConfirmation(),
    ],
    {
      message: "Too many fields specified.",
    }
  ),
];

// used for logging in a  user
export const validateUserLoginFields = [
  checkExact(
    [
      checkUsername(false),
      body("password").notEmpty().withMessage("A password is required."),
      // we don't validate the password at this point for login as we just compare it to the correct one later
    ],
    {
      message: "Too many fields specified.",
    },
  ),
];
