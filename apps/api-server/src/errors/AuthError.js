import AppError from "./AppError.js";

export default class AuthError extends AppError {
  constructor(message='Cannot verify credentails.') {
    super(message, 401);
  }
}
