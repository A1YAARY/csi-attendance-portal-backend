const express = require("express");
const AuthenticationManager = require("../../businesslogic/managers/authenticationManager");

const router = express.Router();

class AuthController {

  // ✅ REGISTER ORGANIZATION (creates ADMIN)
  static async registerOrg(req, res) {
    try {
      const result = await AuthenticationManager.registerOrganization(req.body);

      res
        .cookie("accessToken", result.accessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "Strict"
        })
        .cookie("refreshToken", result.refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "Strict"
        })
        .json({ user: result.user });

    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  // ✅ LOGIN (ADMIN / STAFF)
  static async login(req, res) {
    try {
      const result = await AuthenticationManager.loginUser(req.body);

      res
        .cookie("accessToken", result.accessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "Strict"
        })
        .cookie("refreshToken", result.refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "Strict"
        })
        .json({ user: result.user });

    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  //register user
  static async registerUser(req, res) {
    try {
      const result = await AuthenticationManager.registerUser(req.body);

      res.json({ user: result });

    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  // 🔁 REFRESH TOKEN
  static async refresh(req, res) {
    try {
      const token = req.cookies.refreshToken;

      const result = await AuthenticationManager.refreshSession(token);

      res
        .cookie("accessToken", result.accessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "Strict"
        })
        .json({ message: "Token refreshed" });

    } catch (err) {
      res.status(401).json({ message: err.message });
    }
  }

  // 🚪 LOGOUT
  static async logout(req, res) {
    try {
      const token = req.cookies.refreshToken;

      await AuthenticationManager.logoutUser(token);

      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      res.json({ message: "Logged out" });

    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

}

// 🔥 ROUTES (ALL AUTH HERE)
router.post("/register-org", AuthController.registerOrg);
router.post("/login", AuthController.login);
router.post("/refresh", AuthController.refresh);
router.post("/logout", AuthController.logout);
router.post("/register-user", AuthController.registerUser);

module.exports = router;