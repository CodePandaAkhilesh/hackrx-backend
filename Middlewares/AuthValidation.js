const Joi = require("joi");

// Signup request validation
const signupValidation = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(100).required(),         // Name: required, 3–100 chars
    email: Joi.string().email().required(),                // Valid email: required
    password: Joi.string().min(4).max(100).required(),     // Password: 4–100 chars
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: "Bad request: Invalid signup data",
      error: error.details[0].message,
    });
  }

  next(); // Proceed if no validation error
};

// Login request validation
const loginValidation = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),                // Email: required
    password: Joi.string().min(4).max(100).required(),     // Password: 4–100 chars
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: "Bad request: Invalid login data",
      error: error.details[0].message,
    });
  }

  next(); // Proceed if no validation error
};

// Export middlewares
module.exports = {
  signupValidation,
  loginValidation,
};
