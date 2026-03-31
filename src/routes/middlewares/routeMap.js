const express = require("express");
const { expressjwt: jwt } = require("express-jwt");

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

    // 👉 All open routes go here (NO middleware)
    openrouter.use("/auth", Authrouter);

    // mount open routes
    app.use("/", openrouter);

    // =========================
    // 🔒 CLOSED ROUTER
    // =========================
    const router = express.Router();

    // 👉 DEFAULT middleware for ALL protected routes
    router.use(
      RouteMap._attachLocals,
      RouteMap._authenticate,
      RouteMap._attachUser
    );

    // 👉 Protected feature routers
    router.use("/admin", Adminrouter);

    // mount protected routes
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
  // 🔐 AUTH (COOKIE FIRST)
  // =========================
  static _authenticate(req, res, next) {
    const middleware = jwt({
      secret: process.env.JWT_SECRET_KEY,
      algorithms: ["HS256"],
      getToken: (req) => {
        // ✅ Cookie priority
        if (req.cookies?.accessToken) {
          return req.cookies.accessToken;
        }

        // fallback header
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

      res.locals[RES_LOCALS.USER_INFO.KEY] = {
        user: {
          user_id: decoded.user_id,
          email: decoded.email,
          role_id: userData.roles[0].role_id,
          roles: userData.roles,
        },
        roles: userData.roles,
      };

      next(); // 👉 goes to actual router method (controller)

    } catch (err) {
      next(err);
    }
  }
}

module.exports = RouteMap;