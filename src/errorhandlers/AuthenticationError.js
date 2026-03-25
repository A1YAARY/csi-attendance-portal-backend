const AppError = require("./AppError");
const { ERROR_STATUS_CODES } = require("./constants");

class AuthenticationError extends AppError {
  constructor(message = "Authentication failed") {
    super(null, ERROR_STATUS_CODES.UNAUTHORIZED, message);
    this.name = this.constructor.name;
  }
}

module.exports = AuthenticationError;