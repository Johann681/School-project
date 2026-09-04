
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

// 1. Force the engine to look at your fresh backend .env configurations directly
require('dotenv').config({ 
  path: path.join(__dirname, '.env'),
  override: true 
});
const cors = require('cors');


const enrollRoutes = require("./routes/enroll");
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");
const teacherRoutes = require("./routes/teacher");
const studentRoutes = require("./routes/student");
const parentRoutes = require("./routes/parent");
const attendanceRoutes = require("./routes/attendance");
const settingsRoutes = require("./routes/settings");
const SubjectAssignment = require("./models/SubjectAssignment");
const TimetableSlot = require("./models/TimetableSlot");
const Class = require("./models/Class");

const app = express();
const PORT = process.env.PORT || 5000;

async function removeDuplicateSubjectAssignments() {
  const assignments = await SubjectAssignment.find().sort({ createdAt: 1, _id: 1 }).select("_id subject class").lean();
  const kept = new Set();
  const duplicateIds = [];
  for (const assignment of assignments) {
    const key = `${assignment.subject}-${assignment.class}`;
    if (kept.has(key)) duplicateIds.push(assignment._id);
    else kept.add(key);
  }
  if (duplicateIds.length) {
    await TimetableSlot.deleteMany({ subjectAssignment: { $in: duplicateIds } });
    await SubjectAssignment.deleteMany({ _id: { $in: duplicateIds } });
    console.log(`Removed ${duplicateIds.length} duplicate subject assignments before index sync.`);
  }
}

const requiredEnv = ["MONGO_URI", "JWT_SECRET"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  console.error(`Missing required environment variables: ${missingEnv.join(", ")}`);
  process.exit(1);
}

const allowedOrigins = [
  "https://www.greateraccessprivateschools.com",
  "https://greateraccessprivateschools.com",
  "https://school-project-i40q.onrender.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use("/api/enroll", enrollRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/parent", parentRoutes);
app.use("/api/attendance", attendanceRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "API endpoint not found." });
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ success: false, message: "Origin is not allowed." });
  }

  console.error("Unhandled server error:", err);
  return res.status(500).json({ success: false, message: "Unexpected server error." });
});

// ==========================================================
// CLEAN MODERNIZED ATLAS CONNECTION
// ==========================================================
async function startServer() {
  try {
    // 2. Safely read your brand-new Atlas connection string
    const dbURI = process.env.MONGO_URI;

    if (!dbURI) {
      console.error("❌ CRITICAL SETUP ERROR: process.env.MONGO_URI is missing or undefined.");
      process.exit(1);
    }

    console.log('🔄 Attempting a handshake with the new Atlas Cluster...');
    
    // 3. Connect cleanly without passing any old, deprecated options parameters
    await mongoose.connect(dbURI);
    await removeDuplicateSubjectAssignments();
    await SubjectAssignment.syncIndexes();
    await Class.syncIndexes();
    
    console.log('✅ MongoDB connected successfully to the new cloud cluster!');
    
    // 4. Secure the runtime port listener loop
    app.listen(PORT, () => {
      console.log(`🚀 Backend system service online and listening on port ${PORT}`);
    });

  } catch (error) {
    console.error('❌ MongoDB database connection failure:', error);
    process.exit(1);
  }
}

// Execute the server start script configuration
startServer();
