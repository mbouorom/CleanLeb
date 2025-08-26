/* eslint-disable @typescript-eslint/no-require-imports */
const multer = require("multer");
const path = require("path");

// Multer memory storage with configuration
const storage = multer.memoryStorage();

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Configure multer with limits and file filter
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 5, // Maximum 5 files
  },
  fileFilter,
});

module.exports = { upload };
