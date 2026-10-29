const jwt = require("jsonwebtoken");

const requireLegacyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Legacy admin login required." });
  }

  try {
    const decoded = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
    if (decoded.role !== "LEGACY_ADMIN" || !decoded.id) {
      return res.status(403).json({ success: false, message: "Legacy admin access required." });
    }
    req.legacyAdminId = decoded.id;
    return next();
  } catch {
    return res.status(401).json({ success: false, message: "Legacy admin session is invalid or expired." });
  }
};

module.exports = { requireLegacyAdmin };
