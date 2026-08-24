const express = require("express");
const xss = require("xss");
const router = express.Router();
const Course = require("../models/Course");
const Submission = require("../models/Submission");
const Performance = require("../models/Performance");
const EnrollmentRequest = require("../models/EnrollmentRequest");
const User = require("../models/User");
const TimetableSlot = require("../models/TimetableSlot");
const SubjectAssignment = require("../models/SubjectAssignment");
const { requireAuth, requireRole } = require("../middleware/auth");

const sanitize = (value) => {
  if (typeof value !== "string") return "";
  return xss(value.trim());
};

router.use(requireAuth, requireRole("TEACHER"));

router.get("/timetable", async (req, res) => {
  const slots = await TimetableSlot.find().populate("class", "name level section").populate({ path: "subjectAssignment", match: { teacher: req.user._id }, populate: [{ path: "subject", select: "name code" }, { path: "teacher", select: "fullName email" }] }).lean();
  return res.json({ success: true, timetable: slots.filter((slot) => slot.subjectAssignment) });
});

router.get("/subject-assignments", async (req, res) => {
  try {
    const assignments = await SubjectAssignment.find({ teacher: req.user._id })
      .populate("subject", "name code")
      .populate("class", "name level section academicSession")
      .sort({ "class.name": 1, "subject.name": 1 })
      .lean();
    return res.json({ success: true, assignments });
  } catch (err) {
    console.error("Teacher subject assignments error:", err);
    return res.status(500).json({ success: false, message: "Unable to fetch your subject assignments." });
  }
});

router.get("/courses", async (req, res) => {
  try {
    const assignments = await SubjectAssignment.find({ teacher: req.user._id })
      .populate("subject", "name code")
      .populate("class", "name")
      .lean();
    for (const assignment of assignments) {
      const existingCourse = await Course.findOne({ targetClass: assignment.class._id, title: assignment.subject.name });
      if (!existingCourse) {
        const code = `${assignment.subject.code}-${assignment.class.name}`.replace(/[^A-Z0-9-]/gi, "-").toUpperCase();
        await Course.create({ title: assignment.subject.name, code, targetClass: assignment.class._id, teachers: [req.user._id], materials: [], assignments: [] });
      } else if (!existingCourse.teachers.some((id) => id.toString() === req.user._id.toString())) {
        existingCourse.teachers.push(req.user._id);
        await existingCourse.save();
      }
    }
    const courses = await Course.find({ teachers: req.user._id })
      .lean()
      .select("title code materials assignments")
      .sort({ createdAt: -1 });

    res.json({ success: true, courses });
  } catch (err) {
    console.error("Teacher courses error:", err);
    res.status(500).json({ success: false, message: "Unable to fetch your courses." });
  }
});

router.post("/create-course", async (req, res) => {
  try {
    const title = sanitize(req.body.title);
    const code = sanitize(req.body.code).toUpperCase();

    if (!title || !code) {
      return res.status(400).json({ success: false, message: "Course title and code are required." });
    }

    const existing = await Course.findOne({ code }).lean();
    if (existing) {
      return res.status(409).json({ success: false, message: "Course code already exists." });
    }

    const course = await Course.create({ title, code, teachers: [req.user._id], materials: [], assignments: [], targetClass: req.body.targetClass || undefined });
    res.status(201).json({ success: true, message: "Course created successfully.", course });
  } catch (err) {
    console.error("Create course error:", err);
    res.status(500).json({ success: false, message: "Unable to create course." });
  }
});

router.delete("/courses/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const course = await Course.findOne({ _id: courseId, teachers: req.user._id }).lean();

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found or access denied." });
    }

    await Promise.all([
      Submission.deleteMany({ courseId }),
      Performance.deleteMany({ courseId }),
      EnrollmentRequest.deleteMany({ courseId }),
      User.updateMany({ role: "STUDENT", enrolledCourses: courseId }, { $pull: { enrolledCourses: courseId } }),
      Course.findByIdAndDelete(courseId),
    ]);

    res.json({ success: true, message: "Course and linked records deleted successfully.", courseId });
  } catch (err) {
    console.error("Delete course error:", err);
    res.status(500).json({ success: false, message: "Unable to delete course." });
  }
});

router.post("/drop-material/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const title = sanitize(req.body.title);
    const url = sanitize(req.body.url);

    if (!title || !url) {
      return res.status(400).json({ success: false, message: "Material title and URL are required." });
    }

    const course = await Course.findOne({ _id: courseId, teachers: req.user._id });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found or access denied." });
    }

    course.materials.push({ title, url, addedBy: req.user._id });
    await course.save();

    res.json({ success: true, message: "Material added successfully.", materials: course.materials });
  } catch (err) {
    console.error("Drop material error:", err);
    res.status(500).json({ success: false, message: "Unable to add material." });
  }
});

