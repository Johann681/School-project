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
const AuditLog = require("../models/AuditLog");
const Class = require("../models/Class");
const Subject = require("../models/Subject");
const SubjectAssignment = require("../models/SubjectAssignment");
const TimetableSlot = require("../models/TimetableSlot");
const AcademicPeriod = require("../models/AcademicPeriod");
const StudentResult = require("../models/StudentResult");
const { PERIOD_SCHEDULE } = require("../config/timetableSchedule");
const { requireAuth, requireRole } = require("../middleware/auth");
const { auditLogger } = require("../middleware/auditLog");

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

const buildStudentCode = () => `BOLS-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

router.use(requireAuth, requireRole("ADMIN"));
router.use(async (req, res, next) => {
  await auditLogger(req, `${req.method}_${req.path.replace(/\//g, "_").replace(/^_/, "") || "ADMIN_ACTION"}`, req.body);
  next();
});

router.post("/courses/:courseId/register-student/:studentId", async (req, res) => {
  try {
    const [course, student] = await Promise.all([
      Course.findById(req.params.courseId).select("_id targetClass"),
      User.findOne({ _id: req.params.studentId, role: "STUDENT" }).select("_id studentClass enrolledCourses"),
    ]);
    if (!course || !student) return res.status(404).json({ success: false, message: "Course or student not found." });
    if (course.targetClass && student.studentClass && course.targetClass.toString() !== student.studentClass.toString()) {
      return res.status(400).json({ success: false, message: "Student and course belong to different classes." });
    }
    await User.updateOne({ _id: student._id }, { $addToSet: { enrolledCourses: course._id } });
    return res.json({ success: true, message: "Student registered to the course by the administrator." });
  } catch (err) {
    console.error("Register course student error:", err);
    return res.status(500).json({ success: false, message: "Unable to register student to the course." });
  }
});

router.get("/courses", async (req, res) => {
  const courses = await Course.find()
    .select("title code subject targetClass teachers")
    .populate("subject", "name code")
    .populate("targetClass", "name level section academicSession")
    .populate("teachers", "fullName email")
    .sort({ title: 1 })
    .lean();
  return res.json({ success: true, courses });
});

router.post("/results", async (req, res) => {
  try {
    const student = await User.findOne({ _id: req.body.studentId, role: "STUDENT" }).select("_id").lean();
    const title = sanitize(req.body.title);
    const reportText = sanitize(req.body.reportText);
    const imageUrl = sanitize(req.body.imageUrl);
    if (!student || !title || (!reportText && !imageUrl)) return res.status(400).json({ success: false, message: "Student, result title, and report text or image URL are required." });
    const result = await StudentResult.create({ student: student._id, title, resultType: req.body.resultType, session: sanitize(req.body.session), term: req.body.term, reportText, imageUrl, publishedBy: req.user._id });
    return res.status(201).json({ success: true, result });
  } catch (err) {
    console.error("Publish student result error:", err);
    return res.status(500).json({ success: false, message: "Unable to publish student result." });
  }
});

router.post("/classes", async (req, res) => {
  try {
    const level = sanitize(req.body.level);
    const section = sanitize(req.body.section).toUpperCase();
    const name = sanitize(req.body.name || `${level}${section}`);
    if (!level || !section) {
      return res.status(400).json({ success: false, message: "Level and section are required." });
    }
    const classRecord = await Class.create({ name, level, section, classTeacher: req.body.classTeacher || undefined });
    return res.status(201).json({ success: true, class: classRecord });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ success: false, message: "That class already exists." });
    console.error("Create Class Error:", err);
    return res.status(500).json({ success: false, message: "Unable to create class." });
  }
});

router.get("/classes", async (req, res) => {
  const classes = await Class.find().sort({ level: 1, section: 1, academicSession: -1 }).lean();
  return res.json({ success: true, classes });
});

