const express = require("express");
const xss = require("xss");
const router = express.Router();
const Course = require("../models/Course");
const Assignment = require("../models/Assignment");
const Subject = require("../models/Subject");
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

const normalizeDueDate = (value) => {
  if (!value) return undefined;
  const dueDate = new Date(value);
  if (Number.isNaN(dueDate.getTime())) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) dueDate.setHours(23, 59, 59, 999);
  return dueDate;
};

const isDeadlineWithinOneDay = (value) => {
  if (!value) return true;
  const deadline = normalizeDueDate(value);
  if (!deadline) return false;
  const tomorrow = new Date();
  tomorrow.setHours(23, 59, 59, 999);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return deadline <= tomorrow;
};

router.use(requireAuth, requireRole("TEACHER"));

router.get("/timetable", async (req, res) => {
  const slots = await TimetableSlot.find()
    .populate("class", "name level section")
    .populate({
      path: "subjectAssignment",
      match: { teacher: req.user._id },
      populate: [
        { path: "subject", select: "name code" },
        { path: "teacher", select: "fullName email" },
      ],
    })
    .lean();
  return res.json({
    success: true,
    timetable: slots.filter((slot) => slot.subjectAssignment),
  });
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
    return res
      .status(500)
      .json({
        success: false,
        message: "Unable to fetch your subject assignments.",
      });
  }
});

router.get("/courses", async (req, res) => {
  try {
    const assignments = await SubjectAssignment.find({ teacher: req.user._id })
      .populate("subject", "name code")
      .populate("class", "name")
      .lean();
    for (const assignment of assignments) {
      const existingCourse = await Course.findOne({
        targetClass: assignment.class._id,
        title: assignment.subject.name,
      });
      if (!existingCourse) {
        const code = `${assignment.subject.code}-${assignment.class.name}`
          .replace(/[^A-Z0-9-]/gi, "-")
          .toUpperCase();
        await Course.create({
          title: assignment.subject.name,
          code,
          targetClass: assignment.class._id,
          teachers: [req.user._id],
          materials: [],
          assignments: [],
        });
      } else if (
        !existingCourse.teachers.some(
          (id) => id.toString() === req.user._id.toString(),
        )
      ) {
        existingCourse.teachers = [req.user._id];
        await existingCourse.save();
      }
    }
    const courses = await Course.find({ teachers: req.user._id })
      .lean()
      .select("title code targetClass materials assignments")
      .populate("targetClass", "name level section academicSession")
      .sort({ createdAt: -1 });

    const structuredAssignments = await Assignment.find({
      teacher: req.user._id,
    })
      .lean()
      .select(
        "course title dueDate totalMarks objectiveQuestions theoryQuestions createdAt",
      )
      .sort({ createdAt: -1 });
    const assignmentsByCourse = structuredAssignments.reduce(
      (result, assignment) => {
        const key = assignment.course.toString();
        result[key] = result[key] || [];
        result[key].push(assignment);
        return result;
      },
      {},
    );

    res.json({
      success: true,
      courses: courses.map((course) => ({
        ...course,
        structuredAssignments: assignmentsByCourse[course._id.toString()] || [],
      })),
    });
  } catch (err) {
    console.error("Teacher courses error:", err);
    res
      .status(500)
      .json({ success: false, message: "Unable to fetch your courses." });
  }
});

router.post("/create-course", async (req, res) => {
  try {
    const title = sanitize(req.body.title);
    const code = sanitize(req.body.code).toUpperCase();

    if (!title || !code) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Course title and code are required.",
        });
    }

    const existing = await Course.findOne({ code }).lean();
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Course code already exists." });
    }

    const course = await Course.create({
      title,
      code,
      teachers: [req.user._id],
      materials: [],
      assignments: [],
      targetClass: req.body.targetClass || undefined,
    });
    res
      .status(201)
      .json({ success: true, message: "Course created successfully.", course });
  } catch (err) {
    console.error("Create course error:", err);
    res
      .status(500)
      .json({ success: false, message: "Unable to create course." });
  }
});

