const jwt = require("jsonwebtoken");
const User = require("../models/user");

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return res
          .status(401)
          .json({ message: "Invalid token. User not found." });
      }

      req.user = user;
      next();
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);
      return res
        .status(401)
        .json({ message: "Invalid token format or expired." });
    }
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({
      message: "Authentication error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return res.status(401).json({ message: "User not found." });
      }

      if (user.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Access denied. Admin privileges required." });
      }

      req.user = user;
      next();
    } catch (jwtError) {
      return res
        .status(401)
        .json({ message: "Invalid token format or expired." });
    }
  } catch (error) {
    console.error("Admin verification error:", error);
    res.status(500).json({
      message: "Authentication error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

module.exports = { verifyToken, isAdmin };
