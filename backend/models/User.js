const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  login: String, // legacy field from the MySQL data
  passwordHash: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verifyToken: String,
  resetToken: String,
  resetTokenExpires: Date,
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema, "users");
