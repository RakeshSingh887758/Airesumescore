const express = require("express");
const router = express.Router();
const resumsecontroller=require("../controllers/resume/resume.controller");
const { protect } = require("../middleware/auth.middleware");
const uploadResume = require("../middleware/upload.middleware");
router.post("/resume", protect, uploadResume, resumsecontroller.addresume);
router.get("/resume", protect, resumsecontroller.getMyResumes);
router.get("/resume/:id", protect, resumsecontroller.getResumeById);
router.delete("/resume/:id", protect, resumsecontroller.deleteResume);

module.exports = router;