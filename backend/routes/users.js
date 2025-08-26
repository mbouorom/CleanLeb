/* eslint-disable @typescript-eslint/no-require-imports */
const express = require("express");
const { auth } = require("../middleware/auth");
const { getLeaderboard, getProfile } = require("../controllers/userController");

const router = express.Router();

router.get("/leaderboard", getLeaderboard);
router.get("/profile", auth, getProfile);

module.exports = router;
