import * as userQueries from "../db/userQueries.js";
import { body, param, checkExact } from "express-validator";

import ValidationError from "../errors/ValidationError.js";
import AuthError from "../errors/AuthError.js";

import logger from "../utils/logger.js";

// needed to compare hashed passwords
import bcrypt from "bcrypt";

/**
 *
 * @param {*} optional
 * @param {*} isParam is true if the uid is in the route params, otherwise it is assumed it is in the body
 */
const checkUserId = (isParam) => {
  const ch1 = isParam ? param("uid") : body("uid");
  return ch1
    .trim()
    .notEmpty()
    .withMessage("A user id is required to complete the request.")
    .bail()
    .custom(async (value) => {
      logger.info(`try to validate if the user id exists: ${value}`);
      try {
        const userRow = await userQueries.getUserById(value);

        logger.info("user row found: ", userRow);
        if (!userRow) {
          throw new Error("This user id is invalid.");
        } else {
          return true;
        }
      } catch (error) {
        logger.error(error, { stack: error.stack });
        throw error;
      }
    });
};

const checkUsername = (optional, unique = true) => {
  let ch1 = body("username").trim();
  ch1 = optional ? ch1.optional({ checkFalsy: true }) : ch1;
  return ch1
    .notEmpty()
    .withMessage("A username is required.")
    .bail()
    .isLength({ min: 1, max: 25 })
    .withMessage("Usernames need to be between 1 and 25 characters long.")
    .custom(async (value, { req }) => {
      if (unique) {
        logger.info(`try to validate if the username is unique: ${value}`);
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
          logger.error(error, { stack: error.stack });
          throw error;
        }
      } else {
        // confirm the user name exists only for login purposes
        try {
          const userRow = await userQueries.getUserByUsername(value);

          logger.info("user row from db: ", userRow);
          if (!userRow) {
            throw new Error("Failed to find this username");
          } else {
            return true;
          }
        } catch (error) {
          logger.error(error, { stack: error.stack });
          throw error;
        }
      }
    });
};

const checkEmail = (optional) => {
  let ch1 = body("email").trim();
  ch1 = optional ? ch1.optional({ checkFalsy: true }) : ch1;
  return ch1
    .notEmpty()
    .withMessage("An email is required.")
    .isEmail()
    .withMessage("Provide a valid email address.")
    .bail()
    .custom(async (value, { req }) => {
      logger.info(`try to validate if the email is unique: ${value}`);
      try {
        const userRow = optional
          ? await userQueries.findOtherUser(req.user.id, value)
          : await userQueries.getUserByEmail(value);

        logger.info("user row found: ", userRow);
        if (userRow) {
          throw new Error(
            optional
              ? "This email address cannot be used"
              : "This email has already been registered. You must login instead.",
          );
        } else {
          return true;
        }
      } catch (error) {
        logger.error(error, { stack: error.stack });
        throw error;
      }
    });
};

// user for user password updates (protected path)
const validateOldPassword = () => {
  const oldPwdChk = body("old-password").trim();
  const newPwdChk = body("new-password").trim();
  // if someone provides this, we need to make sure it matches
  return oldPwdChk
    .if(newPwdChk.exists().notEmpty())
    .notEmpty()
    .withMessage("You must provide an old-password")
    .bail()
    .custom(async (value, { req }) => {
      logger.info("in the old-password custom check");
      if (req.user) {
        try {
          const res = await userQueries.getUserPasswordById(req.user.id);
          if (!res) {
            logger.warn("the user's username is not in the db");
            throw new AuthError("Unknown user.");
          }
          // confirm password match?
          const match = await bcrypt.compare(value, res["user_password"]);
          if (!match) {
            // passwords do not match!
            logger.warn("it's the wrong password");
            throw new ValidationError("Old password does not match.");
          }
        } catch (error) {
          logger.error(error);
          throw error;
        }
      } else {
        throw new ValidationError("Unknown or unauthenticated user.");
      }
    })
    .bail()
    .customSanitizer(async (value) => {
      logger.info("sanitizing the old-password value with bcrypt");
      return await bcrypt.hash(value, Number(process.env.HASH_SALT));
    });
};

const checkPassword = (optional, paramName = "new-password") => {
  let ch1 = body(paramName).trim();
  ch1 = optional ? ch1.optional() : ch1;
  return ch1
    .notEmpty()
    .withMessage("A password is required.")
    .bail()
    .isLength({ min: 8 })
    .withMessage(
      "A minimum length of 8 characters is needed for the password. Ideally, aim to use 15 characters at least.",
    )
    .hide("*****")
};

const checkNewPassword = (optional, paramName = "new-password") => {
  const ch1 = body(paramName).trim();
  const confirmPwdChk = body("confirm-password").trim();
  return ch1
    .if(confirmPwdChk.exists().notEmpty())
    .notEmpty()
    .withMessage("A password is required.")
    .bail()
    .isLength({ min: 8 })
    .withMessage(
      "A minimum length of 8 characters is needed for the password. Ideally, aim to use 15 characters at least.",
    )
    .hide("*****");
};

const checkPasswordConfirmation = () => {
  const ch1 = body("confirm-password")
    .if(body("new-password").notEmpty())
    .trim();
  return ch1
    .notEmpty()
    .withMessage("A password confirmation is required.")
    .bail()
    .custom((value, { req }) => {
      if (value !== req.body["new-password"]) {
        throw new Error(
          "The password confirmation must match the password value.",
        );
      } else {
        return true;
      }
    })
    .hide("*****");
};

// used when accessing the user's own projects or comments
export const validateUserId = [checkUserId(true)];

// used for user updates
export const validateUserSignupFields = [
  checkExact(
    [
      checkEmail(true),
      checkUsername(true),
      checkPassword(true),
      checkPasswordConfirmation(),
    ],
    {
      message: "Unexpected fields were specified.",
    },
  ),
];

// used for user updates
export const validateOptionalUserFields = [
  checkEmail(true),
  checkUsername(true),
  validateOldPassword(),
  checkNewPassword(true),
  checkPasswordConfirmation(),
];

export const bodyExists = (req, res, next) => {
  logger.info("validation body:", Object.keys(req.body));

  if (!req.body || Object.keys(req.body).length === 0) {
    return next(new ValidationError("Request missing required body fields"));
  }

  next();
};

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
      message: "Unexpected fields were specified.",
    },
  ),
];

// used for logging in a  user
export const validateUserLoginFields = [
  checkExact(
    [
      checkUsername(false, false),
      body("password").notEmpty().withMessage("A password is required."),
      // we don't really validate the password at this point for login as we just compare it to the correct one later
    ],
    {
      message: "Unexpected fields were specified.",
    },
  ),
];
