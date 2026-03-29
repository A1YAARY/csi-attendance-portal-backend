const express = require("express");
const { expressjwt: jwt } = require("express-jwt");

const AuthenticationError = require("../../errorhandlers/AuthenticationError");
const AccessPermissionError = require("../../errorhandlers/AccessPermissoinError");
const Authrouter = require("../controllers/open/authLoginRouter");
const Adminrouter = require("../controllers/adminRouter");
const faceRouter = require("../controllers/faceRouter");
const { RES_LOCALS } = require("./constant");

const AuthModel = require("../../models/authModel");

// 🔓 OPEN ROUTER
const openrouter = express.Router();

// 🔒 CLOSED ROUTER
const closedrouter = express.Router();


class RouteMap {
  static setupRoutesAndAuth(app) {

    // =========================
    // 🔓 OPEN ROUTES (NO AUTH)
    // =========================
    app.use("/", openrouter);

    // Example open routes
    openrouter.use("/auth", Authrouter);

    // =========================
    // 🔒 CLOSED ROUTES (WITH AUTH)
    // =========================
    app.use(
      "/api",
      ...RouteMap._setupAuth(),
      RouteMap._addUserInformation,
      closedrouter
    );
    
    closedrouter.use("/admin",Adminrouter);
    closedrouter.use("/face", faceRouter);


    // Attach all protected routes here

    // =========================
    // ❌ 404 HANDLER
    // =========================
    app.use((req, res) => {
      res.status(404).json({
        status: 404,
        message: "Specified path not found"
      });
    });
  }

  // 🔐 AUTH MIDDLEWARE (INLINE)
  static _setupAuth() {

    // attach locals
    const attachLocals = (req, res, next) => {
      req._locals = res.locals;
      next();
    };

    // JWT middleware
    const authJwt = jwt({
      secret: process.env.JWT_SECRET_KEY,
      algorithms: ["HS256"],
      getToken: (req) => {
        if (req.headers.authorization) {
          return req.headers.authorization.split(" ")[1];
        }
        return null;
      }
    });

    // error handler
    const handleJwtError = (err, req, res, next) => {
      if (err.name === "UnauthorizedError") {
        return res.status(401).json({
          status: 401,
          message: "Invalid or missing token"
        });
      }
      next(err);
    };

    return [
      attachLocals,
      authJwt,
      handleJwtError
    ];
  }

  // 🔐 Attach user info after token validation
  static async _addUserInformation(req, res, next) {
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
          roles: userData.roles
        },
        roles: userData.roles
      };

      next();
    } catch (err) {
      next(err);
    }
  }


}

module.exports = RouteMap;













