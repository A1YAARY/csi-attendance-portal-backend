const knex = require("../../models/libs/Db");
const bcrypt = require("bcrypt");
const { PUBLIC_SCHEMA } = require("../../models/libs/dbConstants");
const AuthValidator = require("../../validators/authValidator");
const jwtHelper = require("../../routes/utilities/jwtUtilities");
const AuthModel = require("../../models/authModel")

class AuthController {
    //register organisation
    static async registerOrganization(body) {
    try {
        const { error, value } = AuthValidator
            .registerOrganization()
            .validate(body, { abortEarly: false });

        if (error) {
            throw {
                statusCode: 400,
                message: error.details.map(e => e.message),
            };
        }

        const authModel = new AuthModel(); // ❌ removed req.user

        // 🔴 Check duplicate
        const existing = await authModel.findOrganizationByName(value.name);

        if (existing) {
            throw {
                statusCode: 409,
                message: "Organization already exists",
            };
        }

        // ✅ Create
        const org = await authModel.createOrganization(value);

        return {
            data: org,
        };

    } catch (err) {
        throw err;
    }
}

    // register user
static async registerUser(body) {
    try {

        const { error, value } = AuthValidator
            .registerUser()
            .validate(body, { abortEarly: false });

        if (error) {
            throw {
                statusCode: 400,
                message: error.details.map(e => e.message),
            };
        }

        const authModel = new AuthModel(null);

        // 🔴 Check if user already exists
        const existingUser = await authModel.getUserForLogin(value.email);

        if (existingUser) {
            throw {
                statusCode: 409,
                message: "Email already exists",
            };
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

        // ✅ Create user
        const user = await authModel.createUser(userPayload);

        // 🎟️ Generate JWT
        const token = jwtHelper.generateToken({
            user_id: user.user_id,
            email: user.email,
            role_id: user.role_id,
        });

        return {
            token,
            data: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
            },
        };

    } catch (err) {
        throw err;
    }
}

    //LOGIN
    static async login(body) {
    try {

        // ✅ Validate request
        const { error, value } = AuthValidator
            .loginUser()
            .validate(body, { abortEarly: false });

        if (error) {
            throw {
                statusCode: 400,
                message: error.details.map(e => e.message),
            };
        }

        const { email, password } = value;

        const authModel = new AuthModel(null);

        // 🔍 Get user
        const user = await authModel.getUserForLogin(email);

        // 🔐 Avoid user enumeration
        if (!user) {
            throw {
                statusCode: 401,
                message: "Invalid credentials",
            };
        }

        // 🔐 Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            throw {
                statusCode: 401,
                message: "Invalid credentials",
            };
        }

        // 🎟️ Generate JWT
        const token = jwtHelper.generateToken({
            user_id: user.user_id,
            email: user.email,
            role_id: user.role_id,
        });

        return {
            token,
            data: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
            },
        };

    } catch (err) {
        throw err;
    }
}

}

module.exports = AuthController;