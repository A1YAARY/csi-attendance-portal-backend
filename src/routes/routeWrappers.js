const { RES_LOCALS, LOG_CONSTANTS } = require("./middlewares/constant");
const AccessManagement = require("../businesslogic/accessmanagement/AccessManagement");
const LogUtilities = require("./utilities/logUtilities");

const appWrapper = (callback, allowedRoles = null) => {
  return async (req, res, next) => {
    try {
      const userInfo = res.locals.user ?? {}; // ✅ FIX

      const { roles } = userInfo; // ✅ FIX
      req.user = userInfo;

      // 🔐 Role check
      if (allowedRoles && allowedRoles.length > 0) {
        AccessManagement.checkIfAccessGrantedOrThrowError(
          allowedRoles,
          { roles } // ✅ FIX
        );
      }

      await Promise.resolve(callback(req, res, next));

    } catch (e) {
      LogUtilities.createLog(
        LOG_CONSTANTS.ERROR.FILE_NAME,
        "Error",
        e
      );
      next(e);
    }
  };
};

const successResponseAppWrapper = (callback, allowedRoles = null) => {
  return async (req, res, next) => {
    try {
      const { roles = undefined, organization = undefined } =
        res.locals.user ?? {};

      if (allowedRoles && allowedRoles.length > 0) {
        AccessManagement.checkIfAccessGrantedOrThrowError(
          allowedRoles,
          { roles, organization }
        );
      }

      await Promise.resolve(callback(req, res, next));

      // ✅ prevent double response
      if (!res.headersSent) {
        res.json({
          status: "success"
        });
      }

    } catch (e) {
      LogUtilities.createLog(
        LOG_CONSTANTS.ERROR.FILE_NAME,
        "Error",
        e
      );

      next(e);
    }
  };
};

module.exports = {
    appWrapper,
    successResponseAppWrapper
};
