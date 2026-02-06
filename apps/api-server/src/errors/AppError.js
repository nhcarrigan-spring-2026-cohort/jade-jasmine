export default class AppError extends Error {
  constructor(message, statusCode = 500, cause) {
    super(message, { cause });
    this.statusCode = statusCode;
    this.stackTrace = this.stack;
    this.timestamp = new Date().toUTCString();

    // So the error is neat when stringified. AppError: message instead of Error: message
    this.name = "AppError";

        // If there is a cause with a stack, append it
    if (cause && cause.stack) {
      this.stack += `\nCaused by: ${cause.stack}`;
    }

  }
}

