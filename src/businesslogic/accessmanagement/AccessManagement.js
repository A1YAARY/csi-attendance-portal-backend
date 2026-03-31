const { ACCESS_ROLES } = require("./roleConstants");

class AccessManagement {
  static allowAccess(allowedRoles = [], options = {}) {
    return (req, res, next) => {
      try {
        const { strict = false } = options;

        if (!req.user) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        const userRole = req.user.role;

        // Allow all
        if (allowedRoles.includes(ACCESS_ROLES.ALL)) {
          return next();
        }

        // SUPER_ADMIN override
        if (!strict && userRole === ACCESS_ROLES.ACCOUNT_SUPER_ADMIN) {
          return next();
        }

        if (!allowedRoles.includes(userRole)) {
          return res.status(403).json({
            message: "Forbidden - Insufficient permissions",
          });
        }

        next();
      } catch (err) {
        return res.status(500).json({
          message: "Access control error",
          error: err.message,
        });
      }
    };
  }
}

module.exports = AccessManagement;