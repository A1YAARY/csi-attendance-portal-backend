const jwt = require('jsonwebtoken');
require('dotenv').config();

class JwtUtilities {
  static generateAccessToken(user) {
    return jwt.sign(
      {
        id: user.id,
        role: user.role,
        org: user.organization_id,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "8h" }
    );
  }

  static generateRefreshToken(user) {
    return jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );
  }

  static generateTokens(user) {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user)
    };
  }

  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      throw new Error("Invalid access token");
    }
  }

  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      throw new Error("Invalid refresh token");
    }
  }
}

module.exports = JwtUtilities;