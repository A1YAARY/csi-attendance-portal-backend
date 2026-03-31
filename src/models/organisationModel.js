const BaseModel = require("./libs/BaseModel");
const DatabaseError = require("../errorhandlers/DatabaseError");

class OrganizationModel extends BaseModel {

  // 🔹 Public fields (safe to return)
  getPublicColumns() {
    return [
      "id",
      "name",
      "address",
      "created_at",
      "updated_at"
    ];
  }

  // 🔹 Create Organization
  async createOrganization(payload) {
    try {
      const qb = await this.getQueryBuilder();
      const insertData = this.insertStatement(payload);

      const [org] = await qb("organization")
        .insert(insertData)
        .returning(this.getPublicColumns());

      return org || null;
    } catch (e) {
      throw new DatabaseError(e);
    }
  }

  // 🔹 Find Organization by ID
  async getOrganizationById(id) {
    try {
      const qb = await this.getQueryBuilder();

      const org = await qb("organization")
        .select(this.getPublicColumns())
        .where(this.whereStatement({ id }))
        .first();

      return org || null;
    } catch (e) {
      throw new DatabaseError(e);
    }
  }

  // 🔹 Find Organization by Name (duplicate check)
  async getOrganizationByName(name) {
    try {
      const qb = await this.getQueryBuilder();

      const org = await qb("organization")
        .select(this.getPublicColumns())
        .where(this.whereStatement({ name }))
        .first();

      return org || null;
    } catch (e) {
      throw new DatabaseError(e);
    }
  }

  // 🔹 Update Organization
  async updateOrganization(id, payload) {
    try {
      const qb = await this.getQueryBuilder();
      const updateData = this.updateStatement(payload);

      const [updated] = await qb("organization")
        .where(this.whereStatement({ id }))
        .update(updateData)
        .returning(this.getPublicColumns());

      return updated || null;
    } catch (e) {
      throw new DatabaseError(e);
    }
  }

  // 🔹 Soft Delete Organization
  async deleteOrganization(id) {
    try {
      const qb = await this.getQueryBuilder();

      await qb("organization")
        .where(this.whereStatement({ id }))
        .update(this.updateStatement({ is_deleted: true }));

      return true;
    } catch (e) {
      throw new DatabaseError(e);
    }
  }

  // 🔹 Get All Organizations (Admin use)
  async getAllOrganizations() {
    try {
      const qb = await this.getQueryBuilder();

      const orgs = await qb("organization")
        .select(this.getPublicColumns())
        .where({ is_deleted: false });

      return orgs;
    } catch (e) {
      throw new DatabaseError(e);
    }
  }
}

module.exports = OrganizationModel;