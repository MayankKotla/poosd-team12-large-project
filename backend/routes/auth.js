const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { sendMail } = require("../utils/mailer");

router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password || password.length < 8)
      return res.status(400).json({ error: "All fields required; password min 8 chars" });
    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(409).json({ error: "Email already registered" });

    const verifyToken = crypto.randomBytes(32).toString("hex");
    await User.create({
      firstName, lastName, email,
      passwordHash: await bcrypt.hash(password, 12),
      verifyToken,
    });
    const link = `${process.env.API_URL}/api/auth/verify/${verifyToken}`;
    await sendMail(email, "Verify your email", `<p>Click to verify: <a href="${link}">${link}</a></p>`);
    res.status(201).json({ message: "Registered. Check your email to verify." });
  } catch (e) {
    console.error("REGISTER ERROR:", e);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/verify/:token", async (req, res) => {
  const user = await User.findOne({ verifyToken: req.params.token });
  if (!user) return res.status(400).send("Invalid or used verification link");
  user.isVerified = true;
  user.verifyToken = undefined;
  await user.save();
  res.redirect(`${process.env.APP_URL}/login?verified=1`);
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || "").toLowerCase() });
  if (!user || !(await bcrypt.compare(password || "", user.passwordHash)))
    return res.status(401).json({ error: "Invalid email or password" });
  if (!user.isVerified)
    return res.status(403).json({ error: "Please verify your email first" });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email } });
});

router.post("/forgot-password", async (req, res) => {
  const user = await User.findOne({ email: (req.body.email || "").toLowerCase() });
  if (user) {
    user.resetToken = crypto.randomBytes(32).toString("hex");
    user.resetTokenExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();
    const link = `${process.env.APP_URL}/reset-password/${user.resetToken}`;
    await sendMail(user.email, "Reset your password", `<p>Reset here: <a href="${link}">${link}</a></p>`);
  }
  res.json({ message: "If that email exists, a reset link was sent." }); // same reply either way
});

router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;
  if (!password || password.length < 8) return res.status(400).json({ error: "Password min 8 chars" });
  const user = await User.findOne({ resetToken: token, resetTokenExpires: { $gt: Date.now() } });
  if (!user) return res.status(400).json({ error: "Invalid or expired token" });
  user.passwordHash = await bcrypt.hash(password, 12);
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;
  await user.save();
  res.json({ message: "Password updated" });
});

module.exports = router;
