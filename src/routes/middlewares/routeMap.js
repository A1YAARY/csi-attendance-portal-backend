const express = require("express");
const { expressjwt: jwt } = require("express-jwt");
const jwtLib = require("jsonwebtoken"); // for manual token handling

const AuthenticationError = require("../../errorhandlers/AuthenticationError");
const AccessPermissionError = require("../../errorhandlers/AccessPermissoinError");

const Authrouter = require("../controllers/authRouter");
const Adminrouter = require("../controllers/adminRouter");

const AuthModel = require("../../models/authModel");
const { RES_LOCALS } = require("./constant");

class RouteMap {
  static setupRoutesAndAuth(app) {

    // =========================
    // 🔓 OPEN ROUTER
    // =========================
    const openrouter = express.Router();

    openrouter.use("/auth", Authrouter);

    app.use("/", openrouter);

    // =========================
    // 🔒 CLOSED ROUTER
    // =========================
    const router = express.Router();

    router.use(
      RouteMap._attachLocals,
      RouteMap._checkAccessOrRefresh, // ✅ NEW MIDDLEWARE
      RouteMap._authenticate,
      RouteMap._attachUser
    );

    router.use("/admin", Adminrouter);

    app.use("/api", router);

    // =========================
    // ❌ 404 HANDLER
    // =========================
    app.use((req, res) => {
      res.status(404).json({
        status: 404,
        message: "Specified path not found",
      });
    });
  }

  // =========================
  // 🔧 ATTACH LOCALS
  // =========================
  static _attachLocals(req, res, next) {
    req._locals = res.locals;
    next();
  }

  // =========================
  // 🔁 ACCESS / REFRESH HANDLER
  // =========================
  static async _checkAccessOrRefresh(req, res, next) {
    try {
      const accessToken = req.cookies?.accessToken;
      const refreshToken = req.cookies?.refreshToken;

      // ✅ If access token exists → continue
      if (accessToken) {
        return next();
      }

      // ❌ No access token & no refresh token
      if (!refreshToken) {
        return res.status(401).json({
          status: 401,
          message: "Session expired. Please login again.",
        });
      }

      // 🔁 Verify refresh token
      let decoded;
      try {
        decoded = jwtLib.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );
      } catch (err) {
        return res.status(401).json({
          status: 401,
          message: "Invalid refresh token. Please login again.",
        });
      }

      // 🔥 Generate new access token
      const newAccessToken = jwtLib.sign(
        {
          user_id: decoded.user_id,
          email: decoded.email,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      // 🍪 Set new access token cookie
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: false, // ⚠️ set true in production
        sameSite: "strict",
      });

      // ⚡ Attach token so express-jwt can read it
      req.headers.authorization = `Bearer ${newAccessToken}`;

      next();
    } catch (err) {
      next(err);
    }
  }

  // =========================
  // 🔐 AUTH (COOKIE FIRST)
  // =========================
  static _authenticate(req, res, next) {
    const middleware = jwt({
      secret: process.env.ACCESS_TOKEN_SECRET,
      algorithms: ["HS256"],
      getToken: (req) => {

        if (req.cookies?.accessToken) {
          return req.cookies.accessToken;
        }

        if (req.headers.authorization) {
          return req.headers.authorization.split(" ")[1];
        }

        return null;
      },
    });

    middleware(req, res, (err) => {
      if (err) {
        return res.status(401).json({
          status: 401,
          message: "Invalid or missing token",
        });
      }

      next();
    });
  }

  // =========================
  // 👤 ATTACH USER FROM DB
  // =========================
  static async _attachUser(req, res, next) {
    try {
      const decoded = req.auth;

      if (!decoded?.user_id || !decoded?.email) {
        throw new AuthenticationError("Invalid token");
      }

      const authModel = new AuthModel();
      const userData = await authModel.getUserRoleById(decoded.email);

      if (!userData || !userData.roles?.length) {
        throw new AccessPermissionError();
      }

      res.locals.user = {
        user_id: decoded.user_id,
        email: decoded.email,
        role: userData.roles[0].role_name,
        role_id: userData.roles[0].role_id,
        organization_id: userData.organization_id,
        roles: userData.roles,
      };

      console.log("ATTACHED USER:", res.locals.user);

      next();

    } catch (err) {
      next(err);
    }
  }
}

module.exports = RouteMap; 