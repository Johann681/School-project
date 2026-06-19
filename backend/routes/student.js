const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const Submission = require("../models/Submission");
const Performance = require("../models/Performance");
const EnrollmentRequest = require("../models/EnrollmentRequest");
const User = require("../models/User");
const { requireAuth, requireRole } = require("../middleware/auth");

router.use(requireAuth, requireRole("student"));

router.get("/dashboard", async (req, res) => {
  try {
    const studentId = req.user._id;
    const student = await User.findById(studentId)
      .lean()
      .select("enrolledCourses");
    const approvedRequests = await EnrollmentRequest.find({ studentId, status: "approved" })
      .lean()
      .select("courseId");
    const enrolledCourseIds = [
      ...new Set([
        ...(student?.enrolledCourses || []).map(id => id.toString()),
        ...approvedRequests.map((request) => request.courseId.toString()),
      ]),
    ];

    const performanceRecords = await Performance.find({ studentId })
      .lean()
      .select("courseId assignmentId assignmentTitle score focusAreas gradedAt")
      .sort({ gradedAt: -1 });

    const activeSubmissions = await Submission.find({ studentId })
      .lean()
      .select("courseId assignmentId assignmentTitle createdAt")
      .sort({ createdAt: -1 });

    const courses = await Course.find({ _id: { $in: enrolledCourseIds } })
      .lean()
      .select("title code materials assignments")
      .sort({ title: 1 });

    res.json({ success: true, courses, performanceRecords, activeSubmissions });
  } catch (err) {
    console.error("Student dashboard error:", err);
    res.status(500).json({
      success: false,
      message: "Unable to fetch student dashboard data.",
    });
  }
});

router.get("/available-courses", async (req, res) => {
  try {
    const student = await User.findById(req.user._id).lean();
    const approvedRequests = await EnrollmentRequest.find({ studentId: req.user._id, status: "approved" })
      .lean()
      .select("courseId");
    const enrolledCourseIds = [
      ...new Set([
        ...(student?.enrolledCourses || []).map(id => id.toString()),
        ...approvedRequests.map((request) => request.courseId.toString()),
      ]),
    ];

    // Find courses the student is NOT enrolled in
    const availableCourses = await Course.find({ _id: { $nin: enrolledCourseIds } })
      .lean()
      .select("title code teacherId")
      .populate("teacherId", "name")
      .sort({ title: 1 });

    // Find pending requests for this student so frontend can disable "Request" buttons
    const pendingRequests = await EnrollmentRequest.find({ studentId: req.user._id, status: "pending" }).lean();
    const pendingCourseIds = pendingRequests.map(pendingReq => pendingReq.courseId.toString());

    res.json({ success: true, availableCourses, pendingCourseIds });
  } catch (err) {
    console.error("Available courses error:", err);
    res.status(500).json({ success: false, message: "Unable to fetch available courses." });
  }
});

router.post("/request-enrollment/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;
    
    const course = await Course.findById(courseId).lean();
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    const student = await User.findById(req.user._id).lean();
    if (student.enrolledCourses && student.enrolledCourses.some(id => id.toString() === courseId)) {
      return res.status(400).json({ success: false, message: "You are already enrolled in this course." });
    }

    // Allow re-request after rejection; block only pending or approved
    const existingRequest = await EnrollmentRequest.findOne({
      studentId: req.user._id,
      courseId,
    });
    if (existingRequest) {
      if (existingRequest.status === "pending") {
        return res.status(400).json({ success: false, message: "Your enrollment request is already pending approval." });
      }
      if (existingRequest.status === "approved") {
        return res.status(400).json({ success: false, message: "You are already enrolled in this course." });
      }
      // Re-request after rejection — reset the existing record to pending
      existingRequest.status = "pending";
      existingRequest.teacherId = course.teacherId;
      await existingRequest.save();
      return res.json({ success: true, message: "Enrollment request re-submitted." });
    }

    await EnrollmentRequest.create({
      studentId: req.user._id,
      courseId,
      teacherId: course.teacherId,
      status: "pending"
    });

    res.json({ success: true, message: "Enrollment request sent." });
  } catch (err) {
    console.error("Request enrollment error:", err);
    res.status(500).json({ success: false, message: "Unable to send enrollment request." });
  }
});

router.post("/submit-assignment", async (req, res) => {
  try {
    const { courseId, assignmentId, assignmentTitle, submissionData } = req.body;

    if (!courseId || (!assignmentId && !assignmentTitle) || !submissionData) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    // Verify student is enrolled in the course
    const student = await User.findById(req.user._id).lean();
    const isEnrolled = student?.enrolledCourses?.some(id => id.toString() === courseId);
    const approvedRequest = await EnrollmentRequest.findOne({
      studentId: req.user._id,
      courseId,
      status: "approved",
    }).lean();

    if (!isEnrolled && !approvedRequest) {
      return res.status(403).json({ success: false, message: "You are not enrolled in this course." });
    }

    const course = await Course.findById(courseId).lean();
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    const assignment = assignmentId
      ? course.assignments?.find((item) => item._id.toString() === assignmentId)
      : course.assignments?.find((item) => item.title === assignmentTitle);

    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found for this course." });
    }

    const existingSubmission = await Submission.findOne({
      studentId: req.user._id,
      courseId,
      assignmentId: assignment._id,
    }).lean();

    if (existingSubmission) {
      return res.status(409).json({ success: false, message: "You have already submitted this assignment." });
    }

    const existingGrade = await Performance.findOne({
      studentId: req.user._id,
      courseId,
      assignmentId: assignment._id,
    }).lean();

    if (existingGrade) {
      return res.status(409).json({ success: false, message: "This assignment has already been graded." });
    }

    await Submission.create({
      studentId: req.user._id,
      courseId,
      assignmentId: assignment._id,
      assignmentTitle: assignment.title,
      submissionData
    });

    res.json({ success: true, message: "Assignment submitted successfully." });
  } catch (err) {
    console.error("Submit assignment error:", err);
    res.status(500).json({ success: false, message: "Unable to submit assignment." });
  }
});

module.exports = router;
