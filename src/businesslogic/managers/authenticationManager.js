const bcrypt = require("bcrypt");

const AuthModel = require("../../models/authModel");
const OrganizationModel = require("../../models/organisationModel");

const JwtUtilities = require("../../routes/utilities/jwtUtilities");

class AuthenticationManager {

  // 🏢 REGISTER ORGANIZATION + ADMIN
  static async registerOrganization(adminUser, data) {
    try {
      if (adminUser?.role !== "SUPER_ADMIN") {
      throw new Error("Only super admin can create organization");
    }
    
      const { orgName, address, name, email, password, role_id, gender, phone, department } = data;

      const authModel = new AuthModel();
      const orgModel = new OrganizationModel();

      // 🔍 Check if org exists
      const existingOrg = await orgModel.getOrganizationByName(orgName);
      if (existingOrg) {
        throw new Error("Organization already exists");
      }

      // 🔍 Check if user exists
      const existingUser = await authModel.getUserForLogin(email);
      if (existingUser) {
        throw new Error("User already exists");
      }

      // 🏢 Create organization
      const organization = await orgModel.createOrganization({
        name: orgName,
        address,
      });

      if (!organization) {
        throw new Error("Failed to create organization");
      }

      // 🔐 Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // 👤 Create admin user
      const user = await authModel.createUser({
        name,
        email,
        password: hashedPassword,
        role_id,
        gender,
        phone,
        department,
        organization_id: organization.id,
      });
      
      if (!user) {
        throw new Error("Failed to create admin user");
      }
      
      // 🔑 Generate tokens
      const tokens = JwtUtilities.generateTokens({
        user_id: user.user_id,
        email: user.email,
        role: role_id,
      });
      
      const accessToken=tokens.accessToken
      const refreshToken=tokens.refreshToken
      
      const updateUser = await authModel.updateUser(user.user_id, {
        access_token: accessToken,
        refresh_token: refreshToken
      });

      console.log("UPDATE DATA:", updateUser);

      return {
        success: true,
        message: "Organization and admin created successfully",
        data: {
          user,
          updateUser,
          organization,
          // accessToken: tokens.accessToken,
          // refreshToken: tokens.refreshToken,
        },
      };

    } catch (error) {
      throw error;
    }
  }

  // 🔐 LOGIN USER
  static async loginUser(data, res) {
    try {
      const { email, password } = data;

      const authModel = new AuthModel();

      // 🔍 Check user
      const user = await authModel.getUserForLogin(email);
      if (!user) throw new Error("User not found");

      // 🔑 Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) throw new Error("Invalid credentials");

      // 🎟️ Generate tokens
      const tokens = JwtUtilities.generateTokens({
        user_id: user.user_id,
        email: user.email,
        role: user.role_name,
      });

      // ⏳ Expiry = current time + 7 days
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);

      // 💾 Store refresh token in DB
      await authModel.updateRefreshToken(
        user.user_id,
        tokens.refreshToken,
        expiryDate
      );

      // 🍪 Set Access Token Cookie (15 min)
      res.cookie("accessToken", tokens.accessToken, {
        httpOnly: true,
        secure: false, // ⚠️ set true in production (HTTPS)
        sameSite: "Strict",
        maxAge: 8 * 60 * 60 * 1000,
      });

      // 🍪 Set Refresh Token Cookie (7 days)
      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: false, // ⚠️ set true in production
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // ✅ Final response (NO tokens exposed)
      return {
        success: true,
        message: "Login successful",
        data: {
          user: {
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            role: user.role_name,
          },
        },
      };

    } catch (error) {
      throw error;
    }
  }

  // 🔁 REFRESH TOKEN
  static async refreshSession(refreshToken) {
    try {
      if (!refreshToken) {
        throw new Error("Refresh token missing");
      }

      const decoded = JwtUtilities.verifyRefreshToken(refreshToken);

      const authModel = new AuthModel();

      const userData = await authModel.getUserRoleById(decoded.email);
      if (!userData) {
        throw new Error("Invalid refresh token");
      }

      const accessToken = JwtUtilities.generateAccessToken({
        user_id: userData.user_id,
        email: userData.email,
        role: userData.roles[0].role_name,
      });

      return {
        success: true,
        message: "Token refreshed",
        data: { accessToken },
      };

    } catch (error) {
      throw error;
    }
  }

  // 🚪 LOGOUT
  static async logoutUser() {
    return {
      success: true,
      message: "Logout handled on client",
    };
  }

  // 👤 CREATE STAFF (ADMIN ONLY)
  static async createStaff(adminUser, data) {
    try {
      const { name, email, password, role_id } = data;

      const authModel = new AuthModel();

      // 🔍 Check existing user
      const existing = await authModel.getUserForLogin(email);
      if (existing) {
        throw new Error("User already exists");
      }

      // 🔐 Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await authModel.createUser({
        name,
        email,
        password: hashedPassword,
        role_id,
        organization_id: adminUser.organization_id,
      });

      return {
        success: true,
        message: "Staff created successfully",
        data: user,
      };

    } catch (error) {
      throw error;
    }
  }

  // 👤 REGISTER USER (PUBLIC / OPTIONAL)
  static async registerUser(adminUser, data) {
    try {
      if (
  adminUser?.role !== "ADMIN" &&
  adminUser?.role !== "SUPER_ADMIN"
) {
  throw new Error("Only admin or super admin can create users");
}
      
      const { name, email, password, gender, phone, department, role_id, organization_id } = data;

      const authModel = new AuthModel();

      const existing = await authModel.getUserForLogin(email);
      if (existing) {
        throw new Error("User already exists");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await authModel.createUser({
        name,
        email,
        password: hashedPassword,
        role_id,
        gender,
        phone,
        department,
        organization_id,
      });

      // 🔑 Generate tokens
      // const tokens = JwtUtilities.generateTokens({
      //   user_id: user.user_id,
      //   email: user.email,
      //   role: role_id,
      // });
      
      // const accessToken=tokens.accessToken
      // const refreshToken=tokens.refreshToken
      
      // const updateUser = await authModel.updateUser(user.user_id, {
      //   access_token: accessToken,
      //   refresh_token: refreshToken
      // });

      return {
        success: true,
        message: "User registered successfully",
        data: user,
      };

    } catch (error) {
      throw error;
    }
  }

  // 👑 REGISTER SUPER ADMIN
static async registerSuperAdmin(data) {
  try {
    const { name, email, password, gender, phone, role_id } = data;

    const authModel = new AuthModel();

    // 🔍 Check if user exists
    const existing = await authModel.getUserForLogin(email);
    if (existing) {
      throw new Error("User already exists");
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 👤 Create super admin (NO org_id, NO department)
    const user = await authModel.createUser({
      name,
      email,
      password: hashedPassword,
      role_id,
      gender,
      phone
    });

    if (!user) {
      throw new Error("Failed to create super admin");
    }

    // 🔑 Generate tokens
    const tokens = JwtUtilities.generateTokens({
      user_id: user.user_id,
      email: user.email,
      role: role_id,
    });

    const accessToken = tokens.accessToken;
    const refreshToken = tokens.refreshToken;

    // 💾 Save tokens
    await authModel.updateUser(user.user_id, {
      access_token: accessToken,
      refresh_token: refreshToken
    });

    return {
      success: true,
      message: "Super Admin registered successfully",
      data: {
        user,
        accessToken,
        refreshToken
      },
    };

  } catch (error) {
    throw error;
  }
}
}

module.exports = AuthenticationManager;