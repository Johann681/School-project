const express = require("express");
const router = express.Router();
const Student = require("../models/students");
const xss = require("xss");

// ✅ Enrollment Route with Sanitization
router.post("/", async (req, res) => {
  try {
    let { fullName, email, dob, phone, class: studentClass, department } = req.body;

    // ✅ Basic Validation
    if (!fullName || !email || !dob || !phone || !studentClass || !department) {
      return res.status(400).json({ success: false, message: "All enrollment fields are required." });
    }

    // ✅ Input Sanitization (protect against XSS)
    fullName = xss(fullName.trim());
    email = xss(email.trim().toLowerCase());
    phone = xss(phone.trim());
    studentClass = xss(studentClass.trim());
    department = xss(department.trim());

    // ✅ Check if the email already exists
    const existingStudent = await Student.findOne({ email });

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: "This email address has already been used for enrollment.",
      });
    }

    // ✅ Create new student
    const newStudent = new Student({
      fullName,
      email,
      dob,
      phone,
      class: studentClass,
      department,
    });

    await newStudent.save();

    res.status(201).json({ success: true, message: "Enrollment application submitted successfully." });
  } catch (err) {
    console.error("Enrollment error:", err);
    res.status(500).json({ success: false, message: "A server error occurred. Please try again later." });
  }
});

module.exports = router;
