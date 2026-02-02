import { validationResult } from "express-validator";
import { ValidationError } from "../errors/ValidationError.js";

export function handleExpressValidationErrors(req, res, next) {
  const errors = validationResult(req);

  console.error("validation ERRORS? ", errors);
  if (!errors.isEmpty()) {
    throw new ValidationError(
      "Action has failed due to some validation errors",
      errors.array(),
    );
  } else {
    next();
  }
}
