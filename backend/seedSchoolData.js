require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Class = require("./models/Class");
const Subject = require("./models/Subject");
const SubjectAssignment = require("./models/SubjectAssignment");
const Course = require("./models/Course");
const Assignment = require("./models/Assignment");
const Submission = require("./models/Submission");
const Performance = require("./models/Performance");
const AcademicPeriod = require("./models/AcademicPeriod");

const SESSION = process.env.SEED_ACADEMIC_SESSION || "2026/2027";
const TERM = process.env.SEED_TERM || "FIRST_TERM";
const DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD || "SchoolDemo2026!";

const classNames = ["JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"];
const subjectGroups = {
  junior: [
    ["English Language", "ENG"],
    ["Mathematics", "MTH"],
    ["Basic Science", "BSC"],
    ["Basic Technology", "BTECH"],
    ["Social Studies", "SOC"],
    ["Civic Education", "CIV"],
    ["Computer Studies", "ICT"],
    ["Agricultural Science", "AGR"],
    ["Business Studies", "BUS"],
    ["Home Economics", "HEC"],
    ["Christian Religious Studies", "CRS"],
    ["French", "FRE"],
  ],
  senior: [
    ["English Language", "ENG"],
    ["Mathematics", "MTH"],
    ["Biology", "BIO"],
    ["Chemistry", "CHEM"],
    ["Physics", "PHY"],
    ["Economics", "ECO"],
    ["Government", "GOV"],
    ["Literature in English", "LIT"],
    ["Civic Education", "CIV"],
    ["Computer Studies", "ICT"],
    ["Agricultural Science", "AGR"],
    ["Christian Religious Studies", "CRS"],
  ],
};

const teacherNames = [
  "Amina Bello", "Chinedu Okafor", "Grace Adeyemi", "Ibrahim Musa",
  "Esther Eze", "Daniel Nwosu", "Mercy Williams", "Samuel Balogun",
  "Blessing Yusuf", "Tunde Adebayo", "Rosemary Obi", "David Usman",
];

const getOrCreate = async (Model, query, values) => {
  const existing = await Model.findOne(query);
  if (existing) return existing;
  return Model.create(values);
};

