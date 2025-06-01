require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const enrollRoutes = require("./routes/enroll");
const adminRoutes = require("./routes/admin"); // ✅ Add this line

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/enroll", enrollRoutes);
app.use("/api/admin", adminRoutes); // ✅ Add this line

// MongoDB & Server Start
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");

    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

startServer();  