const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to protect routes
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // 1. Extract token from header
      token = req.headers.authorization.split(" ")[1];

      // 2. Verify token using the correct secret key
      //    (Ensure this variable name matches the one used for signing)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Find user by `_id` from the decoded payload
      //    This is the main fix for the Google login issue.
      req.user = await User.findById(decoded.id).select("-password"); // Use 'decoded.id'

      // 4. Handle case where user might not be found
      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next(); // Proceed to the next middleware/controller
    } else {
      res.status(401).json({ message: "Not authorized, no token" });
    }
  } catch (error) {
    // This will catch errors from an invalid/expired token
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

module.exports = { protect };
