const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
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
    submissionData: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

submissionSchema.index({ studentId: 1, courseId: 1, assignmentId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Submission", submissionSchema);