router.delete("/courses/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const course = await Course.findOne({
      _id: courseId,
      teachers: req.user._id,
    }).lean();

    if (!course) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Course not found or access denied.",
        });
    }

    await Promise.all([
      Submission.deleteMany({ courseId }),
      Performance.deleteMany({ courseId }),
      EnrollmentRequest.deleteMany({ courseId }),
      User.updateMany(
        { role: "STUDENT", enrolledCourses: courseId },
        { $pull: { enrolledCourses: courseId } },
      ),
      Course.findByIdAndDelete(courseId),
    ]);

    res.json({
      success: true,
      message: "Course and linked records deleted successfully.",
      courseId,
    });
  } catch (err) {
    console.error("Delete course error:", err);
    res
      .status(500)
      .json({ success: false, message: "Unable to delete course." });
  }
});

router.post("/drop-material/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const title = sanitize(req.body.title);
    const url = sanitize(req.body.url);

    if (!title || !url) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Material title and URL are required.",
        });
    }

    const course = await Course.findOne({
      _id: courseId,
      teachers: req.user._id,
    });
    if (!course) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Course not found or access denied.",
        });
    }

    course.materials.push({ title, url, addedBy: req.user._id });
    await course.save();

    res.json({
      success: true,
      message: "Material added successfully.",
      materials: course.materials,
    });
  } catch (err) {
    console.error("Drop material error:", err);
    res
      .status(500)
      .json({ success: false, message: "Unable to add material." });
  }
});

router.get("/submissions/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const course = await Course.findOne({
      _id: courseId,
      teachers: req.user._id,
    }).lean();
    if (!course) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Course not found or access denied.",
        });
    }

    const submissions = await Submission.find({ courseId })
      .populate("studentId", "fullName email")
      .lean()
      .select(
        "studentId courseId assignmentId assignmentTitle submissionData createdAt",
      )
      .sort({ createdAt: -1 });

    const structuredAssignments = await Assignment.find({
      course: courseId,
      teacher: req.user._id,
    })
      .select("title totalMarks objectiveQuestions theoryQuestions")
      .lean();
    const structuredIds = structuredAssignments.map(
      (assignment) => assignment._id,
    );
    const structuredSubmissions = await Submission.find({
      assignment: { $in: structuredIds },
    })
      .populate("student", "fullName email")
      .lean()
      .select(
        "assignment student assignmentTitle objectiveAnswers theoryAnswers objectiveScore theoryScore totalScore status createdAt",
      );
    res.json({
      success: true,
      course,
      submissions,
      structuredAssignments,
      structuredSubmissions,
    });
  } catch (err) {
    console.error("Fetch submissions error:", err);
    res
      .status(500)
      .json({ success: false, message: "Unable to retrieve submissions." });
  }
});

router.post("/grade-and-purge/:submissionId", async (req, res) => {
  try {
    const submissionId = req.params.submissionId;
    const score = Number(req.body.score);
    const focusAreas = sanitize(req.body.focusAreas);

    if (
      !submissionId ||
      Number.isNaN(score) ||
      score < 0 ||
      score > 100 ||
      !focusAreas
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Score and focus area feedback are required.",
        });
    }

    const submission = await Submission.findById(submissionId).lean();
    if (!submission) {
      return res
        .status(404)
        .json({ success: false, message: "Submission not found." });
    }

    const course = await Course.findById(submission.courseId).lean();
    if (
      !course ||
      !course.teachers?.some((id) => id.toString() === req.user._id.toString())
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You are not authorized to grade this submission.",
        });
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

    res.json({
      success: true,
      message: "Submission graded and removed.",
      submissionId,
    });
  } catch (err) {
    console.error("Grade and purge error:", err);
    res
      .status(500)
      .json({
        success: false,
        message: "Unable to grade and purge the submission.",
      });
  }
});

router.post("/add-assignment/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const title = sanitize(req.body.title);
    const description = sanitize(req.body.description);

    if (!title || !description) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Assignment title and description are required.",
        });
    }

    const course = await Course.findOne({
      _id: courseId,
      teachers: req.user._id,
    });
    if (!course) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Course not found or access denied.",
        });
    }

    course.assignments.push({ title, description });
    await course.save();

    res.json({
      success: true,
      message: "Assignment added successfully.",
      assignments: course.assignments,
    });
  } catch (err) {
    console.error("Add assignment error:", err);
    res
      .status(500)
      .json({ success: false, message: "Unable to add assignment." });
  }
});

