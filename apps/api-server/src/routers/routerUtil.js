import { validationResult } from "express-validator";
import ValidationError from "../errors/ValidationError.js";
import logger from "../utils/logger.js";

export function handleExpressValidationErrors(req, res, next) {
  const errors = validationResult(req);

  if (errors && errors.length > 0) {
    logger.info("validation ERRORS? ", errors);
  } else {
    logger.info("no validation errors recorded")
  }
  if (!errors.isEmpty()) {
    throw new ValidationError(
      "Action has failed due to some validation errors",
      errors.array(),
    );
  } else {
    next();
  }
}
