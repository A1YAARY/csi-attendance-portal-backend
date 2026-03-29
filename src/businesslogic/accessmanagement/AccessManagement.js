const { ACCESS_ROLES } = require("./roleConstants");
const { USER_ROLES_INFO } = require("../../models/libs/seedConstants");
const { DB_TABLE } = require("../../models/libs/dbConstants");
const AccessPermissionError = require("../../errorhandlers/AccessPermissoinError")


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

        if (
            allowedRoles.includes(ACCESS_ROLES.ADMIN) &&
            roleNames.includes(USER_ROLES_INFO.ADMIN.NAME)
        ) {
            return true;
        }

        if (
            allowedRoles.includes(ACCESS_ROLES.SUPER_ADMIN) &&
            roleNames.includes(USER_ROLES_INFO.SUPER_ADMIN.NAME)
        ) {
            return true;
        }


        throw new AccessPermissionError();
    }
}

module.exports = AccessManagement;
