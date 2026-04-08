const NotificationModel = require("../../models/notificationModel");

class NotificationManager {
  static async getAllNotifications(currentUser) {
    try {
      const notificationModel = new NotificationModel(currentUser.user_id);

      return await notificationModel.findAllWithAccessControl(currentUser);
    } catch (err) {
      throw new Error(`Failed to fetch notifications: ${err.message}`);
    }
  }

  static async markAllAsRead(currentUser) {
    try {
      const notificationModel = new NotificationModel(currentUser.user_id);

      return await notificationModel.markAllAsReadWithAccessControl(
        currentUser
      );
    } catch (err) {
      throw new Error(`Failed to update notifications: ${err.message}`);
    }
  }
  static async markAsRead(notificationId, currentUser) {
  try {
    const notificationModel = new NotificationModel(currentUser.user_id);

    const updated =
      await notificationModel.markAsReadWithAccessControl(
        notificationId,
        currentUser
      );

    if (!updated) {
      throw new Error("Notification not found or access denied");
    }

    return {
      message: "Notification marked as read",
    };
  } catch (err) {
    throw new Error(`Failed to update notification: ${err.message}`);
  }
}
}

module.exports = NotificationManager;