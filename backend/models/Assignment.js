const mongoose = require("mongoose");

const objectiveQuestionSchema = new mongoose.Schema({
  questionId: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  questionText: { type: String, required: true, trim: true },
  options: {
    type: [{ type: String, required: true, trim: true }],
    validate: { validator: (options) => options.length === 4, message: "Objective questions need four options." },
  },
  correctOptionIndex: { type: Number, required: true, min: 0, max: 3 },
  marks: { type: Number, default: 1, min: 0 },
}, { _id: false });

const theoryQuestionSchema = new mongoose.Schema({
  questionId: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  questionText: { type: String, required: true, trim: true },
  marks: { type: Number, required: true, min: 0 },
}, { _id: false });

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true, index: true },
  classRef: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true, index: true },
  // Retains the existing course-based navigation while keeping Subject/Class as the source of truth.
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  dueDate: { type: Date },
  totalMarks: { type: Number, default: 0, min: 0 },
  objectiveQuestions: { type: [objectiveQuestionSchema], default: [] },
  theoryQuestions: { type: [theoryQuestionSchema], default: [] },
}, { timestamps: true });

assignmentSchema.index({ course: 1, createdAt: -1 });

module.exports = mongoose.model("Assignment", assignmentSchema);
