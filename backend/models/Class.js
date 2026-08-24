const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    level: {
      type: String,
      trim: true,
      index: true,
    },
    section: {
      type: String,
      trim: true,
      uppercase: true,
      index: true,
    },
    academicSession: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    classTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
  },
  { timestamps: true }
);

classSchema.index({ name: 1, academicSession: 1 }, { unique: true });

module.exports = mongoose.model("Class", classSchema);
