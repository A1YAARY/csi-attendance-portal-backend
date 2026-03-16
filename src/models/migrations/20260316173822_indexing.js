const { PUBLIC_SCHEMA } = require("../libs/dbConstants");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA)
    .table("attendance", (table) => {
      table.index(["user_id"], "idx_attendance_user");
    })
    .table("face_profiles", (table) => {
      table.index(["user_id"], "idx_face_user");
    })
};


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
