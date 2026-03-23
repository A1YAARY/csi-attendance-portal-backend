const COMMON_MESSAGES = {
  STRING_BASE: "{#label} must be a string",
  STRING_EMPTY: "{#label} cannot be empty",
  STRING_MIN: "{#label} should have at least {#limit} characters",
  STRING_MAX: "{#label} should have at most {#limit} characters",
  ANY_REQUIRED: "{#label} is required",
  NUMBER_BASE: "{#label} must be a number",
  NUMBER_MIN: "{#label} must be greater than or equal to {#limit}",
  NUMBER_MAX: "{#label} must be less than or equal to {#limit}",
  NUMBER_INTEGER: "{#label} must be an integer",
  NUMBER_POSITIVE: "{#label} must be a positive number",
  STRING_EMAIL: "{#label} must be a valid email"
};

module.exports = 
  COMMON_MESSAGES
;