router.get("/submissions/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const course = await Course.findOne({ _id: courseId, teachers: req.user._id }).lean();
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found or access denied." });
    }

    const submissions = await Submission.find({ courseId })
      .populate("studentId", "fullName email")
      .lean()
      .select("studentId courseId assignmentId assignmentTitle submissionData createdAt")
      .sort({ createdAt: -1 });

    res.json({ success: true, course, submissions });
  } catch (err) {
    console.error("Fetch submissions error:", err);
    res.status(500).json({ success: false, message: "Unable to retrieve submissions." });
  }
});

router.post("/grade-and-purge/:submissionId", async (req, res) => {
  try {
    const submissionId = req.params.submissionId;
    const score = Number(req.body.score);
    const focusAreas = sanitize(req.body.focusAreas);

    if (!submissionId || Number.isNaN(score) || score < 0 || score > 100 || !focusAreas) {
      return res.status(400).json({ success: false, message: "Score and focus area feedback are required." });
    }

    const submission = await Submission.findById(submissionId).lean();
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found." });
    }

    const course = await Course.findById(submission.courseId).lean();
    if (!course || !course.teachers?.some((id) => id.toString() === req.user._id.toString())) {
      return res.status(403).json({ success: false, message: "You are not authorized to grade this submission." });
    }

    await Performance.create({
      studentId: submission.studentId,
      courseId: submission.courseId,
      assignmentId: submission.assignmentId,
      assignmentTitle: submission.assignmentTitle,
      score,
      focusAreas,
      gradedAt: new Date(),
    });

    await Submission.findByIdAndDelete(submissionId);

    res.json({ success: true, message: "Submission graded and removed.", submissionId });
  } catch (err) {
    console.error("Grade and purge error:", err);
    res.status(500).json({ success: false, message: "Unable to grade and purge the submission." });
  }
});

router.post("/add-assignment/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const title = sanitize(req.body.title);
    const description = sanitize(req.body.description);

    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Assignment title and description are required." });
    }

    const course = await Course.findOne({ _id: courseId, teachers: req.user._id });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found or access denied." });
    }

    course.assignments.push({ title, description });
    await course.save();

    res.json({ success: true, message: "Assignment added successfully.", assignments: course.assignments });
  } catch (err) {
    console.error("Add assignment error:", err);
    res.status(500).json({ success: false, message: "Unable to add assignment." });
  }
});

router.get("/enrollment-requests", async (req, res) => {
  try {
    const requests = await EnrollmentRequest.find({ teacherId: req.user._id, status: "pending" })
      .populate("studentId", "fullName email")
      .populate("courseId", "title code")
      .lean()
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (err) {
    console.error("Enrollment requests error:", err);
    res.status(500).json({ success: false, message: "Unable to fetch enrollment requests." });
  }
});

router.post("/handle-enrollment/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body; // "approve" or "reject"

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ success: false, message: "Invalid action." });
    }

    const request = await EnrollmentRequest.findOne({ _id: requestId, teacherId: req.user._id });
    if (!request) {
      return res.status(404).json({ success: false, message: "Enrollment request not found." });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ success: false, message: "Request already handled." });
    }

    if (action === "approve") {
      const student = await User.findOneAndUpdate(
        { _id: request.studentId, role: "STUDENT" },
        { $addToSet: { enrolledCourses: request.courseId } },
        { new: true }
      ).lean();

      if (!student) {
        return res.status(404).json({ success: false, message: "Student account not found." });
      }
    }

    request.status = action === "approve" ? "approved" : "rejected";
    await request.save();

    res.json({ success: true, message: `Enrollment request ${action}d.` });
  } catch (err) {
    console.error("Handle enrollment error:", err);
    res.status(500).json({ success: false, message: "Unable to handle enrollment request." });
  }
});

router.get("/course-results/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const course = await Course.findOne({ _id: courseId, teachers: req.user._id }).lean();
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found or access denied." });
    }

    const performances = await Performance.find({ courseId })
      .populate("studentId", "fullName email")
      .lean()
      .sort({ gradedAt: -1 });

    res.json({ success: true, course, results: performances });
  } catch (err) {
    console.error("Fetch course results error:", err);
    res.status(500).json({ success: false, message: "Unable to fetch course results." });
  }
});

router.get("/course-students/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;

    // Verify course belongs to teacher
    const course = await Course.findOne({ _id: courseId, teachers: req.user._id }).lean();
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found or access denied." });
    }

    // Find all students who have this course in their enrolledCourses
    const students = await User.find({ role: "STUDENT", enrolledCourses: courseId })
      .select("fullName email")
      .lean();

    // Fetch performance records for these students in this course
    const performances = await Performance.find({ courseId }).lean();

    const studentsData = students.map(student => {
      const studentPerformances = performances.filter(p => p.studentId.toString() === student._id.toString());
      return {
        ...student,
        performances: studentPerformances
      };
    });

    res.json({ success: true, students: studentsData });
  } catch (err) {
    console.error("Fetch course students error:", err);
    res.status(500).json({ success: false, message: "Unable to fetch students data." });
  }
});

module.exports = router;
