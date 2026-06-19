const express = require("express");
const crypto = require("crypto");
const xss = require("xss");
const router = express.Router();
const User = require("../models/User");
const Student = require("../models/students");
const Course = require("../models/Course");
const Submission = require("../models/Submission");
const Performance = require("../models/Performance");
const EnrollmentRequest = require("../models/EnrollmentRequest");
const { requireAuth, requireRole } = require("../middleware/auth");

const sanitize = (value) => {
  if (typeof value !== "string") return "";
  return xss(value.trim());
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

const buildPasskey = () => {
  return crypto
    .randomBytes(8)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 6)
    .toUpperCase();
};

router.use(requireAuth, requireRole("admin"));

router.post("/create-student-passkey", async (req, res) => {
  try {
    const name = sanitize(req.body.name);
    const email = sanitize(req.body.email).toLowerCase();

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Student name and email are required.",
      });
    }

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A user with that email already exists.",
      });
    }

    const passkey = buildPasskey();
    const newStudent = new User({
      name,
      email,
      role: "student",
      passkey,
      isActivated: false,
    });

    await newStudent.save();

    return res.status(201).json({
      success: true,
      message: "Student shell account created.",
      passkey,
      email,
    });
  } catch (err) {
    console.error("Create Student Passkey Error:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to create student passkey at this time.",
    });
  }
});

router.post("/create-teacher", async (req, res) => {
  try {
    const name = sanitize(req.body.name);
    const email = sanitize(req.body.email).toLowerCase();
    const password = sanitize(req.body.password);

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Teacher name, email, and password are required.",
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters and include uppercase, lowercase, and a number.",
      });
    }

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A user with that email already exists.",
      });
    }

    const newTeacher = new User({
      name,
      email,
      password,
      role: "teacher",
      isActivated: true,
    });

    await newTeacher.save();

    return res.status(201).json({
      success: true,
      message: "Teacher account created successfully.",
      email,
    });
  } catch (err) {
    console.error("Create Teacher Error:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to create teacher account at this time.",
    });
  }
});

router.get("/students", async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 }).lean();
    return res.json({ success: true, students });
  } catch (err) {
    console.error("Fetch enrolled students error:", err);
    return res.status(500).json({ success: false, message: "Unable to retrieve admission applications." });
  }
});

router.get("/account-students", async (req, res) => {
  try {
    const accountStudents = await User.find({ role: "student" })
      .select("name email isActivated enrolledCourses createdAt")
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ success: true, accountStudents });
  } catch (err) {
    console.error("Fetch account students error:", err);
    return res.status(500).json({ success: false, message: "Unable to retrieve LMS student accounts." });
  }
});

router.delete("/account-students/:id", async (req, res) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: "student" }).lean();
    if (!student) {
      return res.status(404).json({ success: false, message: "LMS student account not found." });
    }

    await Promise.all([
      Submission.deleteMany({ studentId: student._id }),
      Performance.deleteMany({ studentId: student._id }),
      EnrollmentRequest.deleteMany({ studentId: student._id }),
      User.findByIdAndDelete(student._id),
    ]);

    return res.json({ success: true, message: "LMS student account and linked records removed." });
  } catch (err) {
    console.error("Delete account student error:", err);
    return res.status(500).json({ success: false, message: "Unable to delete LMS student account." });
  }
});

router.delete("/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student enrollment not found." });
    }
    return res.json({ success: true, message: "Student enrollment removed." });
  } catch (err) {
    console.error("Delete enrolled student error:", err);
    return res.status(500).json({ success: false, message: "Unable to delete enrolled student." });
  }
});

router.get("/teachers", async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" })
      .select("name email createdAt")
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ success: true, teachers });
  } catch (err) {
    console.error("Fetch teachers error:", err);
    return res.status(500).json({ success: false, message: "Unable to retrieve teacher roster." });
  }
});

router.delete("/teachers/:id", async (req, res) => {
  try {
    const teacherId = req.params.id;
    const teacher = await User.findOne({ _id: teacherId, role: "teacher" }).lean();
    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher account not found." });
    }

    const courses = await Course.find({ teacherId }).lean();
    const courseIds = courses.map((course) => course._id);

    await Submission.deleteMany({ courseId: { $in: courseIds } });
    await Performance.deleteMany({ courseId: { $in: courseIds } });
    await Course.deleteMany({ teacherId });
    await User.findByIdAndDelete(teacherId);

    return res.json({ success: true, message: "Teacher account and linked course data removed." });
  } catch (err) {
    console.error("Delete teacher error:", err);
    return res.status(500).json({ success: false, message: "Unable to delete teacher account." });
  }
});

module.exports = router;
