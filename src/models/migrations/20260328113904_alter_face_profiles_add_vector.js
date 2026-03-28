const { PUBLIC_SCHEMA } = require("../libs/dbConstants");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {

  // add columns
  await knex.schema
    .withSchema(PUBLIC_SCHEMA)
    .alterTable('face_profiles', function (table) {

        table.specificType('face_embedding', 'vector(512)');
        table.string('sample_type',50);
        table.float('confidence').defaultTo(0.0);
        table.boolean('is_active').defaultTo(true);

    });

  // create vector index
  await knex.raw(`
      CREATE INDEX IF NOT EXISTS face_profiles_embedding_idx
      ON ${PUBLIC_SCHEMA}.face_profiles
      USING ivfflat (face_embedding vector_cosine_ops)
  `);
};


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {

  await knex.schema
    .withSchema(PUBLIC_SCHEMA)
    .alterTable('face_profiles', function (table) {

        table.dropColumn('face_embedding');
        table.dropColumn('sample_type');
        table.dropColumn('confidence');
        table.dropColumn('is_active');

    });

};