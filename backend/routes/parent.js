const express = require("express");
const router = express.Router();
const Announcement = require("../models/Announcement");
const User = require("../models/User");
const Attendance = require("../models/Attendance");
const Course = require("../models/Course");
const Performance = require("../models/Performance");
const Submission = require("../models/Submission");
const TimetableSlot = require("../models/TimetableSlot");
const { requireAuth, requireRole } = require("../middleware/auth");

router.use(requireAuth, requireRole("PARENT"));

router.get("/children/results", async (req, res) => {
  try {
    const parent = await User.findById(req.user._id).populate({
      path: "linkedStudents",
      select: "fullName email studentClass",
      populate: {
        path: "studentClass",
        select: "name academicSession",
      },
    });

    if (!parent) {
      return res.status(404).json({ success: false, message: "Parent profile not found." });
    }

    const children = await Promise.all(
      parent.linkedStudents.map(async (student) => {
        const courses = await Course.find({ targetClass: student.studentClass })
          .select("title teachers targetClass")
          .populate("teachers", "fullName");

        const recentAttendance = await Attendance.find({ "records.studentId": student._id })
          .sort({ timestamp: -1 })
          .limit(10)
          .lean();
        const [performance, submissions] = await Promise.all([
          Performance.find({ studentId: student._id }).sort({ gradedAt: -1 }).limit(10).populate("courseId", "title").lean(),
          Submission.find({ studentId: student._id }).sort({ createdAt: -1 }).limit(20).lean(),
        ]);
        const averageScore = performance.length
          ? Math.round(performance.reduce((total, record) => total + record.score, 0) / performance.length)
          : null;

        return {
          studentId: student._id,
          studentName: student.fullName,
          studentEmail: student.email,
          studentClass: student.studentClass?.name,
          academicSession: student.studentClass?.academicSession,
          latestGrade: performance[0]?.score ?? null,
          summary: averageScore === null ? null : `Average score across recent graded work: ${averageScore}%`,
          performance,
          submissions,
          courses: courses.map((course) => ({
            _id: course._id,
            title: course.title,
            teachers: course.teachers.map((t) => t.fullName),
          })),
          attendance: recentAttendance.map((attendance) => ({
            date: attendance.timestamp,
            classId: attendance.classId,
            courseId: attendance.courseId,
            period: attendance.period,
            records: attendance.records.filter((record) => record.studentId.toString() === student._id.toString()),
          })),
        };
      })
    );

    return res.json({ success: true, children });
  } catch (err) {
    console.error("Parent children results error:", err);
    return res.status(500).json({ success: false, message: "Unable to retrieve linked children's results." });
  }
});

router.get("/announcements", async (req, res) => {
  try {
    const announcements = await Announcement.find({
      $or: [
        { targetAudience: "ALL" },
        { targetAudience: "PARENTS" },
      ],
    })
      .sort({ createdAt: -1 })
      .populate("author", "fullName role")
      .lean();

    return res.json({ success: true, announcements });
  } catch (err) {
    console.error("Parent announcements error:", err);
    return res.status(500).json({ success: false, message: "Unable to fetch announcements." });
  }
});

router.get("/timetable/:studentId", async (req, res) => {
  const parent = await User.findOne({ _id: req.user._id, linkedStudents: req.params.studentId }).lean();
  if (!parent) return res.status(403).json({ success: false, message: "You are not linked to this student." });
  const student = await User.findOne({ _id: req.params.studentId, role: "STUDENT" }).select("studentClass").lean();
  const slots = await TimetableSlot.find({ class: student?.studentClass }).populate("class", "name").populate({ path: "subjectAssignment", populate: [{ path: "subject", select: "name" }, { path: "teacher", select: "fullName" }] }).sort({ day: 1, period: 1 }).lean();
  return res.json({ success: true, timetable: slots });
});

module.exports = router;
