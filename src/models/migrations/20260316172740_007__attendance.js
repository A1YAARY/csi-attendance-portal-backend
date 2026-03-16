const { PUBLIC_SCHEMA } = require("../libs/dbConstants");
const { addDefaultColumns } = require("../utilities/MigrationUtilities");

exports.up = function (knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).createTable("attendance", (table) => {
    table.increments("id").primary();

    table.integer("user_id")
      .references("user_id")
      .inTable(`users`);

    table.integer("organization_id")
      .references("id")
      .inTable(`organization`);

    table.timestamp("check_in");
    table.timestamp("check_out");

    table.integer("total_work_minutes").defaultTo(0);

    table.string('status',255).notNullable()

    addDefaultColumns(table);
  });
};

exports.down = function (knex) {
 
};