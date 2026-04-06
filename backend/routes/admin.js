const express = require("express");
const router = express.Router();
const Student = require("../models/students");
const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const rateLimit = require("express-rate-limit");

// ✅ Rate Limiter for Login (Brute-force protection)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per window
  message: { success: false, message: "Too many login attempts. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Authentication required. Please log in." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired session. Please log in again." });
  }
};

// ✅ Admin Login Route with Rate Limiting
router.post("/login", loginLimiter, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password are required." });
  }

  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    // ✅ Create JWT token (Consistent response)
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ success: true, message: "Login successful.", token });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ success: false, message: "Server error during login." });
  }
});

// ✅ Get all students - protected route
router.get("/students", authMiddleware, async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json({ success: true, students });
  } catch (err) {
    console.error("Fetch Students Error:", err);
    res.status(500).json({ success: false, message: "Failed to retrieve student records." });
  }
});

// ✅ GET single student details - protected route
router.get("/students/:id", authMiddleware, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student record not found." });
    }
    res.json({ success: true, student });
  } catch (err) {
    console.error("Fetch Student ID Error:", err);
    res.status(500).json({ success: false, message: "Error fetching student details." });
  }
});

// ✅ Delete a student - protected route
router.delete("/students/:id", authMiddleware, async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student record already deleted or not found." });
    }
    res.json({ success: true, message: "Student record successfully deleted." });
  } catch (err) {
    console.error("Delete Student Error:", err);
    res.status(500).json({ success: false, message: "Failed to delete student record." });
  }
});

module.exports = router;
