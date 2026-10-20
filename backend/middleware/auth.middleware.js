const jwt = require("jsonwebtoken");
const User = require("../models/User");
const BlacklistedToken = require("../models/BlacklistedToken");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication token required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.jti || !decoded.exp || !decoded.userId) {
      return res.status(401).json({
        message: "Invalid authentication token",
      });
    }

    const blacklisted = await BlacklistedToken.exists({
      jti: decoded.jti,
    });

    if (blacklisted) {
      return res.status(401).json({
        message: "Token has been revoked. Please log in again.",
      });
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: "User no longer exists",
      });
    }

    req.user = user;
    req.token = token;
    req.tokenPayload = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message:
        error.name === "TokenExpiredError"
          ? "Token expired. Please log in again."
          : "Invalid authentication token",
    });
  }
};

module.exports = { protect };