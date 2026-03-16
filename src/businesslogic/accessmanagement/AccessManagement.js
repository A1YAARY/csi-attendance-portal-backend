const { ACCESS_ROLES } = require("./roleConstants");
const { USER_ROLES_INFO } = require("../../models/libs/seedConstants");
const { DB_TABLE } = require("../../models/libs/dbConstants");
const AccessPermissionError = require("../../errorhandlers/AccessPermissionError");

class AccessManagement {
    static checkIfAccessGrantedOrThrowError = (allowedRoles = [], { roles, organization }) => {
        // const roleName = role?.[DB_TABLE.ROLE.COLUMNS.NAME.KEY];
        const roleNames = [];
        if (roles && Array.isArray(roles)) {
            roles.forEach(role => {
                if (role && role['role_name']) {
                    roleNames.push(role['role_name']);
                }
            });
        }
        
        if (allowedRoles.includes(ACCESS_ROLES.ALL) || allowedRoles.includes(ACCESS_ROLES.ACCOUNT_SELF_MEMBER)) {
            return true;
        }

        if (allowedRoles.includes(ACCESS_ROLES.ACCOUNT_ADMIN) && roleNames.includes(USER_ROLES_INFO.ADMIN.NAME)) {
            return true;
        }

        if (allowedRoles.includes(ACCESS_ROLES.ACCOUNT_ORGANIZATION_ADMIN) && roleNames.includes(USER_ROLES_INFO.ORGANIZATION_ADMIN.NAME)) {
            if (organization[DB_TABLE.USER_ORGANIZATION.COLUMNS.IS_EMAIL_VERIFIED.KEY]) {
                return true;
            }
        }

        if (allowedRoles.includes(ACCESS_ROLES.ACCOUNT_SUPER_ADMIN) && roleNames.includes(USER_ROLES_INFO.SUPER_ADMIN.NAME)) {
            return true;
        }

        if (allowedRoles.includes(ACCESS_ROLES.ACCOUNT_CAPTAIN) && roleNames.includes(USER_ROLES_INFO.CAPTAIN.NAME)) {
            return true;
        }

        if (allowedRoles.includes(ACCESS_ROLES.EXPO_BIB_MARKING) && roleNames.includes('expo_bib_marking')) {
            return true;
        }

        if (allowedRoles.includes(ACCESS_ROLES.EXPO_OTHER_UTILITY) && roleNames.includes('expo_other_utility')) {
            return true;
        }

        if (allowedRoles.includes(ACCESS_ROLES.EXPO_FINANCE) && roleNames.includes('expo_finance')) {
            return true;
        }
        if (allowedRoles.includes(ACCESS_ROLES.EXPO_SELF_SPOT_REGISTRATION) && roleNames.includes('expo_self_spot_registration')) {
            return true;
        }

        throw new AccessPermissionError();
    }
}

module.exports = AccessManagement;