router.patch("/classes/:id", async (req, res) => {
  const updates = {};
  for (const field of ["name", "level", "section", "academicSession", "classTeacher"]) {
    if (req.body[field] !== undefined) updates[field] = field === "section" ? sanitize(req.body[field]).toUpperCase() : sanitize(req.body[field]);
  }
  const classRecord = await Class.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).lean();
  if (!classRecord) return res.status(404).json({ success: false, message: "Class not found." });
  return res.json({ success: true, class: classRecord });
});

router.delete("/classes/:id", async (req, res) => {
  const classRecord = await Class.findById(req.params.id);
  if (!classRecord) return res.status(404).json({ success: false, message: "Class not found." });
  const courses = await Course.find({ targetClass: req.params.id }).select("_id").lean();
  const courseIds = courses.map((course) => course._id);
  await Promise.all([
    Class.deleteOne({ _id: req.params.id }),
    SubjectAssignment.deleteMany({ class: req.params.id }),
    TimetableSlot.deleteMany({ class: req.params.id }),
    User.updateMany({ studentClass: req.params.id }, { $unset: { studentClass: "" } }),
    User.updateMany({ assignedClasses: req.params.id }, { $pull: { assignedClasses: req.params.id } }),
    Submission.deleteMany({ courseId: { $in: courseIds } }),
    Performance.deleteMany({ courseId: { $in: courseIds } }),
    EnrollmentRequest.deleteMany({ courseId: { $in: courseIds } }),
    User.updateMany({ enrolledCourses: { $in: courseIds } }, { $pull: { enrolledCourses: { $in: courseIds } } }),
    Course.deleteMany({ _id: { $in: courseIds } }),
  ]);
  return res.json({ success: true });
});

router.post("/subjects", async (req, res) => {
  try {
    const name = sanitize(req.body.name);
    const code = sanitize(req.body.code).toUpperCase();
    if (!name || !code) return res.status(400).json({ success: false, message: "Subject name and code are required." });
    return res.status(201).json({ success: true, subject: await Subject.create({ name, code }) });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ success: false, message: "That subject code already exists." });
    return res.status(500).json({ success: false, message: "Unable to create subject." });
  }
});

router.get("/subjects", async (req, res) => {
  const subjects = await Subject.find().sort({ name: 1 }).lean();
  return res.json({ success: true, subjects });
});

router.patch("/subjects/:id", async (req, res) => {
  const updates = {};
  if (req.body.name !== undefined) updates.name = sanitize(req.body.name);
  if (req.body.code !== undefined) updates.code = sanitize(req.body.code).toUpperCase();
  const subject = await Subject.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).lean();
  if (!subject) return res.status(404).json({ success: false, message: "Subject not found." });
  return res.json({ success: true, subject });
});

router.delete("/subjects/:id", async (req, res) => {
  const subject = await Subject.findById(req.params.id);
  if (!subject) return res.status(404).json({ success: false, message: "Subject not found." });
  const assignmentIds = await SubjectAssignment.find({ subject: req.params.id }).distinct("_id");
  const courses = await Course.find({ $or: [{ subject: req.params.id }, { title: subject.name }] }).select("_id").lean();
  const courseIds = courses.map((course) => course._id);
  await Promise.all([
    Subject.deleteOne({ _id: req.params.id }),
    SubjectAssignment.deleteMany({ subject: req.params.id }),
    TimetableSlot.deleteMany({ subjectAssignment: { $in: assignmentIds } }),
    Submission.deleteMany({ courseId: { $in: courseIds } }),
    Performance.deleteMany({ courseId: { $in: courseIds } }),
    EnrollmentRequest.deleteMany({ courseId: { $in: courseIds } }),
    User.updateMany({ enrolledCourses: { $in: courseIds } }, { $pull: { enrolledCourses: { $in: courseIds } } }),
    Course.deleteMany({ _id: { $in: courseIds } }),
  ]);
  return res.json({ success: true });
});

