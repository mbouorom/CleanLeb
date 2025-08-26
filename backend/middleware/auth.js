/* eslint-disable @typescript-eslint/no-require-imports */
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ---------------- AUTH MIDDLEWARE ----------------
const auth = async (req, res, next) => {
  try {
    console.log("🔐 Auth middleware - Headers:", req.headers.authorization);

    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ No valid auth header");
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    const token = authHeader.split(" ")[1];
    console.log("🎫 Token extracted:", token.substring(0, 20) + "...");
    console.log("🔑 JWT_SECRET exists:", !!process.env.JWT_SECRET);

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token decoded:", {
      userId: decoded.userId,
      email: decoded.email,
    });

    if (!decoded || !decoded.userId) {
      console.log("❌ Invalid decoded token");
      return res.status(401).json({ message: "Token is not valid" });
    }

    // Find user in DB (exclude password)
    const user = await User.findById(decoded.userId).select("-password");
    console.log(
      "👤 User found:",
      user ? `${user.name} (${user.email})` : "null"
    );

    if (!user) {
      console.log("❌ User not found in database");
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user; // attach user to request
    console.log("✅ Auth successful for:", user.email);
    next();
  } catch (err) {
    console.error("❌ Auth error:", err.message);
    console.error("❌ Full error:", err);
    res.status(401).json({ message: "Token is not valid" });
  }
};

// --------------- ADMIN / MUNICIPAL MIDDLEWARE ---------------
const adminAuth = (req, res, next) => {
  // Ensure auth middleware ran first
  if (!req.user) {
    return res.status(401).json({ message: "Authorization failed" });
  }

  if (req.user.role !== "admin" && req.user.role !== "municipal") {
    return res
      .status(403)
      .json({ message: "Access denied. Admin privileges required." });
  }

  next();
};

module.exports = { auth, adminAuth };
