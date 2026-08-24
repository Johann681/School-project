const express = require("express");
const xss = require("xss");
const AcademicPeriod = require("../models/AcademicPeriod");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
const terms = ["FIRST_TERM", "SECOND_TERM", "THIRD_TERM"];
const clean = (value) => typeof value === "string" ? xss(value.trim()) : "";

router.get("/academic-period", async (req, res) => {
  try {
    const period = await AcademicPeriod.findOne({ key: "current" }).lean();
    return res.json({ success: true, period });
  } catch (error) {
    console.error("Get academic period error:", error);
    return res.status(500).json({ success: false, message: "Unable to load the current academic term." });
  }
});

router.put("/academic-period", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const academicSession = clean(req.body.academicSession);
    const term = clean(req.body.term).toUpperCase();
    if (!academicSession || !terms.includes(term)) {
      return res.status(400).json({ success: false, message: "Academic session and a valid term are required." });
    }
    const period = await AcademicPeriod.findOneAndUpdate(
      { key: "current" },
      { key: "current", academicSession, term },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();
    return res.json({ success: true, period });
  } catch (error) {
    console.error("Update academic period error:", error);
    return res.status(500).json({ success: false, message: "Unable to update the current academic term." });
  }
});

module.exports = router;