router.post("/subject-assignments", async (req, res) => {
  try {
    const periodsPerWeek = Number(req.body.periodsPerWeek);
    const teacherIds = Array.isArray(req.body.teachers) ? req.body.teachers : [req.body.teacher];
    if (!req.body.subject || !req.body.class || teacherIds.length !== 1 || !Number.isInteger(periodsPerWeek) || periodsPerWeek < 1 || periodsPerWeek > 40) {
      return res.status(400).json({ success: false, message: "Subject, class, teacher, and periods per week are required." });
    }
    const [subject, classRecord, teachers] = await Promise.all([
      Subject.findById(req.body.subject),
      Class.findById(req.body.class),
      User.find({ _id: { $in: teacherIds }, role: "TEACHER" }),
    ]);
    if (!subject || !classRecord || teachers.length !== new Set(teacherIds.map(String)).size) return res.status(404).json({ success: false, message: "Subject, class, or teacher not found." });
    const existingSameClass = await SubjectAssignment.findOne({ subject: subject._id, class: classRecord._id }).populate("teacher", "fullName").lean();
    if (existingSameClass) {
      return res.status(409).json({ success: false, message: `${subject.name} is already assigned to ${classRecord.name} with ${existingSameClass.teacher?.fullName || "a teacher"}. A course can only be assigned once per class.` });
    }
    const assignments = await SubjectAssignment.create(teachers.map((teacher) => ({ subject: subject._id, class: classRecord._id, teacher: teacher._id, periodsPerWeek })));
    const courseCode = `${subject.code}-${classRecord.name}`.replace(/[^A-Z0-9-]/gi, "-").toUpperCase();
    const existingCourse = await Course.findOne({ targetClass: classRecord._id, title: subject.name });
    if (existingCourse) {
      existingCourse.teachers = [...new Set([...existingCourse.teachers.map(String), ...teachers.map((teacher) => teacher._id.toString())])];
      existingCourse.subject = subject._id;
      await existingCourse.save();
    } else {
      await Course.create({ title: subject.name, code: courseCode, subject: subject._id, targetClass: classRecord._id, teachers: teachers.map((teacher) => teacher._id), materials: [], assignments: [] });
    }
    return res.status(201).json({ success: true, assignments });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ success: false, message: "That subject is already assigned to this class." });
    return res.status(500).json({ success: false, message: "Unable to create subject assignment." });
  }
});

router.post("/timetable/generate", async (req, res) => {
  try {
    const academicPeriod = await AcademicPeriod.findOne({ key: "current" }).lean();
    if (!academicPeriod) return res.status(400).json({ success: false, message: "Set the current academic term before generating a timetable." });
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const assignments = await SubjectAssignment.find().populate("subject", "name code").populate("teacher", "fullName").lean();
    const classIds = [...new Set(assignments.map((assignment) => assignment.class.toString()))];
    const slots = [];
    const conflicts = [];
    const teacherBusy = new Set();

    for (const classId of classIds) {
      const classAssignments = assignments.filter((assignment) => assignment.class.toString() === classId);
      const classBusy = new Set();
      for (const assignment of classAssignments) {
        let placed = 0;
        for (let dayIndex = 0; dayIndex < days.length && placed < assignment.periodsPerWeek; dayIndex += 1) {
          for (let period = 1; period <= 8 && placed < assignment.periodsPerWeek; period += 1) {
            const classKey = `${days[dayIndex]}-${period}`;
            const teacherKey = `${assignment.teacher._id}-${classKey}`;
            if (classBusy.has(classKey) || teacherBusy.has(teacherKey)) continue;
            classBusy.add(classKey);
            teacherBusy.add(teacherKey);
            const periodInfo = PERIOD_SCHEDULE[period - 1];
            slots.push({ class: classId, academicSession: academicPeriod.academicSession, term: academicPeriod.term, day: days[dayIndex], period, startTime: periodInfo.startTime, endTime: periodInfo.endTime, subjectAssignment: assignment._id });
            placed += 1;
          }
        }
        if (placed < assignment.periodsPerWeek) conflicts.push({ assignment: assignment._id, subject: assignment.subject.name, teacher: assignment.teacher.fullName, requested: assignment.periodsPerWeek, placed });
      }
      for (const day of days) for (let period = 1; period <= 8; period += 1) {
        if (!classBusy.has(`${day}-${period}`)) { const periodInfo = PERIOD_SCHEDULE[period - 1]; slots.push({ class: classId, academicSession: academicPeriod.academicSession, term: academicPeriod.term, day, period, startTime: periodInfo.startTime, endTime: periodInfo.endTime, subjectAssignment: null }); }
      }
    }

    await TimetableSlot.deleteMany({});
    if (slots.length) await TimetableSlot.insertMany(slots);
    return res.json({ success: true, generated: slots.length, conflicts });
  } catch (err) {
    console.error("Generate Timetable Error:", err);
    return res.status(500).json({ success: false, message: "Unable to generate timetable." });
  }
});

