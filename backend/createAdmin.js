require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

async function createAdmin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || "System Administrator";

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is required to create an admin account.");
    }

    if (!adminEmail || !adminPassword) {
      throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set before running createAdmin.js.");
    }

    if (adminPassword.length < 8) {
      throw new Error("ADMIN_PASSWORD must be at least 8 characters long.");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() }).lean();
    if (existingAdmin) {
      console.log("Admin already exists.");
      process.exit(0);
    }

    const admin = new User({
      fullName: adminName,
      email: adminEmail.toLowerCase(),
      password: adminPassword,
      role: "ADMIN",
      isActivated: true,
    });

    await admin.save();
    console.log(`Admin created successfully for ${adminEmail}.`);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message || err);
    process.exit(1);
  }
}

createAdmin();
