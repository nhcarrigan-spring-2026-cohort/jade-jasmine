import AppError from "../errors/AppError.js";
import AuthError from "../errors/AuthError.js";
import * as userQueries from "../db/queries.js";
import logger from "../utils/logger.js";

// needed to hash the password value
import bcrypt from "bcrypt";

// needed to authenticate the requests
import jwt from "jsonwebtoken";

import "dotenv/config";
import { env } from "node:process";

export async function signUp(req, res) {
  logger.info("trying to signUp")
  const hashedPassword = await bcrypt.hash(
    req.body['new-password'],
    Number(env.HASH_SALT)
  );
  const { username, email } = req.body;
  try {
    const newUser = await userQueries.addNewUser(
      username,
      email,
      hashedPassword,
    );

    if (newUser) {
      req.user = newUser;
      res.status(201).json({ data: newUser });
    } else {
      throw new AppError("Failed to create the new user record.", 500)
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    } else {
      throw new AppError("Failed to update the user record", 500, error);
    }
  }
}

export async function login(req, res) {
  logger.info("trying to login: ", req.body.username);
  try {
    const user = await userQueries.getUserPassword(req.body.username);
    if (!user) {
      logger.warn("the user's username is not in the db");
      throw new AuthError("Incorrect username or password.");
    }
    // confirm password match?
    const match = await bcrypt.compare(req.body.password, user['user_password']);
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

    res.set({ Authorization: `Bearer ${token}` });
    res.set("Access-Control-Expose-Headers", "Authorization");

    const { id, username, email } = user; // can't send the whole user back as it contains the pwd
    res
      .status(201)
      .json({
        data: { id, username, email }
      });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    } else {
      throw new AppError("Failed to login", 500, error);
    }
  }
}