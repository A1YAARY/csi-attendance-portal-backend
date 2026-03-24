const knex = require("../config/db");
const bcrypt = require("bcrypt");
const { PUBLIC_SCHEMA } = require("../libs/dbConstants");
const AuthValidator = require("../../validators/authValidator");
const jwtHelper = require("../helpers/jwt.helper");

class AuthController {
    //register organisation
    static async registerOrganization(req, res) {
        try {
            // ✅ Use validator from class
            const { error, value } = AuthValidator
                .registerOrganization()
                .validate(req.body, { abortEarly: false });

            if (error) {
                return res.status(400).json({
                    success: false,
                    errors: error.details.map(e => e.message),
                });
            }

            const { name, address } = value;

            // 🔴 Check duplicate
            const existing = await knex
                .withSchema(PUBLIC_SCHEMA)
                .table("organization")
                .where({ name })
                .first();

            if (existing) {
                return res.status(409).json({
                    success: false,
                    message: "Organization already exists",
                });
            }

            // ✅ Insert
            const [org] = await knex
                .withSchema(PUBLIC_SCHEMA)
                .table("organization")
                .insert({ name, address })
                .returning("*");

            return res.status(201).json({
                success: true,
                message: "Organization registered successfully",
                data: org,
            });

        } catch (err) {
            console.error("Register Organization Error:", err);

            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    //register user
    static async registerUser(req, res) {
        try {
            // ✅ Validate
            const { error, value } = AuthValidator
                .registerUser()
                .validate(req.body, { abortEarly: false });

            if (error) {
                return res.status(400).json({
                    success: false,
                    errors: error.details.map(e => e.message),
                });
            }

            const {
                name,
                email,
                password,
                gender,
                organization_id,
                role_id,
                phone,
                department,
                working_start,
                working_end,
                profile_image,
            } = value;

            // 🔴 Check duplicate email
            const existingUser = await knex
                .withSchema(PUBLIC_SCHEMA)
                .table("users")
                .where({ email })
                .first();

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: "Email already exists",
                });
            }

            // 🔐 Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // ✅ Insert user
            const [user] = await knex
                .withSchema(PUBLIC_SCHEMA)
                .table("users")
                .insert({
                    name: name.trim(),
                    email: email.trim(),
                    password: hashedPassword,
                    gender,
                    organization_id: organization_id || null,
                    role_id: role_id || null,
                    phone: phone || null,
                    department: department || null,
                    working_start: working_start || "09:00:00",
                    working_end: working_end || "17:00:00",
                    profile_image: profile_image || null,
                })
                .returning("*");

            // 🎟️ Generate JWT immediately after register
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

            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    //LOGIN
    static async login(req, res) {
        try {
            // ✅ Validate
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

            // 🔍 Find user
            const user = await knex
                .withSchema(PUBLIC_SCHEMA)
                .table("users")
                .where({ email })
                .first();

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
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
                role_id: user.role_id,
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

            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

}

module.exports = AuthController;