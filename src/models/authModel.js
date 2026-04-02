const BaseModel = require("./libs/BaseModel");
const DatabaseError = require("../errorhandlers/DatabaseError");

class AuthModel extends BaseModel {

  // 🔹 Public fields (safe to return)
  getPublicColumns() {
    return [
      "user_id",
      "name",
      "gender",
      "phone",
      "profile_image",
      "email",
      "role_id"
    ];
  }

  // 🔹 Create Organization
async createOrganization(payload) {
  try {
    const qb = await this.getQueryBuilder();
    const insertData = this.insertStatement(payload);

    const [org] = await qb("organization")
      .insert(insertData)
      .returning(["id", "name", "address"]);

    return org || null;
  } catch (e) {
    throw new DatabaseError(e);
  }
}

// 🔹 Find Organization by Name (for duplicate check)
async findOrganizationByName(name) {
  console.log(name)
  try {
    // console.log(a)
    const qb = await this.getQueryBuilder();
    // console.log(b)
    const org = await qb("organization")
      .select("id", "name", "address")
      .where(this.whereStatement({ name }))
      .first();
    // console.log(c)
    return org || null;
  } catch (e) {
    throw new DatabaseError(e);
  }
}

  // 🔹 Create User
  async createUser(payload) {
    try {
      const qb = await this.getQueryBuilder();
      const insertData = this.insertStatement(payload);

      const [user] = await qb("users")
        .insert(insertData)
        .returning(this.getPublicColumns());

      return user || null;
    } catch (e) {
      throw new DatabaseError(e);
    }
  }

  //Update User
  async updateUser(user_id, payload) {
    try {
      const qb = await this.getQueryBuilder();
      
      // ✅ FIX: validate payload
      if (!payload || typeof payload !== "object") {
        throw new Error("Invalid update payload");
      }

      // 🔹 Remove undefined/null values
      const updateData = Object.fromEntries(
        Object.entries(payload).filter(
          ([_, value]) => value !== undefined && value !== null
        )
      );

      // ❗ Prevent empty update
      if (Object.keys(updateData).length === 0) {
        throw new Error("No valid fields to update");
      }

      const [updatedUser] = await qb("users")
        .where({ user_id })
        .update(updateData)
        .returning(this.getPublicColumns());
      
      return updatedUser || null;

    } catch (e) {
      throw new DatabaseError(e);
    }
  }

  // 🔐 Login (fetch password)
  async getUserForLogin(email) {
    try {
      const qb = await this.getQueryBuilder();

      const user = await qb("users as u")
        .leftJoin("role as r", "u.role_id", "r.role_id")
        .select(
          "u.user_id",
          "u.email",
          "u.password", // ✅ FIXED
          "u.name",
          "r.name as role_name" // ✅ FIXED
        )
        .where({
          "u.email": email,
          "u.is_deleted": false
        })
        .first();

      return user || null;
    } catch (e) {
      throw new DatabaseError(e);
    }
  }

  // 🔓 Used after token (profile / auth middleware)
  async getUserRoleById(email) {
    try {
      const qb = await this.getQueryBuilder();

      const user = await qb("users")
        .leftJoin("role", "users.role_id", "role.role_id")
        .select(
          "users.user_id",
          "users.email",
          "users.name",
          "users.role_id",
          "users.organization_id", // ✅ ADD
          "role.name as role_name"
        )
        .where("users.email", email)
        .andWhere("users.is_deleted", false)
        .first();

      if (!user) return null;

      return {
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        organization_id: user.organization_id, // ✅ ADD
        roles: [
          {
            role_id: user.role_id,
            role_name: user.role_name
          }
        ]
      };

    } catch (e) {
      throw new DatabaseError(e);
    }
  }
}

module.exports = AuthModel;