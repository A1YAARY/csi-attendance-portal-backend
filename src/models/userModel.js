const BaseModel = require("./libs/BaseModel");
const DatabaseError = require("../errorhandlers/DatabaseError");
const AppError = require("../errorhandlers/AppError");
const { ERROR_STATUS_CODES } = require("../errorhandlers/constants");

class UserModel extends BaseModel {
  constructor(userId) {
    super(); 
    this.userId = userId;
  }

  // 🔹 GET ALL USERS BY ORGANIZATION
  async findAllByOrganization(organizationId, search = "") {
    try {
      const qb = await this.getQueryBuilder();

      const applySearch = (query) => {
        if (search) {
          query.where(function () {
            this.where("users.name", "ilike", `%${search}%`)
              .orWhere("users.email", "ilike", `%${search}%`)
              .orWhere("users.phone", "ilike", `%${search}%`)
              .orWhere("users.department", "ilike", `%${search}%`);
          });
        }
      };

      const query = qb("users")
        .select([
          "users.user_id",
          "users.name",
          "users.email",
          "users.gender",
          "users.phone",
          "users.department",
          "users.organization_id",
          "users.role_id",
          "users.check_in",
          "users.check_out",
          "organization.name as organization_name",
          "role.name as role_name"
        ])
        .leftJoin("organization", "users.organization_id", "organization.id")
        .leftJoin("role", "users.role_id", "role.role_id")
        .where("users.is_deleted", false)
        .andWhere("users.organization_id", organizationId);

      applySearch(query);

      const data = await query.orderBy("users.user_id", "asc");

      return data.map(this.normalizeUser);
    } catch (e) {
      throw new DatabaseError(e);
    }
  }

  // 🔹 UPDATE USER
  async updateByIdWithAccessControl(userId, updateData, currentUser) {
    try {
      const qb = await this.getQueryBuilder();

      let checkQuery = qb("users")
        .where("user_id", userId)
        .andWhere("is_deleted", false);

      if (currentUser.role !== "SUPER_ADMIN") {
        checkQuery.andWhere(
          "organization_id",
          currentUser.organization_id
        );
      }

      const existingUser = await checkQuery.first();

      // ✅ 🔥 ERROR HANDLING ADDED HERE
      if (!existingUser) {
        throw new AppError(
          null,
          ERROR_STATUS_CODES.RESOURCE_NOT_FOUND,
          "User not found or not allowed"
        );
      }

      const allowedFields = [
        "name",
        "email",
        "gender",
        "phone",
        "department",
        "role_id",
        "working_start",
        "working_end",
        "check_in",
        "check_out",
        "profile_image"
      ];

      const filteredData = {};

      for (let key of allowedFields) {
        if (updateData[key] !== undefined) {
          filteredData[key] = updateData[key];
        }
      }

      if (currentUser.role !== "SUPER_ADMIN") {
        delete filteredData.organization_id;
      }

      await qb("users")
        .where("user_id", userId)
        .update(filteredData);

      const updatedUser = await qb("users")
        .select([
          "users.user_id",
          "users.name",
          "users.email",
          "users.gender",
          "users.phone",
          "users.department",
          "users.organization_id",
          "users.role_id",
          "users.check_in",
          "users.check_out",
          "organization.name as organization_name",
          "role.name as role_name"
        ])
        .leftJoin("organization", "users.organization_id", "organization.id")
        .leftJoin("role", "users.role_id", "role.role_id")
        .where("users.user_id", userId)
        .first();

      return this.normalizeUser(updatedUser);
    } catch (e) {
      throw new DatabaseError(e);
    }
  }

  // 🔹 DELETE USER (SOFT DELETE)
  async deleteByIdWithAccessControl(userId, currentUser) {
    try {
      const qb = await this.getQueryBuilder();

      let query = qb("users")
        .where("user_id", userId)
        .andWhere("is_deleted", false);

      if (currentUser.role !== "SUPER_ADMIN") {
        query.andWhere(
          "organization_id",
          currentUser.organization_id
        );
      }

      const existingUser = await query.first();

      // ✅ 🔥 ERROR HANDLING ADDED HERE
      if (!existingUser) {
        throw new AppError(
          null,
          ERROR_STATUS_CODES.RESOURCE_NOT_FOUND,
          "User not found or not allowed"
        );
      }

      // 🚫 Prevent self-delete
      if (currentUser.user_id === userId) {
        throw new AppError(
          null,
          ERROR_STATUS_CODES.BAD_REQUEST,
          "You cannot delete your own account"
        );
      }

      await qb("users")
        .where("user_id", userId)
        .update({
          is_deleted: true,
          deleted_at: new Date(),
        });

      return true;
    } catch (e) {
      throw new DatabaseError(e);
    }
  }

  // 🔹 NORMALIZE RESPONSE
  normalizeUser(user) {
    return {
      userId: user.user_id,
      name: user.name,
      email: user.email,
      gender: user.gender,
      phone: user.phone,
      department: user.department,
      organizationId: user.organization_id,
      organizationName: user.organization_name,
      roleId: user.role_id,
      roleName: user.role_name,
      checkIn: user.check_in,
      checkOut: user.check_out,
    };
  }
}

module.exports = UserModel;