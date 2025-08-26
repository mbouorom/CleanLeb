/* eslint-disable @typescript-eslint/no-require-imports */
const express = require("express");
const { auth } = require("../middleware/auth");
const { adminAuth } = require("../middleware/auth");
const { updateReport } = require("../controllers/adminController");

const router = express.Router();

router.put("/reports/:id", auth, adminAuth, updateReport);

module.exports = router;
