class LogUtilities {

  // 🔹 Generic log
  static createLog(message, data = null) {
    console.log("📘 LOG:", {
      message,
      ...(data && { data }),
      timestamp: new Date().toISOString(),
    });
  }

  // 🔹 Info log
  static info(message, data = null) {
    console.log("ℹ️ INFO:", {
      message,
      ...(data && { data }),
      timestamp: new Date().toISOString(),
    });
  }

  // 🔹 Warning log
  static warn(message, data = null) {
    console.warn("⚠️ WARN:", {
      message,
      ...(data && { data }),
      timestamp: new Date().toISOString(),
    });
  }

  // 🔹 Error log
  static error(message, error = null) {
    console.error("❌ ERROR:", {
      message,
      error: error?.message || error,
      stack: error?.stack || null,
      timestamp: new Date().toISOString(),
    });
  }

  // 🔹 Request log (useful in routeWrapper)
  static request(req) {
    console.log("🌐 REQUEST:", {
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      params: req.params,
      query: req.query,
      timestamp: new Date().toISOString(),
    });
  }

  // 🔹 Response log
  static response(req, res, data = null) {
    console.log("📤 RESPONSE:", {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      ...(data && { data }),
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = LogUtilities;