const jwt = require("jsonwebtoken");

// Middleware to protect routes using JWT
const ensureAuthenticated = (req, res, next) => {
  // Get token from Authorization header
  const auth = req.headers["authorization"];

  // If token is missing, return 403 Forbidden
  if (!auth) {
    return res.status(403).json({
      message: "Unauthorized: JWT token is required",
    });
  }

  try {
    // Verify token using the secret key
    const decoded = jwt.verify(auth, process.env.JWT_SECRET);

    // Attach decoded user info to the request object
    req.user = decoded;

    // Continue to next middleware or route
    next();
  } catch (err) {
    // Token invalid or expired
    return res.status(403).json({
      message: "Unauthorized: JWT token is invalid or expired",
    });
  }
};

module.exports = ensureAuthenticated;
