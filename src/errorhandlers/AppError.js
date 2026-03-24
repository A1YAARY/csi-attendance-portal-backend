class AppError extends Error {
  constructor(originalError, statusCode = 500, message = "Something went wrong") {
    super(message);

    this.name = "AppError";
    this.statusCode = statusCode;
    this.originalError = originalError;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;