router.post("/grade-structured-submission/:submissionId", async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.submissionId);
    if (!submission?.assignment)
      return res
        .status(404)
        .json({ success: false, message: "Structured submission not found." });
    const assignment = await Assignment.findOne({
      _id: submission.assignment,
      teacher: req.user._id,
    }).lean();
    if (!assignment)
      return res
        .status(403)
        .json({
          success: false,
          message: "You are not authorized to grade this submission.",
        });
    const theoryScore = Number(req.body.theoryScore);
    const maximumTheoryScore = assignment.theoryQuestions.reduce(
      (sum, question) => sum + question.marks,
      0,
    );
    if (
      !Number.isFinite(theoryScore) ||
      theoryScore < 0 ||
      theoryScore > maximumTheoryScore
    )
      return res
        .status(400)
        .json({
          success: false,
          message: `Theory score must be between 0 and ${maximumTheoryScore}.`,
        });
    submission.theoryScore = theoryScore;
    submission.totalScore = submission.objectiveScore + theoryScore;
    submission.status = "GRADED";
    await submission.save();
    const score = assignment.totalMarks ? Math.round((submission.totalScore / assignment.totalMarks) * 100) : submission.totalScore;
    await Performance.findOneAndUpdate(
      { studentId: submission.student, courseId: submission.courseId, assignmentId: submission.assignment },
      { studentId: submission.student, courseId: submission.courseId, assignmentId: submission.assignment, assignmentTitle: assignment.title, score, focusAreas: `Score: ${submission.totalScore}/${assignment.totalMarks || submission.totalScore}`, gradedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    res.json({ success: true, submission });
  } catch (err) {
    console.error("Grade structured submission error:", err);
    res
      .status(500)
      .json({ success: false, message: "Unable to grade submission." });
  }
});

