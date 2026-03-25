const express = require("express");
const router = express.Router();

const AuthenticationManager = require("../../../businesslogic/managers/authenticationManager");
const { appWrapper } = require("../../routeWrappers");

/**
 * POST /register_organization
 * Registers a new organization
 * Body: { name, address }
 */
router.post(
  "/register_organization",
  appWrapper(async (req, res) => {
    const result = await AuthenticationManager.registerOrganization(req.body);

    return res.json({
      success: true,
      message: "Organization registered successfully",
      ...result,
    });
  })
);

/**
 * POST /login
 * Logs in a user based on email and password.
 * Body: { email, password }
 */
router.post(
  "/login",
  appWrapper(async (req, res) => {
    const result = await AuthenticationManager.login(
      req.body.email,
      req.body.password
    );

    return res.json({
      success: true,
      message: "Login successful",
      ...result,
    });
  })
);

module.exports = router;