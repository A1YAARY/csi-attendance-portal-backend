const { ACCESS_ROLES } = require("./roleConstants");

class AccessManagement {
  static allowAccess(allowedRoles = [], options = {}) {
    return (req, res, next) => {
      try {
        const { strict = false } = options;
        

        const currentUser = res.locals.user;
        console.log("CURRENT USER:", currentUser);
      console.log("ROLE:", userRole);
      console.log("ALLOWED ROLES:", allowedRoles);

if (!currentUser) {
  return res.status(401).json({ message: "Unauthorized" });
}

const userRole = currentUser?.role;

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

  static checkIfAccessGrantedOrThrowError(allowedRoles = [], userInfo = {}) {
  const { roles } = userInfo;

  console.log("USER ROLES:", roles);
  console.log("ALLOWED ROLES:", allowedRoles);

  if (!roles || roles.length === 0) {
    throw new Error("Unauthorized");
  }

  // extract role names
  const roleNames = roles.map(r => r.role_name);

  // allow ALL
  if (allowedRoles.includes(ACCESS_ROLES.ALL)) {
    return true;
  }

  // SUPER ADMIN override
  if (roleNames.includes(ACCESS_ROLES.ACCOUNT_SUPER_ADMIN)) {
    return true;
  }

  const hasAccess = roleNames.some(role =>
    allowedRoles.includes(role)
  );

  if (!hasAccess) {
    const err = new Error("Forbidden - Insufficient permissions");
    err.statusCode = 403;
    throw err;
  }
  
  return true;
}
  
}

module.exports = AccessManagement;