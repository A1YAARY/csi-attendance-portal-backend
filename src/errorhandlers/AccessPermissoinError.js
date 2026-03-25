const AppError = require("./AppError");
const { ERROR_STATUS_CODES } = require("./constants");

class AccessPermissionError extends AppError {
  constructor(message = "Access denied") {
    super(null, ERROR_STATUS_CODES.FORBIDDEN, message);
    this.name = this.constructor.name;
  }
}

module.exports = AccessPermissionError;