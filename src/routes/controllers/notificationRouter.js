const express = require("express");
const NotificationManager = require("../../businesslogic/managers/notificationManager");
const AccessManagement = require("../../businesslogic/accessmanagement/AccessManagement");
const { ACCESS_ROLES } = require("../../businesslogic/accessmanagement/roleConstants");

const router = express.Router();

// ✅ GET all notifications
router.get(
  "/",
  AccessManagement.allowAccess([
    ACCESS_ROLES.ACCOUNT_ADMIN,
    ACCESS_ROLES.ACCOUNT_SUPER_ADMIN
  ]),
  async (req, res) => {
    try {
      const result = await NotificationManager.getAllNotifications(
        res.locals.user
      );

      res.json(result);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);
// ✅ PUT - mark as read
router.put(
  "/:id/read",
  AccessManagement.allowAccess([
    ACCESS_ROLES.ACCOUNT_ADMIN,
    ACCESS_ROLES.ACCOUNT_SUPER_ADMIN
  ]),
  async (req, res) => {
    try {
      const result = await NotificationManager.markAsRead(
        req.params.id,
        res.locals.user
      );

      res.json(result);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

module.exports = router;