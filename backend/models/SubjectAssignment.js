const mongoose = require("mongoose");

const subjectAssignmentSchema = new mongoose.Schema(
  {
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true, index: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true, index: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    periodsPerWeek: { type: Number, required: true, min: 1, max: 40 },
  },
  { timestamps: true }
);

subjectAssignmentSchema.index({ subject: 1, class: 1 }, { unique: true });
module.exports = mongoose.model("SubjectAssignment", subjectAssignmentSchema);
