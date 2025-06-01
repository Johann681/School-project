require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("./models/Admin"); // adjust path if needed

const MONGO_URI = process.env.MONGO_URI;

async function createAdmin() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Change username and password here as you want
    const admin = new Admin({
      username: "admin",
      password: "Gaps123",
    });

    await admin.save();
    console.log("✅ Admin user created successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating admin user:", err);
    process.exit(1);
  }
}

createAdmin();
