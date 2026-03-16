const { PUBLIC_SCHEMA } = require("../libs/dbConstants");
const { addDefaultColumns } = require("../utilities/MigrationUtilities");


exports.up = function (knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).createTable("notifications", (table) => {
    table.increments("id").primary();

    table.integer("user_id")
      .references("user_id")
      .inTable(`users`);

    table.text("title");
    table.text("message");

    table.boolean("is_read").defaultTo(false);

    addDefaultColumns(table);
  });
};

exports.down = function (knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).dropTableIfExists("notifications");
};