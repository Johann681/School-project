require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("./models/Admin");

async function createLegacyAdmin() {
  try {
    const username = process.env.LEGACY_ADMIN_USERNAME?.trim();
    const password = process.env.LEGACY_ADMIN_PASSWORD;
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required.");
    if (!username || !password) {
      throw new Error("Set LEGACY_ADMIN_USERNAME and LEGACY_ADMIN_PASSWORD before creating the legacy admin.");
    }
    if (password.length < 12) throw new Error("LEGACY_ADMIN_PASSWORD must be at least 12 characters.");

    await mongoose.connect(process.env.MONGO_URI);
    const existing = await Admin.findOne({ username });
    if (existing) {
      console.log("Legacy admin already exists; no changes were made.");
      return;
    }

    await Admin.create({ username, password });
    console.log(`Legacy admin created for username: ${username}`);
  } catch (error) {
    console.error("Unable to create legacy admin:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

createLegacyAdmin();
