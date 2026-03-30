const { PUBLIC_SCHEMA } = require("../libs/dbConstants");
const { addDefaultColumns } = require("../utilities/MigrationUtilities");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA)
        .alterTable('users', function (table) {
            table.text("access_token").nullable(); 
            table.text("refresh_token").nullable(); 
            table.timestamp("expires_at").nullable();
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  table.dropColumn("access_token"); 
  table.dropColumn("refresh_token"); 
  table.dropColumn("expires_at");
};