router.post(
  "/release-structured-submission/:submissionId",
  async (req, res) => {
    try {
      const submission = await Submission.findById(req.params.submissionId);
      if (!submission?.assignment)
        return res
          .status(404)
          .json({
            success: false,
            message: "Structured submission not found.",
          });
      const assignment = await Assignment.findOne({
        _id: submission.assignment,
        teacher: req.user._id,
      }).lean();
      if (!assignment)
        return res
          .status(403)
          .json({
            success: false,
            message: "You are not authorized to release this score.",
          });
      submission.status = "RELEASED";
      await submission.save();
      const score = assignment.totalMarks ? Math.round((submission.totalScore / assignment.totalMarks) * 100) : submission.totalScore;
      await Performance.findOneAndUpdate(
        { studentId: submission.student, courseId: submission.courseId, assignmentId: submission.assignment },
        { studentId: submission.student, courseId: submission.courseId, assignmentId: submission.assignment, assignmentTitle: assignment.title, score, focusAreas: `Score: ${submission.totalScore}/${assignment.totalMarks || submission.totalScore}`, gradedAt: new Date() },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
      res.json({
        success: true,
        message: "Objective score released to the student.",
        submission,
      });
    } catch (err) {
      console.error("Release structured submission error:", err);
      res
        .status(500)
        .json({ success: false, message: "Unable to release score." });
    }
  },
);

router.post("/assignments/:courseId", async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.courseId,
      teachers: req.user._id,
    }).lean();
    if (!course)
      return res
        .status(404)
        .json({
          success: false,
          message: "Course not found or access denied.",
        });

    const title = sanitize(req.body.title);
    const objectiveQuestions = Array.isArray(req.body.objectiveQuestions)
      ? req.body.objectiveQuestions
      : [];
    const theoryQuestions = Array.isArray(req.body.theoryQuestions)
      ? req.body.theoryQuestions
      : [];
    if (!title || (!objectiveQuestions.length && !theoryQuestions.length)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Add a title and at least one objective or theory question.",
        });
    }
    if (!isDeadlineWithinOneDay(req.body.dueDate)) {
      return res.status(400).json({ success: false, message: "Assignment deadlines can only be set for today or tomorrow." });
    }

    const subject = await Subject.findOne({ name: course.title }).lean();
    const matchingSubject =
      subject && course.targetClass
        ? await SubjectAssignment.findOne({
            subject: subject._id,
            class: course.targetClass,
            teacher: req.user._id,
          }).lean()
        : null;
    if (!course.targetClass || !matchingSubject?.subject) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "This course must be linked to your assigned subject and class before an assignment can be created.",
        });
    }

    const normalizedObjectives = objectiveQuestions.map((question, index) => ({
      questionId: question.questionId || `${Date.now()}-objective-${index}`,
      questionText: sanitize(question.questionText),
      options: Array.isArray(question.options)
        ? question.options.map(sanitize)
        : [],
      correctOptionIndex: Number(question.correctOptionIndex),
      marks: Number(question.marks),
    }));
    const normalizedTheory = theoryQuestions.map((question, index) => ({
      questionId: question.questionId || `${Date.now()}-theory-${index}`,
      questionText: sanitize(question.questionText),
      marks: Number(question.marks),
    }));
    const validObjectives = normalizedObjectives.every(
      (q) =>
        q.questionText &&
        q.options.length === 4 &&
        q.options.every(Boolean) &&
        Number.isInteger(q.correctOptionIndex) &&
        q.correctOptionIndex >= 0 &&
        q.correctOptionIndex <= 3 &&
        Number.isFinite(q.marks) &&
        q.marks >= 0,
    );
    const validTheory = normalizedTheory.every(
      (q) => q.questionText && Number.isFinite(q.marks) && q.marks >= 0,
    );
    if (!validObjectives || !validTheory)
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Complete every question, option, correct answer, and marks field.",
        });

    const computedTotal = [...normalizedObjectives, ...normalizedTheory].reduce(
      (sum, question) => sum + question.marks,
      0,
    );
    const assignment = await Assignment.create({
      title,
      course: course._id,
      teacher: req.user._id,
      subject: matchingSubject.subject,
      classRef: course.targetClass,
      dueDate: normalizeDueDate(req.body.dueDate),
      totalMarks: computedTotal,
      objectiveQuestions: normalizedObjectives,
      theoryQuestions: normalizedTheory,
    });
    res
      .status(201)
      .json({
        success: true,
        message: "Structured assignment published.",
        assignment,
      });
  } catch (err) {
    console.error("Create structured assignment error:", err);
    res
      .status(500)
      .json({ success: false, message: "Unable to create assignment." });
  }
});

router.patch("/assignments/:assignmentId", async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) return res.status(404).json({ success: false, message: "Assignment not found or access denied." });
    const course = await Course.findOne({ _id: assignment.course, teachers: req.user._id }).lean();
    if (!course) return res.status(403).json({ success: false, message: "You are not assigned to this course." });

    const title = sanitize(req.body.title);
    const objectiveQuestions = Array.isArray(req.body.objectiveQuestions) ? req.body.objectiveQuestions : [];
    const theoryQuestions = Array.isArray(req.body.theoryQuestions) ? req.body.theoryQuestions : [];
    if (!title || (!objectiveQuestions.length && !theoryQuestions.length)) {
      return res.status(400).json({ success: false, message: "Add a title and at least one objective or theory question." });
    }

    const normalizedObjectives = objectiveQuestions.map((question, index) => ({
      questionId: question.questionId || `${Date.now()}-objective-${index}`,
      questionText: sanitize(question.questionText),
      options: Array.isArray(question.options) ? question.options.map(sanitize) : [],
      correctOptionIndex: Number(question.correctOptionIndex),
      marks: Number(question.marks),
    }));
    const normalizedTheory = theoryQuestions.map((question, index) => ({
      questionId: question.questionId || `${Date.now()}-theory-${index}`,
      questionText: sanitize(question.questionText),
      marks: Number(question.marks),
    }));
    const validObjectives = normalizedObjectives.every((question) => question.questionText && question.options.length === 4 && question.options.every(Boolean) && Number.isInteger(question.correctOptionIndex) && question.correctOptionIndex >= 0 && question.correctOptionIndex <= 3 && Number.isFinite(question.marks) && question.marks >= 0);
    const validTheory = normalizedTheory.every((question) => question.questionText && Number.isFinite(question.marks) && question.marks >= 0);
    if (!validObjectives || !validTheory) return res.status(400).json({ success: false, message: "Complete every question, option, correct answer, and marks field." });

    assignment.title = title;
    const dueDate = normalizeDueDate(req.body.dueDate);
    if (req.body.dueDate && !dueDate) return res.status(400).json({ success: false, message: "Due date must be a valid date." });
    if (!isDeadlineWithinOneDay(req.body.dueDate)) return res.status(400).json({ success: false, message: "Assignment deadlines can only be set for today or tomorrow." });
    assignment.dueDate = dueDate;
    assignment.totalMarks = [...normalizedObjectives, ...normalizedTheory].reduce((sum, question) => sum + question.marks, 0);
    assignment.objectiveQuestions = normalizedObjectives;
    assignment.theoryQuestions = normalizedTheory;
    await assignment.save();
    return res.json({ success: true, message: "Assignment updated successfully.", assignment });
  } catch (err) {
    console.error("Update structured assignment error:", err);
    return res.status(500).json({ success: false, message: "Unable to update assignment." });
  }
});

