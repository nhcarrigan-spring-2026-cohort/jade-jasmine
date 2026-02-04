import { AppError } from "../errors/AppError.js";
import { AuthError } from "../errors/AuthError.js";
import * as gameSetup from "../db/queries.js";

// needed to hash the password value
import bcrypt from "bcrypt";

// needed to authenticate the requests
const jwt = require("jsonwebtoken");

import "dotenv/config";
import { env } from "node:process";

async function login(req, res) {
  console.log("in login: ", req.body);
  try {
    // TODO add validation and sanitization and then use the santized value?
    const user = await gameSetup.getUserPassword(req.body.username);
    if (!user) {
      console.log("the user's username is not in the db");
      throw new AuthError("Incorrect username or password.");
    }
    // confirm password match?
    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) {
      // passwords do not match!
      console.log("it's the wrong password");
      throw new AuthError("Incorrect username or password.");
    }
    const token = jwt.sign(
      {
        exp: "24h",
        sub: user.id,
      },
      env.JWT_SECRET,
    );

    res.set({ Authorization: `Bearer ${token}` });
    res.set("Access-Control-Expose-Headers", "Authorization");

    res
      .status(201)
      .json({
        status: "success",
        message: "Login successful.",
        userid: user.id,
      });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    } else {
      throw new AppError("Failed to update the user record", 500, error);
    }
  }
}