const Joi = require("joi");
const COMMON_MESSAGES = require("./validationConstants/commonMessages");

class AuthValidator {
    // 🔹 Organization Validator
    static registerOrganization() {
        return Joi.object({
            name: Joi.string().min(2).max(255).required().messages({
                "string.base": COMMON_MESSAGES.STRING_BASE,
                "string.empty": COMMON_MESSAGES.STRING_EMPTY,
                "string.min": COMMON_MESSAGES.STRING_MIN,
                "string.max": COMMON_MESSAGES.STRING_MAX,
                "any.required": COMMON_MESSAGES.ANY_REQUIRED,
            }),

            address: Joi.string().min(5).required().messages({
                "string.base": COMMON_MESSAGES.STRING_BASE,
                "string.empty": COMMON_MESSAGES.STRING_EMPTY,
                "string.min": COMMON_MESSAGES.STRING_MIN,
                "any.required": COMMON_MESSAGES.ANY_REQUIRED,
            }),
        });
    }

    // 🔹 User Validator
    static registerUser() {
        return Joi.object({
            name: Joi.string().min(2).max(255).required().messages({
                "string.base": COMMON_MESSAGES.STRING_BASE,
                "string.empty": COMMON_MESSAGES.STRING_EMPTY,
                "string.min": COMMON_MESSAGES.STRING_MIN,
                "string.max": COMMON_MESSAGES.STRING_MAX,
                "any.required": COMMON_MESSAGES.ANY_REQUIRED,
            }),

            email: Joi.string().email().required().messages({
                "string.base": COMMON_MESSAGES.STRING_BASE,
                "string.email": COMMON_MESSAGES.STRING_EMAIL,
                "string.empty": COMMON_MESSAGES.STRING_EMPTY,
                "any.required": COMMON_MESSAGES.ANY_REQUIRED,
            }),

            password: Joi.string().min(6).required().messages({
                "string.base": COMMON_MESSAGES.STRING_BASE,
                "string.empty": COMMON_MESSAGES.STRING_EMPTY,
                "string.min": COMMON_MESSAGES.STRING_MIN,
                "any.required": COMMON_MESSAGES.ANY_REQUIRED,
            }),

            gender: Joi.string().required().messages({
                "string.base": COMMON_MESSAGES.STRING_BASE,
                "any.required": COMMON_MESSAGES.ANY_REQUIRED,
            }),

            organization_id: Joi.number().integer().positive().optional().messages({
                "number.base": COMMON_MESSAGES.NUMBER_BASE,
                "number.integer": COMMON_MESSAGES.NUMBER_INTEGER,
                "number.positive": COMMON_MESSAGES.NUMBER_POSITIVE,
            }),

            role_id: Joi.number().integer().positive().optional().messages({
                "number.base": COMMON_MESSAGES.NUMBER_BASE,
                "number.integer": COMMON_MESSAGES.NUMBER_INTEGER,
                "number.positive": COMMON_MESSAGES.NUMBER_POSITIVE,
            }),

            phone: Joi.string().optional().allow(null, "").messages({
                "string.base": COMMON_MESSAGES.STRING_BASE,
            }),

            department: Joi.string().optional().allow(null, "").messages({
                "string.base": COMMON_MESSAGES.STRING_BASE,
            }),

            working_start: Joi.string().optional().messages({
                "string.base": COMMON_MESSAGES.STRING_BASE,
            }),

            working_end: Joi.string().optional().messages({
                "string.base": COMMON_MESSAGES.STRING_BASE,
            }),

            profile_image: Joi.object().optional().allow(null),
        });
    }

    static loginUser() {
        return Joi.object({
            email: Joi.string().email().required().messages({
                "string.base": COMMON_MESSAGES.STRING_BASE,
                "string.email": COMMON_MESSAGES.STRING_EMAIL,
                "string.empty": COMMON_MESSAGES.STRING_EMPTY,
                "any.required": COMMON_MESSAGES.ANY_REQUIRED,
            }),

            password: Joi.string().required().messages({
                "string.base": COMMON_MESSAGES.STRING_BASE,
                "string.empty": COMMON_MESSAGES.STRING_EMPTY,
                "any.required": COMMON_MESSAGES.ANY_REQUIRED,
            }),
        });
    }
}

module.exports = AuthValidator;