router.delete("/subject-assignments/:id", async (req, res) => {
  const assignment = await SubjectAssignment.findByIdAndDelete(req.params.id);
  if (!assignment) return res.status(404).json({ success: false, message: "Subject assignment not found." });
  await TimetableSlot.deleteMany({ subjectAssignment: assignment._id });
  const remaining = await SubjectAssignment.find({ subject: assignment.subject, class: assignment.class }).distinct("teacher");
  await Course.updateOne({ subject: assignment.subject, targetClass: assignment.class }, { $pull: { teachers: assignment.teacher } });
  if (!remaining.length) await Course.deleteOne({ subject: assignment.subject, targetClass: assignment.class });
  return res.json({ success: true });
});

router.get("/timetable", async (req, res) => {
  const slots = await TimetableSlot.find().populate("class", "name level section").populate({ path: "subjectAssignment", populate: [{ path: "subject", select: "name code" }, { path: "teacher", select: "fullName email" }] }).sort({ class: 1, day: 1, period: 1 }).lean();
  return res.json({ success: true, slots });
});

router.post("/create-student-passkey", async (req, res) => {
  try {
    const fullName = sanitize(req.body.fullName || req.body.name);
    const email = sanitize(req.body.email).toLowerCase();

    if (!fullName || !email) {
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
    const studentCode = buildStudentCode();
    const newStudent = new User({
      fullName,
      email,
      role: "STUDENT",
      passkey,
      studentCode,
      studentClass: req.body.classRef || undefined,
      isActivated: false,
    });

    await newStudent.save();

    return res.status(201).json({
      success: true,
      message: "Student shell account created.",
      passkey,
      studentCode,
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

router.post("/create-student", async (req, res) => {
  try {
    const fullName = sanitize(req.body.fullName || req.body.name);
    const email = sanitize(req.body.email).toLowerCase();
    const password = sanitize(req.body.password);

    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: "Student name, email, and password are required." });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters and include uppercase, lowercase, and a number." });
    }
    if (await User.exists({ email })) {
      return res.status(409).json({ success: false, message: "A user with that email already exists." });
    }

    const student = await User.create({
      fullName,
      email,
      password,
      role: "STUDENT",
      studentCode: buildStudentCode(),
      studentClass: req.body.classRef || undefined,
      isActivated: true,
    });

    return res.status(201).json({ success: true, message: "Student account created successfully.", email, studentCode: student.studentCode });
  } catch (err) {
    console.error("Create Student Error:", err);
    return res.status(500).json({ success: false, message: "Unable to create student account at this time." });
  }
});

router.post("/students/:studentId/regenerate-code", async (req, res) => {
  try {
    const student = await User.findOne({ _id: req.params.studentId, role: "STUDENT" });
    if (!student) return res.status(404).json({ success: false, message: "Student account not found." });
    student.studentCode = buildStudentCode();
    await student.save();
    return res.json({ success: true, studentCode: student.studentCode });
  } catch (err) {
    console.error("Regenerate Student Code Error:", err);
    return res.status(500).json({ success: false, message: "Unable to regenerate student code." });
  }
});

router.post("/create-teacher", async (req, res) => {
  try {
    const fullName = sanitize(req.body.fullName || req.body.name);
    const email = sanitize(req.body.email).toLowerCase();
    const password = sanitize(req.body.password);

    if (!fullName || !email || !password) {
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
      fullName,
      email,
      password,
      role: "TEACHER",
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
    const accountStudents = await User.find({ role: "STUDENT" })
      .select("fullName email isActivated studentCode studentClass enrolledCourses createdAt")
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ success: true, accountStudents });
  } catch (err) {
    console.error("Fetch account students error:", err);
    return res.status(500).json({ success: false, message: "Unable to retrieve LMS student accounts." });
  }
});

router.patch("/account-students/:id", async (req, res) => {
  const updates = {};
  if (req.body.fullName !== undefined) updates.fullName = sanitize(req.body.fullName);
  if (req.body.email !== undefined) updates.email = sanitize(req.body.email).toLowerCase();
  if (req.body.classRef !== undefined) updates.studentClass = req.body.classRef || undefined;
  const student = await User.findOneAndUpdate({ _id: req.params.id, role: "STUDENT" }, updates, { new: true, runValidators: true })
    .populate("studentClass", "name level section academicSession");
  if (!student) return res.status(404).json({ success: false, message: "LMS student account not found." });
  return res.json({ success: true, student });
});

router.delete("/account-students/:id", async (req, res) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: "STUDENT" }).lean();
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
    const teachers = await User.find({ role: "TEACHER" })
      .select("fullName email createdAt")
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ success: true, teachers });
  } catch (err) {
    console.error("Fetch teachers error:", err);
    return res.status(500).json({ success: false, message: "Unable to retrieve teacher roster." });
  }
});

