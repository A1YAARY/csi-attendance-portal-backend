const { PUBLIC_SCHEMA } = require("../libs/dbConstants");
const { addDefaultColumns } = require("../utilities/MigrationUtilities");


exports.up = function (knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).createTable("daily_timesheets", (table) => {
    table.increments("id").primary();

    table.integer("user_id")
      .references("user_id")
      .inTable(`users`);

    table.integer("organization_id")
      .references("id")
      .inTable(`organization`);

    table.date("work_date").notNullable();

    table.integer("total_minutes").defaultTo(0);

   table.string('status',255).notNullable()

    table.unique(["user_id", "work_date"]);

    addDefaultColumns(table);
  });
};

exports.down = function (knex) {
};