import bcrypt from "bcryptjs";
import User from "../../models/authModel.js";
import Organization from "../../models/organisationModel.js";
import JwtUtilities from "../../routes/utilities/jwtUtilities.js";

class AuthenticationManager {
  static async registerOrganization(data) {
    const { orgName, name, email, password } = data;

    const existing = await User.query().findOne({ email });
    if (existing) throw new Error("User already exists");

    const org = await Organization.query().insert({
      name: orgName,
    });

    const hashed = await bcrypt.hash(password, 10);

    const admin = await User.query().insert({
      name,
      email,
      password: hashed,
      role: "ADMIN",
      organization_id: org.id,
    });

    const { accessToken, refreshToken } =
      JwtUtilities.generateTokens(admin);

    await User.query()
      .patch({ refresh_token: refreshToken })
      .where("id", admin.id);

    return { user: admin, accessToken, refreshToken };
  }

  static async loginUser({ email, password }) {
    const user = await User.query().findOne({ email });

    if (!user) throw new Error("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    const { accessToken, refreshToken } =
      JwtUtilities.generateTokens(user);

    await User.query()
      .patch({ refresh_token: refreshToken })
      .where("id", user.id);

    return { user, accessToken, refreshToken };
  }

  static async refreshSession(token) {
    if (!token) throw new Error("No refresh token");

    const decoded = JwtUtilities.verifyRefreshToken(token);

    const user = await User.query().findById(decoded.id);

    if (!user || user.refresh_token !== token) {
      throw new Error("Invalid refresh token");
    }

    const accessToken = JwtUtilities.generateAccessToken(user);

    return { accessToken };
  }

  static async logoutUser(token) {
    if (!token) return;

    const user = await User.query().findOne({
      refresh_token: token,
    });

    if (user) {
      await User.query()
        .patch({ refresh_token: null })
        .where("id", user.id);
    }
  }

  static async createStaff(adminUser, data) {
    if (adminUser.role !== "ADMIN") {
      throw new Error("Only admin can create staff");
    }

    const { name, email, password } = data;

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.query().insert({
      name,
      email,
      password: hashed,
      role: "USER",
      organization_id: adminUser.org,
    });

    return user;
  }
}

export default AuthenticationManager;