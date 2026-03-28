const { PUBLIC_SCHEMA } = require("../libs/dbConstants");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {

  await knex.schema
    .withSchema(PUBLIC_SCHEMA)
    .alterTable("attendance", (table) => {

      // face match score
      table.float("match_confidence");

      // spoof prevention
      table.boolean("liveness_passed").defaultTo(false);

      // method used
      table.string("method").defaultTo("face");
      // face | manual | qr

    });

};


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {

  await knex.schema
    .withSchema(PUBLIC_SCHEMA)
    .alterTable("attendance", (table) => {

      table.dropColumn("match_confidence");
      table.dropColumn("liveness_passed");
      table.dropColumn("method");

    });

};