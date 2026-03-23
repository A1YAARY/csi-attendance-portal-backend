const { RES_LOCALS, LOG_CONSTANTS } = require("./middlewares/constant");
const AccessManagement = require("../businesslogic/accessmanagement/AccessManagement");
const LogUtilities = require("./utilities/logUtilities");

const appWrapper = (callback, allowedRoles = []) => {
    return async (req, res, next) => {
        try {
            const { roles = undefined, organization = undefined } = res.locals[RES_LOCALS.USER_INFO.KEY] ?? {};
            AccessManagement.checkIfAccessGrantedOrThrowError(allowedRoles, { roles, organization });
            await callback(req, res, next);
        } catch (e) {
            LogUtilities.createLog(LOG_CONSTANTS.ERROR.FILE_NAME, "Error", e.toString());
            next(e);
        }
    };
};

const successResponseAppWrapper = (callback, allowedRoles = []) => {
    return async (req, res, next) => {
        try {
            const { roles = undefined, organization = undefined } = res.locals[RES_LOCALS.USER_INFO.KEY] ?? {};
            AccessManagement.checkIfAccessGrantedOrThrowError(allowedRoles, { roles, organization });
            await callback(req, res, next);
            res.json({
                "status": "success"
            });
        } catch (e) {
            LogUtilities.createLog(LOG_CONSTANTS.ERROR.FILE_NAME, "Error", e.toString());
            next(e);
        }
    };
};

module.exports = {
    appWrapper,
    successResponseAppWrapper
};
