const mongoose = require("mongoose");

const performanceSchema = new mongoose.Schema(
  {
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
      required: true,
      trim: true,
      index: true,
    },
    score: {
      type: Number,
      required: true,
    },
    focusAreas: {
      type: String,
      required: true,
      trim: true,
    },
    gradedAt: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

performanceSchema.index({ studentId: 1, courseId: 1, assignmentId: 1 });

module.exports = mongoose.model("Performance", performanceSchema);
