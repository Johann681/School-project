const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const Assignment = require("../models/Assignment");
const TimetableSlot = require("../models/TimetableSlot");
const Submission = require("../models/Submission");
const Performance = require("../models/Performance");
const EnrollmentRequest = require("../models/EnrollmentRequest");
const User = require("../models/User");
const { requireAuth, requireRole } = require("../middleware/auth");

const hasDeadlinePassed = (dueDate) => {
  const deadline = new Date(dueDate);
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(dueDate))) deadline.setHours(23, 59, 59, 999);
  return new Date() > deadline;
};

router.use(requireAuth, requireRole("STUDENT"));

router.use((req, res, next) => {
  if (req.path === "/available-courses" || req.path.startsWith("/request-enrollment/")) {
    return res.status(403).json({ success: false, message: "Course registration is managed by the administrator." });
  }
  next();
});

router.get("/dashboard", async (req, res) => {
  try {
    const studentId = req.user._id;
    const student = await User.findById(studentId)
      .lean()
      .select("enrolledCourses studentClass");
    const approvedRequests = await EnrollmentRequest.find({ studentId, status: "approved" })
      .lean()
      .select("courseId");
    const directlyEnrolledCourseIds = [
      ...new Set([
        ...(student?.enrolledCourses || []).map(id => id.toString()),
        ...approvedRequests.map((request) => request.courseId.toString()),
      ]),
    ];
    const classCourses = student?.studentClass
      ? await Course.find({ targetClass: student.studentClass }).select("_id").lean()
      : [];
    const enrolledCourseIds = [...new Set([
      ...directlyEnrolledCourseIds,
      ...classCourses.map((course) => course._id.toString()),
    ])];

    const performanceRecords = await Performance.find({ studentId })
      .lean()
      .select("courseId assignmentId assignmentTitle score focusAreas gradedAt")
      .sort({ gradedAt: -1 });

    const activeSubmissions = await Submission.find({ $or: [{ studentId }, { student: studentId }] })
      .lean()
      .select("courseId assignmentId assignmentTitle assignment status objectiveScore theoryScore totalScore createdAt")
      .sort({ createdAt: -1 });

    const courses = await Course.find({ _id: { $in: enrolledCourseIds } })
      .lean()
      .select("title code targetClass materials assignments")
      .populate("targetClass", "name level section academicSession")
      .sort({ title: 1 });

    const structuredAssignments = await Assignment.find({ course: { $in: enrolledCourseIds } })
      .lean()
      .select("course title dueDate totalMarks objectiveQuestions.questionId objectiveQuestions.questionText objectiveQuestions.options objectiveQuestions.marks theoryQuestions createdAt")
      .sort({ createdAt: -1 });
    const assignmentsByCourse = structuredAssignments.reduce((result, assignment) => {
      const key = assignment.course.toString();
      result[key] = result[key] || [];
      result[key].push(assignment);
      return result;
    }, {});

    res.json({ success: true, courses: courses.map((course) => ({ ...course, structuredAssignments: assignmentsByCourse[course._id.toString()] || [] })), performanceRecords, activeSubmissions });
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
      .select("title code teacherId teachers")
      .populate("teacherId", "fullName email")
      .populate("teachers", "fullName email")
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
      existingRequest.teacherId = course.teachers?.[0] || course.teacherId;
      await existingRequest.save();
      return res.json({ success: true, message: "Enrollment request re-submitted." });
    }

    await EnrollmentRequest.create({
      studentId: req.user._id,
      courseId,
      teacherId: course.teachers?.[0] || course.teacherId,
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
    const { courseId, assignmentId, assignmentTitle, submissionData, objectiveAnswers, theoryAnswers } = req.body;

    if (!courseId || (!assignmentId && !assignmentTitle)) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    // Verify student is enrolled in the course
    const student = await User.findById(req.user._id).lean();
    const course = await Course.findById(courseId).lean();
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }
    const isEnrolled = student?.enrolledCourses?.some(id => id.toString() === courseId);
    const approvedRequest = await EnrollmentRequest.findOne({
      studentId: req.user._id,
      courseId,
      status: "approved",
    }).lean();

    const isClassCourse = student?.studentClass && course.targetClass?.toString() === student.studentClass.toString();
    if (!isEnrolled && !approvedRequest && !isClassCourse) {
      return res.status(403).json({ success: false, message: "You are not enrolled in this course." });
    }

    const structuredAssignment = assignmentId ? await Assignment.findOne({ _id: assignmentId, course: courseId }).lean() : null;
    if (structuredAssignment) {
      if (structuredAssignment.dueDate && hasDeadlinePassed(structuredAssignment.dueDate)) {
        return res.status(400).json({ success: false, message: "This assignment is closed because its due date has passed." });
      }
      const normalizedObjectiveAnswers = Array.isArray(objectiveAnswers) ? Object.values(objectiveAnswers.reduce((result, answer) => { const item = { questionIndex: Number(answer.questionIndex), selectedOptionIndex: Number(answer.selectedOptionIndex) }; result[item.questionIndex] = item; return result; }, {})) : [];
      const normalizedTheoryAnswers = Array.isArray(theoryAnswers) ? Object.values(theoryAnswers.reduce((result, answer) => { const item = { questionIndex: Number(answer.questionIndex), answerText: typeof answer.answerText === "string" ? answer.answerText.trim() : "" }; result[item.questionIndex] = item; return result; }, {})) : [];
      const invalidObjective = normalizedObjectiveAnswers.some((answer) => !Number.isInteger(answer.questionIndex) || answer.questionIndex < 0 || answer.questionIndex >= structuredAssignment.objectiveQuestions.length || !Number.isInteger(answer.selectedOptionIndex) || answer.selectedOptionIndex < 0 || answer.selectedOptionIndex > 3);
      const invalidTheory = normalizedTheoryAnswers.some((answer) => !Number.isInteger(answer.questionIndex) || answer.questionIndex < 0 || answer.questionIndex >= structuredAssignment.theoryQuestions.length);
      if (invalidObjective || invalidTheory) return res.status(400).json({ success: false, message: "One or more answers are invalid." });

      const objectiveScore = normalizedObjectiveAnswers.reduce((score, answer) => {
        const question = structuredAssignment.objectiveQuestions[answer.questionIndex];
        return score + (question.correctOptionIndex === answer.selectedOptionIndex ? question.marks : 0);
      }, 0);
      const existing = await Submission.findOne({ student: req.user._id, assignment: structuredAssignment._id }).lean();
      if (existing) return res.status(409).json({ success: false, message: "You have already submitted this assignment." });
      await Submission.create({
        // Keep legacy identifiers populated as they are required by the shared
        // submission schema and are used by existing reporting screens.
        studentId: req.user._id,
        courseId,
        assignmentId: structuredAssignment._id,
        assignmentTitle: structuredAssignment.title,
        assignment: structuredAssignment._id,
        student: req.user._id,
        objectiveAnswers: normalizedObjectiveAnswers,
        theoryAnswers: normalizedTheoryAnswers,
        objectiveScore,
        theoryScore: 0,
        totalScore: objectiveScore,
        status: "SUBMITTED",
      });
      return res.json({ success: true, message: "Assignment submitted. Objective questions were scored automatically.", objectiveScore });
    }

    if (!submissionData) return res.status(400).json({ success: false, message: "Your submission is required." });

    const assignment = assignmentId
      ? course.assignments?.find((item) => item._id.toString() === assignmentId)
      : course.assignments?.find((item) => item.title === assignmentTitle);

    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found for this course." });
    }

    if (assignment.dueDate && hasDeadlinePassed(assignment.dueDate)) {
      return res.status(400).json({ success: false, message: "This assignment is closed because its due date has passed." });
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

router.get("/timetable", async (req, res) => {
  try {
    const student = await User.findById(req.user._id)
      .select("enrolledCourses studentClass")
      .lean();

    const slots = await TimetableSlot.find({ class: student?.studentClass })
      .populate({ path: "class", select: "name level section" })
      .populate({ path: "subjectAssignment", populate: [{ path: "subject", select: "name code" }, { path: "teacher", select: "fullName email" }] })
      .sort({ day: 1, period: 1 })
      .lean();
    const timetable = slots.map((slot) => ({
      subject: slot.subjectAssignment?.subject?.name || "Free Period",
      className: slot.class?.name || "Assigned class",
      teacherName: slot.subjectAssignment?.teacher?.fullName || "",
      day: slot.day,
      period: `Period ${slot.period}`,
      startTime: slot.startTime,
      endTime: slot.endTime,
      room: slot.room || "Room TBD",
    }));

    return res.json({ success: true, timetable });
  } catch (err) {
    console.error("Student timetable error:", err);
    return res.status(500).json({ success: false, message: "Unable to load timetable." });
  }
});

module.exports = router;
