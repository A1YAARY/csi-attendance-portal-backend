const BaseModel = require("./libs/BaseModel");
const DatabaseError = require("../errors/DatabaseError");

class NotificationModel extends BaseModel {
  constructor(userId) {
    super();
    this.userId = userId;
  }

  async findAllWithAccessControl(currentUser) {
    try {
      const qb = await this.getQueryBuilder();

      const query = qb("notifications")
        .select([
          "notifications.id",
          "notifications.title",
          "notifications.message",
          "notifications.user_id",
          "notifications.is_read",
          "notifications.created_at",
          "users.name as user_name",
          "users.organization_id"
        ])
        .leftJoin("users", "notifications.user_id", "users.user_id")
        .where("notifications.is_deleted", false);

      // 🔐 ACCESS CONTROL (IMPORTANT CHANGE)
      if (currentUser.role !== "SUPER_ADMIN") {
        query.andWhere(
          "users.organization_id",
          currentUser.organization_id
        );
      }

      const data = await query.orderBy("notifications.created_at", "desc");

      return data.map(this.normalizeNotification);
    } catch (e) {
      throw new DatabaseError(e);
    }
  }

  async markAllAsReadWithAccessControl(currentUser) {
  try {
    const qb = await this.getQueryBuilder();

    // 🔐 SUPER ADMIN → update all
    if (currentUser.role === "SUPER_ADMIN") {
      await qb("notifications")
        .where("is_deleted", false)
        .update({
          is_read: true,
          updated_at: new Date()
        });

      return true;
    }

    // 🔐 ADMIN → only their organization
    await qb("notifications")
      .whereIn("user_id", function () {
        this.select("user_id")
          .from("users")
          .where("organization_id", currentUser.organization_id);
      })
      .andWhere("is_deleted", false)
      .update({
        is_read: true,
        updated_at: new Date()
      });

    return true;

  } catch (e) {
    throw new DatabaseError(e);
  }
}

  normalizeNotification(notification) {
    return {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      userId: notification.user_id,
      userName: notification.user_name,
      organizationId: notification.organization_id,
      isRead: notification.is_read,
      createdAt: notification.created_at,
    };
  }
}

module.exports = NotificationModel;