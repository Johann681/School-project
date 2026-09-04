const mongoose = require("mongoose");

const studentResultSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    resultType: { type: String, enum: ["TEST", "EXAM", "TERMINAL_REPORT"], default: "EXAM", index: true },
    session: { type: String, trim: true },
    term: { type: String, enum: ["FIRST_TERM", "SECOND_TERM", "THIRD_TERM"], default: "FIRST_TERM" },
    reportText: { type: String, trim: true, default: "" },
    imageUrl: { type: String, trim: true, default: "" },
    publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    publishedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("StudentResult", studentResultSchema);
