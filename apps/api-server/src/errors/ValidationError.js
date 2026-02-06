import AppError from "./AppError.js";

// the details is an array of errors (an accumulation of all of them)
export default class ValidationError extends AppError {
  constructor(message, data=[]) {
    super(message, 400);
    this.data = data; // Additional validation details
  }
}
