const { PUBLIC_SCHEMA } = require("../libs/dbConstants");
const { addDefaultColumns } = require("../utilities/MigrationUtilities");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA)
        .createTable('users', function (table) {
             table.increments('user_id').primary();
             table.integer('organization_id').references('id').inTable('organization')
             table.string('name',255).notNullable();
             table.string('email',255).notNullable();
             table.text('password').notNullable();
             table.string('gender').notNullable();
             table.integer('role_id').references('role_id').inTable('role')
             table.string('phone',255).nullable();
             table.string('department',255).nullable();
             table.time('working_start').defaultTo('09:00:00');
             table.time('working_end').defaultTo('17:00:00');
             table.jsonb('profile_image').nullable();

            addDefaultColumns(table);
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
