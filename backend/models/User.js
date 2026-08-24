const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: false,
      select: false,
    },
    passkey: {
      type: String,
      trim: true,
      index: true,
    },
    studentCode: {
      type: String,
      trim: true,
      uppercase: true,
      unique: true,
      sparse: true,
      index: true,
    },
    isActivated: {
      type: Boolean,
      default: false,
      index: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
      index: true,
    },
    studentClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      index: true,
    },
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        index: true,
      },
    ],
    assignedClasses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
        index: true,
      },
    ],
    linkedStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true,
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
