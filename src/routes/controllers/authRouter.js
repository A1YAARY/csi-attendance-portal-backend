const express = require("express");
const AuthenticationManager = require("../../businesslogic/managers/authenticationManager");

const router = express.Router();

const isProd = process.env.NODE_ENV === "production";

class AuthController {

  // ✅ REGISTER ORGANIZATION
  static async registerOrg(req, res) {
    try {
      const result = await AuthenticationManager.registerOrganization(req.body);
      console.log(result)

      const { accessToken, refreshToken } = result.data; // ✅ FIX

      res
        .cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: isProd, // ✅ FIX
          sameSite: "Strict",
          maxAge: 15 * 60 * 1000 // ✅ ADD
        })
        .cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: isProd,
          sameSite: "Strict",
          maxAge: 7 * 24 * 60 * 60 * 1000
        })
        .json({ result });

    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  // ✅ LOGIN
  static async login(req, res) {
    try {
      const result = await AuthenticationManager.loginUser(req.body);

      const { user, accessToken, refreshToken } = result.data; // ✅ FIX

      res
        .cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: isProd,
          sameSite: "Strict",
          maxAge: 15 * 60 * 1000
        })
        .cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: isProd,
          sameSite: "Strict",
          maxAge: 7 * 24 * 60 * 60 * 1000
        })
        .json({ user });

    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  // 👤 REGISTER USER
  static async registerUser(req, res) {
    try {
      const result = await AuthenticationManager.registerUser(req.body);

      res.json({ user: result.data }); // ✅ FIX

    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  // 🔁 REFRESH TOKEN
  static async refresh(req, res) {
    try {
      const token = req.cookies.refreshToken;

      const result = await AuthenticationManager.refreshSession(token);

      const { accessToken } = result.data; // ✅ FIX

      res
        .cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: isProd,
          sameSite: "Strict",
          maxAge: 15 * 60 * 1000
        })
        .json({ message: "Token refreshed" });

    } catch (err) {
      res.status(401).json({ message: err.message });
    }
  }

  // 🚪 LOGOUT
  static async logout(req, res) {
    try {
      await AuthenticationManager.logoutUser(); // ✅ FIX (no token needed)

      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      res.json({ message: "Logged out" });

    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
}

// ROUTES (no change needed here)
router.post("/register-org", AuthController.registerOrg);
router.post("/login", AuthController.login);
router.post("/refresh", AuthController.refresh);
router.post("/logout", AuthController.logout);
router.post("/register-user", AuthController.registerUser);

module.exports = router;