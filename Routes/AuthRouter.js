// Import controller functions for authentication
const { signup, login } = require("../Controllers/AuthController");

// Import middleware functions for validating signup and login requests
const {
  signupValidation,
  loginValidation,
} = require("../Middlewares/AuthValidation");

// Create a new router instance from Express
const router = require("express").Router();

// Route to handle user login
// Applies loginValidation middleware before calling login controller
router.post("/login", loginValidation, login);

// Route to handle user signup
// Applies signupValidation middleware before calling signup controller
router.post("/signup", signupValidation, signup);

// Export the configured router to be used in other parts of the app
module.exports = router;
