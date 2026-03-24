const AppError = require("./AppError");
const { ERROR_STATUS_CODES } = require("./constants");

class DatabaseError extends AppError {
  constructor(e) {
    if (e && typeof e === "string") {
      e = new Error(e);
    }

    let message = e?.message || "Database error occurred";
    let statusCode = ERROR_STATUS_CODES.INTERNAL_SERVER_ERROR;

    // 🔹 Handle common PostgreSQL errors
    if (e?.code) {
      switch (e.code) {
        case "23505": // unique violation
          statusCode = 409;
          message = "Duplicate entry already exists";
          break;

        case "23503": // foreign key violation
          statusCode = ERROR_STATUS_CODES.BAD_REQUEST;
          message = "Invalid reference to related resource";
          break;

        case "23502": // not null violation
          statusCode = ERROR_STATUS_CODES.BAD_REQUEST;
          message = "Missing required field";
          break;

        default:
          statusCode = ERROR_STATUS_CODES.INTERNAL_SERVER_ERROR;
          message = "Database error occurred";
      }
    }

    super(e, statusCode, message);

    this.name = this.constructor.name;

    if (process.env.NODE_ENV === "development") {
      console.error("DatabaseError:", e?.message);
    }
  }
}

module.exports = DatabaseError;