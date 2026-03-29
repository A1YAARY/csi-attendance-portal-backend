const faceModel = require("../../models/faceModel");
const faceEngine = require("../../services/faceEngine");

class FaceManager {

  static async registerFace({
    user_id,
    sample_type,
    image
  }) {

    const result = await faceEngine.analyzeFace(image);

    if (result.error) {
      throw new Error(result.error);
    }

    if (!result.liveness) {
      throw new Error("Liveness check failed");
    }

    return await faceModel.saveFace({
      user_id,
      sample_type,
      embedding: result.embedding
    });

  }

}

module.exports = FaceManager;