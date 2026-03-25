const AppError = require("./AppError");

class ErrorHandler {
  static handleError(err, req, res, next) {
    console.error("Error:", err);

    // ✅ Known application errors
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
      });
    }

    // ❌ Unknown errors
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = ErrorHandler;