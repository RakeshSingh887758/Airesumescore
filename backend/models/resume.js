const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    // Logged-in user (auth middleware se aata hai, frontend se nahi)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // File info
    fileName: { type: String, required: true, trim: true },
    fileSize: { type: Number, required: true },

    // Inputs
    jobDescription: { type: String, required: true },
    resumeText: { type: String, required: true, select: false },

    // Result
    matchPercentage: { type: Number, required: true, min: 0, max: 100 },
    verdict: {
      type: String,
      enum: ["Excellent", "Good", "Average", "Poor"],
      required: true,
    },

    breakdown: {
      skills: { type: Number, default: 0 },
      keywords: { type: Number, default: 0 },
      experience: { type: Number, default: 0 },
      sections: { type: Number, default: 0 },
      formatting: { type: Number, default: 0 },
    },

    matchedSkills: [String],
    missingSkills: [String],
    extraSkills: [String],
    matchedKeywords: [String],
    missingKeywords: [String],

    experience: {
      required: { type: Number, default: null },
      found: { type: Number, default: null },
    },

    sections: {
      found: [String],
      missing: [String],
    },

    contact: {
      email: { type: Boolean, default: false },
      phone: { type: Boolean, default: false },
      linkedin: { type: Boolean, default: false },
      github: { type: Boolean, default: false },
    },

    stats: {
      wordCount: { type: Number, default: 0 },
      actionVerbs: { type: Number, default: 0 },
      quantifiedAchievements: { type: Number, default: 0 },
    },

    strengths: [String],
    suggestions: [String],
    summary: { type: String },
  },
  { timestamps: true }
);

resumeSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Resume", resumeSchema);