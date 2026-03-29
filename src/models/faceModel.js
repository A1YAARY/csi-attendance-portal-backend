const knex = require("./libs/db");

exports.saveFace = async ({
  user_id,
  sample_type,
  embedding
}) => {

  return knex("face_profiles")
    .insert({
      user_id,
      sample_type,
      face_embedding: embedding,
      confidence: 1,
      is_active: true
    })
    .returning("*");

};