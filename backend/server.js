require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const enrollRoutes = require("./routes/enroll");
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS Middleware
app.use(
  cors({
    origin: ["https://www.greateraccessprivateschools.com", "http://localhost:5173"],
    credentials: true,
  })
);

// ✅ JSON Parsing Middleware
app.use(express.json());

// ✅ API Routes
app.use("/api/enroll", enrollRoutes);
app.use("/api/admin", adminRoutes);

// ✅ MongoDB Connection and Server Start
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");

    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

startServer();
