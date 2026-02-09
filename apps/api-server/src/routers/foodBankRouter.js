// Routes belonging to /foodbank

import { Router } from "express";

import passport from "passport";

import * as fbController from "../controllers/foodBankController.js";

import { handleExpressValidationErrors } from "./routerUtil.js";

const foodBankRouter = Router();

import * as fbValidator from "../validators/foodBankValidator.js";

//import AuthError from "../errors/AuthError.js";

// this route is not protected and will list only public data
foodBankRouter.route("/").get(
  fbValidator.checkLimit,
  fbValidator.checkOffset,
  fbController.getFoodBank,
);


const silentAuth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err) {
      return next(err); // Handle actual server/runtime errors
    }

    if (user) {
      // Manual assignment: Passport doesn't do this automatically in a callback
      req.user = user;
    }

    // Always call next() to proceed to the route handler,
    // regardless of whether authentication succeeded or failed.
    next();
  })(req, res, next);
};

// this route is protected. If the current user is an admin it will provide all the available details about the foodbank
// including a list the admin's id and username (a separate query is needed to get the foodbank staff or hours)
foodBankRouter.get(
  "/:id",
  fbValidator.checkFoodBankId,
  handleExpressValidationErrors,
  silentAuth,
  fbController.getFoodBankDetails,
);

foodBankRouter.get(
  "/:id/hours",
  fbValidator.checkFoodBankId,
  handleExpressValidationErrors,
  fbController.getFoodBankHours
);
   
  // foodBankRouter.get("/:id/staff)
   
export default foodBankRouter;
