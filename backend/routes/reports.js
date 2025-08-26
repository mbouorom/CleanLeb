/* eslint-disable @typescript-eslint/no-require-imports */
const express = require("express");
const { auth, adminAuth } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const {
  getReports,
  getReportById,
  createReport,
  voteReport,
} = require("../controllers/reportController");

const router = express.Router();

router.get("/admin/reports", auth, adminAuth, getReports); // only admins/municipal
router.get("/", getReports);
router.get("/:id", getReportById);
router.post("/", auth, upload.array("images", 5), createReport); // ✅
router.put("/:id/vote", auth, voteReport);

module.exports = router;
