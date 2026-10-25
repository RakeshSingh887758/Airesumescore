const multer = require("multer");
const path = require("path");

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

// Memory storage: file disk pe save nahi hoti, sirf buffer milta hai
// jisse PDF parse karke text nikal lete hain.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isPdf = file.mimetype === "application/pdf" && ext === ".pdf";

  if (!isPdf) {
    const err = new Error("Only PDF files are allowed");
    err.code = "INVALID_FILE_TYPE";
    return cb(err);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE, files: 1 },
});

// Multer errors ko clean JSON response me convert karta hai
const uploadResume = (req, res, next) => {
  upload.single("resume")(req, res, (err) => {
    if (!err) return next();

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "Resume must be smaller than 5 MB" });
    }
    if (err.code === "INVALID_FILE_TYPE") {
      return res.status(400).json({ message: err.message });
    }
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        message: `Upload error: ${err.message}. Use the field name "resume".`,
      });
    }
    return next(err);
  });
};

module.exports = uploadResume;