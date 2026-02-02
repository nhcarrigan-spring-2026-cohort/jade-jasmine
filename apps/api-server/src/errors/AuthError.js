import { AppError } from "./AppError.js";

export class AuthError extends AppError {
  constructor(message='Cannot verify credentails.') {
    super(message, 401);
  }
}
