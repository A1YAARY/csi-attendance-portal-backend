const express = require("express");
const router = express.Router({ mergeParams: true });

const { appWrapper } = require("../routeWrappers");
const FaceManager = require("../../businesslogic/managers/faceManager");

const { ACCESS_ROLES } = require("../../businesslogic/accessmanagement/roleConstants");


router.post(
  "/register",
  appWrapper(async (req, res) => {

    const { image, sample_type } = req.body;
    const userId = req.user.id; // from JWT

    const result = await FaceManager.registerFace({
      user_id: userId,
      sample_type,
      image
    });

    return res.json({
      success: true,
      data: result
    });

  }, [
    ACCESS_ROLES.ADMIN,
    ACCESS_ROLES.SUPER_ADMIN,
    ACCESS_ROLES.USER
  ])
);

module.exports = router;