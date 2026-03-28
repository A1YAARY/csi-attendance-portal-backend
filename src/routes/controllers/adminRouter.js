const express = require("express");
const router = express.Router({ mergeParams: true });
const { appWrapper } = require("../routeWrappers");
const UserManager = require("../../businesslogic/managers/userManager");
const { ACCESS_ROLES } = require("../../businesslogic/accessmanagement/roleConstants");


router.get(
  "/allusers",
  appWrapper(async (req, res) => {
    const search = req.query.search || "";
    const organizationId = req.user.organization_id;

    const users = await UserManager.getAllUsersByOrganization(
      organizationId,
      search
    );

    if (!users || users.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: "No users found",
      });
    }

    return res.json({
      success: true,
      data: users,
    });
  }, [ACCESS_ROLES.ADMIN, ACCESS_ROLES.SUPER_ADMIN])
);

router.put(
  "/user/:id",
  appWrapper(async (req, res) => {
    const userId = parseInt(req.params.id);
    const updateData = req.body;
    const currentUser = req.user;

    const updatedUser = await UserManager.updateUserById(
      userId,
      updateData,
      currentUser
    );

    if (!updatedUser) {
  throw new AppError(
    null,
    ERROR_STATUS_CODES.RESOURCE_NOT_FOUND,
    "User not found or not allowed"
  );
}

    return res.json({
      success: true,
      data: updatedUser,
      message: "User updated successfully",
    });
  }, [ACCESS_ROLES.ADMIN, ACCESS_ROLES.SUPER_ADMIN])
);

router.delete(
  "/user/:id",
  appWrapper(async (req, res) => {
    const userId = parseInt(req.params.id);
    const currentUser = req.user;

    const isDeleted = await UserManager.deleteUserById(
      userId,
      currentUser
    );

    if (!isDeleted) {
  throw new AppError(
    null,
    ERROR_STATUS_CODES.RESOURCE_NOT_FOUND,
    "User not found or not allowed"
  );
 }

    return res.json({
      success: true,
      message: "User deleted successfully",
    });
  }, [ACCESS_ROLES.ADMIN, ACCESS_ROLES.SUPER_ADMIN])
);

module.exports = router;