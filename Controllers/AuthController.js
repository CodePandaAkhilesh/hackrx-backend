const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../Models/User");

// User Signup Handler
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists with the same email
    const user = await UserModel.findOne({ email });
    if (user) {
      return res.status(409).json({
        message: "User already exists, you can login",
        success: false,
      });
    }

    // Create new user and hash password
    const userModel = new UserModel({ name, email, password });
    userModel.password = await bcrypt.hash(password, 10); // Hash with salt rounds = 10
    await userModel.save();

    // Respond with success message
    res.status(201).json({
      message: "Signup successful",
      success: true,
    });
  } catch (err) {
    // Internal error
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// User Login Handler
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Common error message
    const errorMsg = "Auth failed: email or password is incorrect";

    // Find user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(403).json({ message: errorMsg, success: false });
    }

    // Compare entered password with hashed password
    const isPassEqual = await bcrypt.compare(password, user.password);
    if (!isPassEqual) {
      return res.status(403).json({ message: errorMsg, success: false });
    }

    // Generate JWT Token
    const jwtToken = jwt.sign(
      { email: user.email, _id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" } // Token valid for 24 hours
    );

    // Respond with token and user details
    res.status(200).json({
      message: "Login successful",
      success: true,
      jwtToken,
      email,
      name: user.name,
    });
  } catch (err) {
    // Internal error
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// Export controller functions
module.exports = {
  signup,
  login,
};
