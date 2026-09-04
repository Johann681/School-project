const mongoose = require("mongoose");

const timetableSlotSchema = new mongoose.Schema(
  {
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true, index: true },
    academicSession: { type: String, required: true, trim: true, index: true },
    term: { type: String, enum: ["FIRST_TERM", "SECOND_TERM", "THIRD_TERM"], required: true, index: true },
    day: { type: String, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], required: true },
    period: { type: Number, required: true, min: 1, max: 8 },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
    room: { type: String, trim: true, default: "" },
    subjectAssignment: { type: mongoose.Schema.Types.ObjectId, ref: "SubjectAssignment", default: null },
  },
  { timestamps: true }
);

timetableSlotSchema.index({ class: 1, day: 1, period: 1 }, { unique: true });
module.exports = mongoose.model("TimetableSlot", timetableSlotSchema);