async function seedSchoolData() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required.");

  await mongoose.connect(process.env.MONGO_URI);
  const period = await AcademicPeriod.findOneAndUpdate(
    { key: "current" },
    { key: "current", academicSession: SESSION, term: TERM },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const teachers = [];
  for (const [index, fullName] of teacherNames.entries()) {
    teachers.push(await getOrCreate(
      User,
      { email: `teacher${index + 1}@demo.school.local` },
      { fullName, email: `teacher${index + 1}@demo.school.local`, password: DEMO_PASSWORD, role: "TEACHER", isActivated: true },
    ));
  }

  const classes = [];
  for (const name of classNames) {
    classes.push(await getOrCreate(
      Class,
      { name, academicSession: SESSION },
      { name, level: name, section: "A", academicSession: SESSION, classTeacher: teachers[classes.length % teachers.length]._id },
    ));
  }

  const subjectMap = new Map();
  for (const [name, code] of [...subjectGroups.junior, ...subjectGroups.senior]) {
    if (!subjectMap.has(code)) subjectMap.set(code, await getOrCreate(Subject, { code }, { name, code }));
  }

  let assignmentCount = 0;
  let courseCount = 0;
  let attemptCount = 0;
  for (const [classIndex, classRecord] of classes.entries()) {
    const subjects = classIndex < 3 ? subjectGroups.junior : subjectGroups.senior;
    for (const [subjectIndex, [subjectName, subjectCode]] of subjects.entries()) {
      const subject = subjectMap.get(subjectCode);
      const teacher = teachers[(classIndex + subjectIndex) % teachers.length];
      await SubjectAssignment.findOneAndUpdate(
        { subject: subject._id, class: classRecord._id },
        { subject: subject._id, class: classRecord._id, teacher: teacher._id, periodsPerWeek: subjectIndex < 2 ? 5 : 2 },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
      assignmentCount += 1;

      const course = await Course.findOneAndUpdate(
        { code: `${subjectCode}-${classRecord.name}-${SESSION.replace("/", "-")}` },
        { title: subjectName, targetClass: classRecord._id, teachers: [teacher._id], teacherId: teacher._id, materials: [] },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
      courseCount += 1;

      const assignmentTitle = `${subjectName} Week 1 Practice`;
      let assignment = await Assignment.findOne({ course: course._id, title: assignmentTitle });
      if (!assignment) {
        assignment = await Assignment.create({
          title: assignmentTitle,
          subject: subject._id,
          classRef: classRecord._id,
          course: course._id,
          teacher: teacher._id,
          totalMarks: 10,
          objectiveQuestions: [{ questionText: `Which statement best describes ${subjectName}?`, options: ["A core school topic", "A school club", "A break period", "A registration code"], correctOptionIndex: 0, marks: 5 }],
          theoryQuestions: [{ questionText: `Write one important point you learned in ${subjectName}.`, marks: 5 }],
        });
      }
      if (!course.assignments.some((item) => item.title === assignmentTitle)) {
        course.assignments.push({ title: assignmentTitle, description: `Practice activity for ${subjectName}.` });
        await course.save();
      }

      if (subjectIndex === 0) {
        const firstStudentNumber = classIndex * 2 + 1;
        const firstStudent = await getOrCreate(User, { email: `student${firstStudentNumber}@demo.school.local` }, { fullName: `Demo Student ${firstStudentNumber}`, email: `student${firstStudentNumber}@demo.school.local`, password: DEMO_PASSWORD, role: "STUDENT", studentCode: `DEMO-STU-${String(firstStudentNumber).padStart(3, "0")}`, studentClass: classRecord._id, enrolledCourses: [course._id], isActivated: true });
        const secondStudentNumber = firstStudentNumber + 1;
        const secondStudent = await getOrCreate(User, { email: `student${secondStudentNumber}@demo.school.local` }, { fullName: `Demo Student ${secondStudentNumber}`, email: `student${secondStudentNumber}@demo.school.local`, password: DEMO_PASSWORD, role: "STUDENT", studentCode: `DEMO-STU-${String(secondStudentNumber).padStart(3, "0")}`, studentClass: classRecord._id, enrolledCourses: [course._id], isActivated: true });
        await User.updateOne({ _id: firstStudent._id }, { $addToSet: { enrolledCourses: course._id } });
        await User.updateOne({ _id: secondStudent._id }, { $addToSet: { enrolledCourses: course._id } });

        const graded = await Submission.findOneAndUpdate(
          { studentId: firstStudent._id, courseId: course._id, assignmentId: assignment._id },
          { student: firstStudent._id, studentId: firstStudent._id, courseId: course._id, assignment: assignment._id, assignmentId: assignment._id, assignmentTitle, objectiveAnswers: [{ questionIndex: 0, selectedOptionIndex: 0 }], theoryAnswers: [{ questionIndex: 0, answerText: "It is an important part of the school curriculum." }], objectiveScore: 5, theoryScore: 4, totalScore: 9, status: "GRADED" },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        );
        await Performance.findOneAndUpdate(
          { studentId: firstStudent._id, courseId: course._id, assignmentId: assignment._id },
          { studentId: firstStudent._id, courseId: course._id, assignmentId: assignment._id, assignmentTitle, score: 9, focusAreas: "Keep explaining your answers with examples." },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        );
        await Submission.findOneAndUpdate(
          { studentId: secondStudent._id, courseId: course._id, assignmentId: assignment._id },
          { student: secondStudent._id, studentId: secondStudent._id, courseId: course._id, assignment: assignment._id, assignmentId: assignment._id, assignmentTitle, objectiveAnswers: [{ questionIndex: 0, selectedOptionIndex: 0 }], theoryAnswers: [{ questionIndex: 0, answerText: "My attempted response." }], objectiveScore: 5, theoryScore: 0, totalScore: 5, status: "SUBMITTED" },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        );
        attemptCount = graded ? 2 : attemptCount;
      }
    }
  }

  console.log(`School data ready for ${SESSION} ${period.term}.`);
  console.log(`${classes.length} classes, ${subjectMap.size} subjects, ${teachers.length} teachers, ${assignmentCount} subject assignments, ${courseCount} courses.`);
  console.log(`${attemptCount} demo attempts created or updated. Demo password: ${DEMO_PASSWORD}`);
}

seedSchoolData().then(() => mongoose.disconnect()).catch(async (error) => {
  console.error("School seed failed:", error.message || error);
  await mongoose.disconnect();
  process.exitCode = 1;
});
