const express = require("express");
const router = express.Router();
const xss = require("xss");
const Attendance = require("../models/Attendance");
const Course = require("../models/Course");
const User = require("../models/User");
const { requireAuth, requireRole } = require("../middleware/auth");
const { auditLogger } = require("../middleware/auditLog");
const TimetableSlot = require("../models/TimetableSlot");

const sanitize = (value) => {
  if (typeof value !== "string") return "";
  return xss(value.trim());
};

router.use(requireAuth, requireRole("TEACHER"));

const getCurrentSlot = async (teacherId) => {
  const now = new Date();
  const day = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][now.getDay()];
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const slots = await TimetableSlot.find({ day }).populate({ path: "subjectAssignment", match: { teacher: teacherId }, populate: [{ path: "subject", select: "name code" }, { path: "teacher", select: "fullName" }] }).populate("class", "name level section academicSession").lean();
  return slots.find((slot) => slot.subjectAssignment && currentTime >= slot.startTime && currentTime < slot.endTime) || null;
};

router.get("/current-session", async (req, res) => {
  try {
    const slot = await getCurrentSlot(req.user._id);
    if (!slot) return res.json({ success: true, active: false, session: null });
    const course = await Course.findOne({ title: slot.subjectAssignment.subject.name, targetClass: slot.class._id, teachers: req.user._id }).select("_id title code").lean();
    if (!course) return res.json({ success: true, active: false, session: null });
    const students = await User.find({ role: "STUDENT", studentClass: slot.class._id, enrolledCourses: course._id }).select("_id fullName email").sort({ fullName: 1 }).lean();
    return res.json({ success: true, active: true, session: { slot, course, students } });
  } catch (err) {
    console.error("Current attendance session error:", err);
    return res.status(500).json({ success: false, message: "Unable to check the current attendance session." });
  }
});

router.post("/record", async (req, res) => {
  try {
    const classId = sanitize(req.body.classId);
    const courseId = sanitize(req.body.courseId);
    const period = sanitize(req.body.period);
    const academicSession = sanitize(req.body.academicSession);
    const term = sanitize(req.body.term);
    const records = Array.isArray(req.body.records) ? req.body.records : [];

    if (!classId || !period || !academicSession || !term || records.length === 0) {
      return res.status(400).json({ success: false, message: "All attendance fields are required." });
    }

    const currentSlot = await getCurrentSlot(req.user._id);
    const currentAssignment = currentSlot?.subjectAssignment;
    const course = await Course.findOne({ _id: courseId, targetClass: classId, teachers: req.user._id }).lean();
    const currentCourse = currentAssignment && course && currentAssignment.subject?.name === course.title && currentSlot.class?._id.toString() === classId;
    if (!currentCourse || currentSlot.period.toString() !== period || currentSlot.class.academicSession !== academicSession || currentSlot.term !== term) {
      return res.status(403).json({ success: false, message: "Attendance is only available during your scheduled timetable period." });
    }

    const studentIds = records.map((item) => item.studentId);
    const registeredStudents = await User.find({ _id: { $in: studentIds }, role: "STUDENT", studentClass: classId, enrolledCourses: courseId }).select("_id").lean();
    if (registeredStudents.length !== records.length) {
      return res.status(403).json({ success: false, message: "Attendance can only be recorded for students registered to this course by the administrator." });
    }

    const attendance = await Attendance.create({
      classId,
      teacherId: req.user._id,
      courseId,
      period,
      academicSession,
      term,
      records: records.map((item) => ({
        studentId: item.studentId,
        status: item.status,
      })),
    });

    await auditLogger(req, "RECORD_ATTENDANCE", {
      classId,
      courseId,
      period,
      academicSession,
      term,
      recordsCount: records.length,
    });

    return res.status(201).json({ success: true, attendance });
  } catch (err) {
    console.error("Attendance record error:", err);
    return res.status(500).json({ success: false, message: "Unable to record attendance." });
  }
});

router.post("/scan", async (req, res) => {
  try {
    const qrToken = sanitize(req.body.qrToken);

    if (!qrToken) {
      return res.status(400).json({ success: false, message: "Attendance token is required." });
    }

    // In the next pass we can verify signed QR tokens and link them to student/class records.
    return res.status(200).json({ success: true, message: "Attendance token accepted. Verification workflow pending." });
  } catch (err) {
    console.error("Attendance scan error:", err);
    return res.status(500).json({ success: false, message: "Unable to process attendance scan." });
  }
});

module.exports = router;
