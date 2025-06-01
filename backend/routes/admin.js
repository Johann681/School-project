const express = require("express");
const router = express.Router();
const Student = require("../models/students");  // your students model
const Admin = require("../models/admin");        // your admin model
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ success: false, message: "No token provided" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ success: false, message: "Invalid token" });
    req.adminId = decoded.id;
    next();
  });
};

// Admin login route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ success: false, message: "Username and password are required" });

  try {
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ success: false, message: "Invalid username or password" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid username or password" });

    // Create JWT token
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ success: true, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all students - protected route
router.get("/students", authMiddleware, async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json({ success: true, students });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delete a student - protected route
router.delete("/students/:id", authMiddleware, async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Student deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