router.patch("/teachers/:id", async (req, res) => {
  const updates = {};
  if (req.body.fullName !== undefined) updates.fullName = sanitize(req.body.fullName);
  if (req.body.email !== undefined) updates.email = sanitize(req.body.email).toLowerCase();
  const teacher = await User.findOneAndUpdate({ _id: req.params.id, role: "TEACHER" }, updates, { new: true, runValidators: true }).select("fullName email createdAt");
  if (!teacher) return res.status(404).json({ success: false, message: "Teacher account not found." });
  return res.json({ success: true, teacher });
});

router.delete("/teachers/:id", async (req, res) => {
  try {
    const teacherId = req.params.id;
    const teacher = await User.findOne({ _id: teacherId, role: "TEACHER" }).lean();
    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher account not found." });
    }

    const courses = await Course.find({ $or: [{ teacherId }, { teachers: teacherId }] }).lean();
    const courseIds = courses.map((course) => course._id);

    await Submission.deleteMany({ courseId: { $in: courseIds } });
    await Performance.deleteMany({ courseId: { $in: courseIds } });
    await EnrollmentRequest.deleteMany({ courseId: { $in: courseIds } });
    await Course.updateMany({ teachers: teacherId }, { $pull: { teachers: teacherId } });
    await Course.updateMany({ teacherId }, { $unset: { teacherId: "" } });
    await Course.deleteMany({ teacherId, teachers: { $size: 0 } });
    const assignments = await SubjectAssignment.find({ teacher: teacherId }).select("_id subject class").lean();
    await SubjectAssignment.deleteMany({ teacher: teacherId });
    await TimetableSlot.deleteMany({ subjectAssignment: { $in: assignments.map((assignment) => assignment._id) } });
    await User.findByIdAndDelete(teacherId);

    return res.json({ success: true, message: "Teacher account and linked course data removed." });
  } catch (err) {
    console.error("Delete teacher error:", err);
    return res.status(500).json({ success: false, message: "Unable to delete teacher account." });
  }
});

router.get("/audit-logs", async (req, res) => {
  try {
    const { role, userID, action } = req.query;
    const filter = {};

    if (role) {
      filter.role = role.toString().toUpperCase();
    }

    if (userID) {
      filter.actorId = userID;
    }

    if (action) {
      filter.action = { $regex: action.toString().trim(), $options: "i" };
    }

    const logs = await AuditLog.find(filter)
      .populate("actorId", "fullName email role")
      .sort({ timestamp: -1 })
      .limit(250)
      .lean();
    return res.json({ success: true, logs });
  } catch (err) {
    console.error("Fetch audit logs error:", err);
    return res.status(500).json({ success: false, message: "Unable to retrieve audit logs." });
  }
});

module.exports = router;
