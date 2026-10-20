const express = require("express");
const router = express.Router();

const {
  register,
  login,
  forgotPassword,
  resetPassword,
  logout,
  getMe,
} = require("../controllers/auth/auth.controller");

const { protect } = require("../middleware/auth.middleware");

router.post("/register", register);
router.post("/login", login);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

module.exports = router;