import AppError from "../errors/AppError.js";
import AuthError from "../errors/AuthError.js";
import * as userQueries from "../db/userQueries.js";
import logger from "../utils/logger.js";

// needed to hash the password value
import bcrypt from "bcrypt";

// needed to authenticate the requests
import jwt from "jsonwebtoken";

//import "dotenv/config";
import { env } from "node:process";

export async function signUp(req, res) {
  logger.info("trying to signUp");
  const hashedPassword = await bcrypt.hash(
    req.body["new-password"],
    Number(env.HASH_SALT),
  );
  const { username, email } = req.body;
  try {
    const newUser = await userQueries.addNewUser(
      username,
      email,
      hashedPassword,
    );

    if (newUser) {
      req.user = newUser; // maybe i don't need this?
      res.status(201).json({ data: newUser });
    } else {
      throw new AppError("Failed to create the new user record.", 500);
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    } else {
      throw new AppError("Failed to update the user record", 500, error);
    }
  }
}

/**
 * gets the user record for the currently authenticated user
 * @param {} req
 * @param {*} res
 */
export async function getUser(req, res) {
  logger.info("in getUser:");

  const authUserId = req.user.id;
  try {
    const user = await userQueries.getUserById(authUserId);

    if (user) {
      res.status(201).json({ data: user });
    } else {
      throw new AppError("Failed to find the user.", 500);
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    } else {
      throw new AppError("Failed to get the user record", 500, error);
    }
  }
}

export async function login(req, res) {
  logger.info(`trying to login: ${req.body.username}`);
  try {
    const user = await userQueries.getUserPassword(req.body.username);
    if (!user) {
      logger.warn("the user's username is not in the db");
      throw new AuthError("Incorrect username or password.");
    }
    // confirm password match?
    const match = await bcrypt.compare(
      req.body.password,
      user["user_password"],
    );
    if (!match) {
      // passwords do not match!
      logger.warn("it's the wrong password");
      throw new AuthError("Incorrect username or password.");
    }
    const token = jwt.sign(
      {
        expiresIn: "48h",
        sub: user.id,
      },
      env.JWT_SECRET,
    );
    logger.info("sending back a token");
    res.set({ Authorization: `Bearer ${token}` });
    res.set("Access-Control-Expose-Headers", "Authorization");

    const { id, username, email } = user; // can't send the whole user back as it contains the pwd
    res.status(204).json({
      data: { id, username, email },
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    } else {
      throw new AppError("Failed to login", 500, error);
    }
  }
}

export async function updateUser(req, res) {
  // if user wants to change the password, we need to re-hash it before storing it
  // other values the user may change are: email/username

  const user = req.user;
  logger.info(`userController.updateUser: `, user);
  logger.info("req.body", Object.keys(req.body));
  const userDetails = { ...req.body };
  if (Object.hasOwn(userDetails, "confirm-password")) {
    delete userDetails["confirm-password"];
    delete userDetails["old-password"];
  }
  let updatedUser = null;
  if (req.body["email"] || req.body["username"]) {
    try {
      updatedUser = await userQueries.updateUser(Number(user.id), userDetails);
      //logger.info("updatedUser: ", updatedUser.rows);
      if (!updatedUser) {
        throw new AppError("Failed to update the user record", 500);
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      } else {
        logger.error("UpdateUser failed:", error.stack || error);

        throw new AppError(
          "Unexpected error during update of the user record",
          500,
          error,
        );
      }
    }
  }
  if (req.body["new-password"]) {
    const hashedPassword = await bcrypt.hash(
      req.body["new-password"],
      Number(env.HASH_SALT),
    );
    // update the password
    logger.info("about to update the user password for: " + user.username);
    try {
      const row = await userQueries.updateUserPwd(
        Number(user.id),
        hashedPassword,
      );

      if (row) {
        updatedUser = user; //just return the same user record since we actually changed the password table not the user table
      } else {
        logger.error("the row we failed to update: ", row);
        throw new AppError("Failed to update the user password record", 500);
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      } else {
        throw new AppError(
          "Unexpected error during update of the user password record",
          500,
          error,
        );
      }
    }
  }

  res.status(200).json({ data: updatedUser });
}
