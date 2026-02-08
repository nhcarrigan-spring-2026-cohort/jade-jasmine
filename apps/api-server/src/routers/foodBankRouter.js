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
  (req, res, next) => {
    const limit = Number(req.query?.limit);
    if (!limit) {
      req.limit = 10;
    } else {
      if (limit > 50) {
        req.limit = 50;
      } else if (limit < 1) {
        req.limit = 1;
      } else {
        req.limit = limit;
      }
    }
    next();
  },
  (req, res, next) => {
    let offset = Number(req.query?.offset);
    if (!offset || isNaN(offset)) {
      offset = 0;
    } else {
      if (offset < 0) {
        offset = 0;
      }
    }
    req.offset = offset;
    next();
  },
  fbController.getFoodBank,
);

// this route is protected. If the current user is an admin it will provide all the available details about the foodbank
// including a list the admin's id and username (a separate query is needed to get the foodbank staff or hours)
foodBankRouter.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  fbValidator.checkFoodBankId,
  handleExpressValidationErrors,
  fbController.getFoodBankDetails,
);

/**
   foodBankRouter.get("/:id/hours)
   
   foodBankRouter.get("/:id/staff)
   */
export default foodBankRouter;
