const express = require("express");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Student = require("../models/students");
const { requireLegacyAdmin } = require("../middleware/legacyAdminAuth");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const username = typeof req.body.username === "string" ? req.body.username.trim() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username and password are required." });
    }

    const admin = await Admin.findOne({ username }).select("+password");
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid username or password." });
    }

    const token = jwt.sign(
      { id: admin._id.toString(), role: "LEGACY_ADMIN" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );
    return res.json({ success: true, token, username: admin.username });
  } catch (error) {
    console.error("Legacy admin login error:", error);
    return res.status(500).json({ success: false, message: "Unable to sign in." });
  }
});

router.get("/students", requireLegacyAdmin, async (req, res) => {
  try {
    const students = await Student.find()
      .select("fullName email class department createdAt")
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ success: true, students });
  } catch (error) {
    console.error("Legacy admin student list error:", error);
    return res.status(500).json({ success: false, message: "Unable to load enrolled students." });
  }
});

module.exports = router;
