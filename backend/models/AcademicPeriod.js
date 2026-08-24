const mongoose = require("mongoose");

const academicPeriodSchema = new mongoose.Schema(
  {
    key: { type: String, default: "current", unique: true, immutable: true },
    academicSession: { type: String, required: true, trim: true },
    term: { type: String, enum: ["FIRST_TERM", "SECOND_TERM", "THIRD_TERM"], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AcademicPeriod", academicPeriodSchema);
