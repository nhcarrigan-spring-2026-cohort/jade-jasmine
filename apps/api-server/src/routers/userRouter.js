// Routes belonging to /user 

import { Router } from "express";

import passport from "passport";


import {
  signUp,
  login
  /* TODO
  getUser,
  updateUser,
  deleteUser,
  */
} from "../controllers/userController.js";


import { handleExpressValidationErrors } from "./routerUtil.js";


const userRouter = Router();


import * as userValidator from "../validators/userValidator.js";


import AuthError from "../errors/AuthError.js";

userRouter.get(
  "/authenticate",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const user = req.user;
    if (user) {
      res
        .status(200)
        .json({
          status: "success",
          message: "Authorization confirmed.",
          userid: user.id,
        });
    } else {
      throw new AuthError();
    }
  },
);


userRouter
  .route("/signup")
  .post(userValidator.validateUserFields, handleExpressValidationErrors, signUp);


userRouter
  .route("/login")
  .post(
    userValidator.validateUserLoginFields,
    handleExpressValidationErrors,
    login,
  );

/*
// note that we retrieve the user id from the jwt token so we don't need it specified in the route
userRouter
  .route("/")
  .get(
    passport.authenticate("jwt", { session: false }),
    validateOptionalUserFields,
    handleExpressValidationErrors,
    getUser,
  );
  /* TODO
  .put(
    passport.authenticate("jwt", { session: false }),
    validateOptionalUserFields,
    handleExpressValidationErrors,
    updateUser,
  )
  .delete(passport.authenticate("jwt", { session: false }), deleteUser);
  */

export default userRouter;