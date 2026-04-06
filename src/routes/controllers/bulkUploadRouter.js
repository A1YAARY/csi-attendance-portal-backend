const express = require("express");
const router = express.Router({ mergeParams: true });
const { appWrapper } = require("../routeWrappers");
const BulkUploadManager = require("../../businesslogic/managers/bulkUploadManager");
const { ACCESS_ROLES } = require("../../businesslogic/accessmanagement/roleConstants");
const AppError = require("../../errorhandlers/AppError");
const { ERROR_STATUS_CODES } = require("../../errorhandlers/constants");


router.post(
  "/bulk-user",
  appWrapper(
    async (req, res) => {
      if (!req.files || !req.files.file) {
        throw new AppError(
          null,
          ERROR_STATUS_CODES.BAD_REQUEST,
          "File is required"
        );
      }
    
      const file = req.files.file;
      const currentUser = res.locals.user;

      const result = await BulkUploadManager.bulkUploadUsers(
        currentUser,
        file
      );


      return res.json({
        success: true,
        data: result.data,
        message: result.message,
      });
    },
    [ACCESS_ROLES.ACCOUNT_ADMIN, ACCESS_ROLES.ACCOUNT_SUPER_ADMIN]
    // [ACCESS_ROLES.ALL]
  )
);


module.exports = router;