const mongoose = require("mongoose");
const Resume = require("../../models/resume");
const extractPdfText = require("../../utils/extractPdfText");
const { analyzeResume } = require("../../utils/Resumeanalyzer");

const MIN_JD_LENGTH = 50;
const MAX_JD_LENGTH = 15000;

// Response me bhejne layak shape (resumeText jaisa heavy data nahi)
const toResponse = (doc) => ({
  id: doc._id,
  fileName: doc.fileName,
  fileSize: doc.fileSize,
  jobDescription: doc.jobDescription,
  matchPercentage: doc.matchPercentage,
  verdict: doc.verdict,
  breakdown: doc.breakdown,
  matchedSkills: doc.matchedSkills,
  missingSkills: doc.missingSkills,
  extraSkills: doc.extraSkills,
  matchedKeywords: doc.matchedKeywords,
  missingKeywords: doc.missingKeywords,
  experience: doc.experience,
  sections: doc.sections,
  contact: doc.contact,
  stats: doc.stats,
  strengths: doc.strengths,
  suggestions: doc.suggestions,
  summary: doc.summary,
  createdAt: doc.createdAt,
});

// POST /api/resume  (protected, multipart/form-data: resume + job_desc)
exports.addresume = async (req, res) => {
  try {
    const jobDescription = (req.body?.job_desc || "").trim();

    if (!req.file) {
      return res.status(400).json({ message: "Please upload your resume (PDF) in the 'resume' field" });
    }
    if (!jobDescription) {
      return res.status(400).json({ message: "Job description (job_desc) is required" });
    }
    if (jobDescription.length < MIN_JD_LENGTH) {
      return res.status(400).json({ message: `Job description must be at least ${MIN_JD_LENGTH} characters` });
    }
    if (jobDescription.length > MAX_JD_LENGTH) {
      return res.status(400).json({ message: `Job description must be under ${MAX_JD_LENGTH} characters` });
    }

    // PDF -> text
    let resumeText;
    try {
      resumeText = await extractPdfText(req.file.buffer);
    } catch (err) {
      console.error("PDF parse error:", err.message);
      return res.status(422).json({ message: "Could not read this PDF. Make sure it is not corrupted or password-protected." });
    }

    if (!resumeText || resumeText.split(/\s+/).length < 30) {
      return res.status(422).json({
        message: "Very little text found in the PDF. Scanned/image resumes can't be read — please upload a text-based PDF.",
      });
    }

    // Analysis
    const analysis = analyzeResume(resumeText, jobDescription);

    // User backend se (auth middleware) — frontend se nahi
    const saved = await Resume.create({
      user: req.user._id,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      jobDescription,
      resumeText,
      ...analysis,
    });

    return res.status(201).json({
      message: "Resume analyzed successfully",
      user: { id: req.user._id, name: req.user.name, email: req.user.email },
      analysis: toResponse(saved),
    });
  } catch (error) {
    console.error("Add resume error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/resume  — logged-in user ki saari analyses (history)
exports.getMyResumes = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));

    const [items, total] = await Promise.all([
      Resume.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("fileName matchPercentage verdict createdAt missingSkills"),
      Resume.countDocuments({ user: req.user._id }),
    ]);

    return res.status(200).json({
      total,
      page,
      pages: Math.ceil(total / limit),
      resumes: items.map((r) => ({
        id: r._id,
        fileName: r.fileName,
        matchPercentage: r.matchPercentage,
        verdict: r.verdict,
        missingSkillsCount: r.missingSkills.length,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get resumes error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/resume/:id  — ek analysis ki full detail (sirf owner dekh sakta hai)
exports.getResumeById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid resume id" });
    }

    const doc = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!doc) return res.status(404).json({ message: "Analysis not found" });

    return res.status(200).json({ analysis: toResponse(doc) });
  } catch (error) {
    console.error("Get resume error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE /api/resume/:id
exports.deleteResume = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid resume id" });
    }

    const deleted = await Resume.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!deleted) return res.status(404).json({ message: "Analysis not found" });

    return res.status(200).json({ message: "Analysis deleted" });
  } catch (error) {
    console.error("Delete resume error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};