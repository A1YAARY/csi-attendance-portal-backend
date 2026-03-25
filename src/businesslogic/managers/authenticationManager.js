const knex = require("../config/db");
const bcrypt = require("bcrypt");
const { PUBLIC_SCHEMA } = require("../libs/dbConstants");
const AuthValidator = require("../../validators/authValidator");
const jwtHelper = require("../helpers/jwt.helper");

class AuthController {
    //register organisation
    static async registerOrganization(req, res) {
        try {
            const { error, value } = AuthValidator
                .registerOrganization()
                .validate(req.body, { abortEarly: false });

            if (error) {
                return res.status(400).json({
                    success: false,
                    errors: error.details.map(e => e.message),
                });
            }

            const authModel = new AuthModel(req.user?.user_id);

            // 🔴 Check duplicate
            const existing = await authModel.findOrganizationByName(value.name);

            if (existing) {
                return res.status(409).json({
                    success: false,
                    message: "Organization already exists",
                });
            }

            // ✅ Create
            const org = await authModel.createOrganization(value);

            return res.status(201).json({
                success: true,
                message: "Organization registered successfully",
                data: org,
            });

        } catch (err) {
            return res.status(err.statusCode || 500).json({
                success: false,
                message: err.message,
            });
        }
    }

    //register user
    static async registerUser(req, res) {
        try {
            // ✅ Validate request
            const { error, value } = AuthValidator
                .registerUser()
                .validate(req.body, { abortEarly: false });

            if (error) {
                return res.status(400).json({
                    success: false,
                    errors: error.details.map(e => e.message),
                });
            }

            const authModel = new AuthModel(null);

            // 🔴 Check if user already exists
            const existingUser = await authModel.getUserForLogin(value.email);

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: "Email already exists",
                });
            }

            // 🔐 Hash password
            const hashedPassword = await bcrypt.hash(value.password, 10);

            // ✅ Prepare payload
            const userPayload = {
                name: value.name.trim(),
                email: value.email.trim(),
                password: hashedPassword,
                gender: value.gender,
                organization_id: value.organization_id || null,
                role_id: value.role_id || null,
                phone: value.phone || null,
                department: value.department || null,
                working_start: value.working_start || "09:00:00",
                working_end: value.working_end || "17:00:00",
                profile_image: value.profile_image || null,
            };

            // ✅ Create user via model
            const user = await authModel.createUser(userPayload);

            // 🎟️ Generate JWT
            const token = jwtHelper.generateToken({
                user_id: user.user_id,
                email: user.email,
                role_id: user.role_id,
            });

            return res.status(201).json({
                success: true,
                message: "User registered successfully",
                token,
                data: {
                    user_id: user.user_id,
                    name: user.name,
                    email: user.email,
                },
            });

        } catch (err) {
            console.error("Register User Error:", err);

            return res.status(err.statusCode || 500).json({
                success: false,
                message: err.message || "Internal server error",
            });
        }
    }

    //LOGIN
    static async login(req, res) {
        try {
            // ✅ Validate request
            const { error, value } = AuthValidator
                .loginUser()
                .validate(req.body, { abortEarly: false });

            if (error) {
                return res.status(400).json({
                    success: false,
                    errors: error.details.map(e => e.message),
                });
            }

            const { email, password } = value;

            const authModel = new AuthModel(null);

            // 🔍 Get user (includes password)
            const user = await authModel.getUserForLogin(email);

            // 🔐 Avoid user enumeration
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid credentials",
                });
            }

            // 🔐 Compare password
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid credentials",
                });
            }

            // 🎟️ Generate JWT
            const token = jwtHelper.generateToken({
                user_id: user.user_id,
                email: user.email,
                role_id: user.role_id, // may be undefined if not selected
            });

            return res.status(200).json({
                success: true,
                message: "Login successful",
                token,
                data: {
                    user_id: user.user_id,
                    name: user.name,
                    email: user.email,
                },
            });

        } catch (err) {
            console.error("Login Error:", err);

            return res.status(err.statusCode || 500).json({
                success: false,
                message: err.message || "Internal server error",
            });
        }
    }

}

module.exports = AuthController;