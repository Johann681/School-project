const express = require("express");
const router = express.Router();
const Student = require("../models/students");

router.post("/", async (req, res) => {
  const { fullName, email, dob, phone, class: studentClass, department } = req.body;

  // ✅ Check for missing fields
  if (!fullName || !email || !dob || !phone || !studentClass || !department) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  try {
    // ✅ Check if the email already exists
    const existingStudent = await Student.findOne({ email });

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: "This email has already been used for enrollment.",
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

    res.json({ success: true, message: "Enrollment successful." });
  } catch (err) {
    console.error("Enrollment error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;
