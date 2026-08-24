const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const xss = require("xss");
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");

const sanitize = (value) => {
  if (typeof value !== "string") return "";
  return xss(value.trim());
};

const buildToken = (user) => {
  return jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

const isStrongPassword = (password) => {
  return (
    typeof password === "string" &&
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password)
  );
};

const sanitizeEmail = (value) => sanitize(value).toLowerCase();

router.post("/parent/signup", async (req, res) => {
  try {
    const email = sanitizeEmail(req.body.email);
    const studentCode = sanitize(req.body.studentCode).toUpperCase();
    const password = sanitize(req.body.password);
    const fullName = sanitize(req.body.fullName || "Parent");

    if (!email || !studentCode || !password) {
      return res.status(400).json({ success: false, message: "Email, student code, and password are required." });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters and include uppercase, lowercase, and a number." });
    }

    const student = await User.findOne({ role: "STUDENT", studentCode, isActivated: true }).select("_id");
    if (!student) return res.status(404).json({ success: false, message: "Student code is invalid or the student is not active." });

    let parent = await User.findOne({ email });
    if (parent) {
      if (parent.role !== "PARENT") return res.status(409).json({ success: false, message: "That email belongs to another portal account." });
      if (!parent.linkedStudents.some((id) => id.equals(student._id))) parent.linkedStudents.push(student._id);
      await parent.save();
    } else {
      parent = await User.create({ fullName, email, password, role: "PARENT", isActivated: true, linkedStudents: [student._id] });
    }

    return res.status(201).json({ success: true, message: "Parent account linked successfully.", email: parent.email, role: parent.role });
  } catch (err) {
    console.error("Parent signup error:", err);
    return res.status(500).json({ success: false, message: "Unable to create or link the parent account." });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("fullName email role isActivated")
      .lean();

    if (!user || !user.isActivated) {
      return res.status(401).json({ success: false, message: "Session is no longer valid." });
    }

    return res.json({
      success: true,
      user: {
        name: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Session check error:", err);
    return res.status(500).json({ success: false, message: "Unable to verify session." });
  }
});

router.post("/activate-student", async (req, res) => {
  try {
    const email = sanitize(req.body.email).toLowerCase();
    const passkey = sanitize(req.body.passkey);
    const password = sanitize(req.body.password);

    if (!email || !passkey || !password) {
      return res.status(400).json({
        success: false,
        message: "Email, passkey, and password are required to activate the account.",
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters and include uppercase, lowercase, and a number.",
      });
    }

    const user = await User.findOne({ email, passkey, isActivated: false }).select("fullName email role password passkey");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No pending activation found for the provided email and passkey.",
      });
    }

    user.password = password;
    user.isActivated = true;
    user.passkey = undefined;
    await user.save();

    const token = buildToken(user);
    res.json({
      success: true,
      message: "Activation complete. Your student account is ready.",
      token,
      role: user.role,
      name: user.fullName,
      email: user.email,
    });
  } catch (err) {
    console.error("Activation error:", err);
    res.status(500).json({
      success: false,
      message: "Unable to activate the student account at this time.",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const email = sanitize(req.body.email).toLowerCase();
    const password = sanitize(req.body.password);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required for login.",
      });
    }

    const user = await User.findOne({ email }).select("fullName email role password isActivated");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    if (!user.isActivated) {
      return res.status(403).json({
        success: false,
        message: "Account is not activated yet. Please activate before logging in.",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    const token = buildToken(user);
    res.json({
      success: true,
      message: "Login successful.",
      token,
      role: user.role,
      name: user.fullName,
      email: user.email,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
});

module.exports = router;
