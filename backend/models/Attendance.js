const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      index: true,
    },
    period: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    academicSession: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    term: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    records: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
          index: true,
        },
        status: {
          type: String,
          enum: ["PRESENT", "ABSENT", "LATE"],
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

attendanceSchema.index({ classId: 1, academicSession: 1, term: 1, period: 1 });

module.exports = mongoose.model("Attendance", attendanceSchema);
