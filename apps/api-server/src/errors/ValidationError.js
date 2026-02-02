import { AppError } from "./AppError.js";

// the details is an array of errors (an accumulation of all of them)
export class ValidationError extends AppError {
  constructor(message, details=[]) {
    super(message, 400);
    this.details = details; // Additional validation details
  }
}
