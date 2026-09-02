const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    // Structured CBT/theory submission fields.
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      index: true,
    },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    objectiveAnswers: [
      {
        questionIndex: { type: Number, required: true, min: 0 },
        selectedOptionIndex: { type: Number, required: true, min: 0, max: 3 },
      },
    ],
    theoryAnswers: [
      {
        questionIndex: { type: Number, required: true, min: 0 },
        answerText: { type: String, default: "", trim: true },
      },
    ],
    objectiveScore: { type: Number, default: 0, min: 0 },
    theoryScore: { type: Number, default: 0, min: 0 },
    totalScore: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["SUBMITTED", "RELEASED", "GRADED"],
      default: "SUBMITTED",
    },
    // Legacy fields remain for existing text-only assignments and history.
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Course",
      index: true,
    },
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    assignmentTitle: {
      type: String,
      trim: true,
      index: true,
    },
    submissionData: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

submissionSchema.index(
  { studentId: 1, courseId: 1, assignmentId: 1 },
  { unique: true, sparse: true },
);
submissionSchema.index(
  { student: 1, assignment: 1 },
  { unique: true, sparse: true },
);

module.exports = mongoose.model("Submission", submissionSchema);
