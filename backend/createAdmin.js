require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("./models/Admin");

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const admin = new Admin({
      username: "admin",
      password: "Gaps123",
    });

    await admin.save();
    console.log("✅ Admin created successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

createAdmin();