router.get("/enrollment-requests", async (req, res) => {
  try {
    const requests = await EnrollmentRequest.find({
      teacherId: req.user._id,
      status: "pending",
    })
      .populate("studentId", "fullName email")
      .populate("courseId", "title code")
      .lean()
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (err) {
    console.error("Enrollment requests error:", err);
    res
      .status(500)
      .json({
        success: false,
        message: "Unable to fetch enrollment requests.",
      });
  }
});

router.post("/handle-enrollment/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body; // "approve" or "reject"

    if (!["approve", "reject"].includes(action)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid action." });
    }

    const request = await EnrollmentRequest.findOne({
      _id: requestId,
      teacherId: req.user._id,
    });
    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Enrollment request not found." });
    }

    if (request.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, message: "Request already handled." });
    }

    if (action === "approve") {
      const student = await User.findOneAndUpdate(
        { _id: request.studentId, role: "STUDENT" },
        { $addToSet: { enrolledCourses: request.courseId } },
        { new: true },
      ).lean();

      if (!student) {
        return res
          .status(404)
          .json({ success: false, message: "Student account not found." });
      }
    }

    request.status = action === "approve" ? "approved" : "rejected";
    await request.save();

    res.json({ success: true, message: `Enrollment request ${action}d.` });
  } catch (err) {
    console.error("Handle enrollment error:", err);
    res
      .status(500)
      .json({
        success: false,
        message: "Unable to handle enrollment request.",
      });
  }
});

router.get("/course-results/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const course = await Course.findOne({
      _id: courseId,
      teachers: req.user._id,
    }).lean();
    if (!course) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Course not found or access denied.",
        });
    }

    const performances = await Performance.find({ courseId })
      .populate("studentId", "fullName email")
      .lean()
      .sort({ gradedAt: -1 });

    res.json({ success: true, course, results: performances });
  } catch (err) {
    console.error("Fetch course results error:", err);
    res
      .status(500)
      .json({ success: false, message: "Unable to fetch course results." });
  }
});

router.get("/course-students/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;

    // Verify course belongs to teacher
    const course = await Course.findOne({
      _id: courseId,
      teachers: req.user._id,
    }).lean();
    if (!course) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Course not found or access denied.",
        });
    }

    // Find all students who have this course in their enrolledCourses
    const students = await User.find({
      role: "STUDENT",
      enrolledCourses: courseId,
    })
      .select("fullName email")
      .lean();

    // Fetch performance records for these students in this course
    const performances = await Performance.find({ courseId }).lean();

    const studentsData = students.map((student) => {
      const studentPerformances = performances.filter(
        (p) => p.studentId.toString() === student._id.toString(),
      );
      return {
        ...student,
        performances: studentPerformances,
      };
    });

    res.json({ success: true, students: studentsData });
  } catch (err) {
    console.error("Fetch course students error:", err);
    res
      .status(500)
      .json({ success: false, message: "Unable to fetch students data." });
  }
});

module.exports = router;
