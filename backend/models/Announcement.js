const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetAudience: {
      type: String,
      enum: ["ALL", "TEACHERS", "PARENTS", "STUDENTS"],
      default: "ALL",
      index: true,
    },
    targetClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", announcementSchema);
