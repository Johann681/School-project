const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true, unique: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subject", subjectSchema);
