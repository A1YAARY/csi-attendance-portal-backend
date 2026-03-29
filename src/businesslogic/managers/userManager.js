const UserModel = require("../../models/userModel");

class UserManager {
  static async getAllUsersByOrganization(organizationId, search = "", userId = null) {
    try {
      const userModel = new UserModel(userId);

      const users = await userModel.findAllByOrganization(
        organizationId,
        search
      );

      return users;
    } catch (err) {
      throw new Error(`Failed to fetch users: ${err.message}`);
    }
  }

  static async updateUserById(userId, updateData, currentUser) {
    try {
      const userModel = new UserModel(currentUser.user_id);

      const user = await userModel.updateByIdWithAccessControl(
        userId,
        updateData,
        currentUser
      );

      return user;
    } catch (err) {
      throw new Error(`Failed to update user: ${err.message}`);
    }
  }

  static async deleteUserById(userId, currentUser) {
    try {
      const userModel = new UserModel(currentUser.user_id);

      const result = await userModel.deleteByIdWithAccessControl(
        userId,
        currentUser
      );

      return result;
    } catch (err) {
      throw new Error(`Failed to delete user: ${err.message}`);
    }
  }
}

module.exports = UserManager;