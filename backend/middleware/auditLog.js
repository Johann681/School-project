const AuditLog = require("../models/AuditLog");

const sanitizePayload = (payload) => {
  if (!payload || typeof payload !== "object") return {};
  const summary = {};

  Object.entries(payload).forEach(([key, value]) => {
    if (["password", "confirmPassword", "token", "authorization"].includes(key.toLowerCase())) {
      return;
    }

    if (typeof value === "string" && value.length > 200) {
      summary[key] = `${value.slice(0, 200)}...`;
      return;
    }

    summary[key] = value;
  });

  return summary;
};

const auditLogger = async (req, action, details = {}) => {
  try {
    await AuditLog.create({
      actorId: req.user?._id,
      role: req.user?.role,
      action,
      endpoint: req.originalUrl,
      method: req.method,
      details: {
        ...sanitizePayload(details),
      },
    });
  } catch (err) {
    console.error("Audit log error:", err);
  }
};

module.exports = {
  auditLogger,
};
