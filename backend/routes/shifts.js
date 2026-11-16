
const router = require("express").Router();
const mongoose = require("mongoose");
const requireAuth = require("../middleware/auth");
const Group = require("../models/Group");
const Schedule = require("../models/Schedule");

router.use(requireAuth);

const escapeRegex = (s) =>
  s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const validDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const validTime = (time) =>
  typeof time === "string" &&
  /^([01]\d|2[0-3]):[0-5]\d$/.test(time);

// Admin assigns a shift to a member
router.post("/", async (req, res) => {
  const {
    groupId,
    userId,
    dayOfWeek,
    startTime,
    endTime,
    title,
  } = req.body;

  const group = await Group.findOne({
    _id: groupId,
    members: {
      $elemMatch: { user: req.userId, role: "admin" },
    },
    "members.user": userId,
  });

  if (!group) {
    return res.status(403).json({
      error: "Must be a group admin and the user must be a member",
    });
  }

  const shift = await Schedule.create({
    group: groupId,
    user: userId,
    dayOfWeek,
    startTime,
    endTime,
    title,
  });

  res.status(201).json(shift);
});

// Get my shifts
router.get("/mine", async (req, res) => {
  res.json(
    await Schedule.find({ user: req.userId })
      .populate("group", "groupName")
  );
});

// Search shifts in groups I belong to
router.get("/search", async (req, res) => {
  const q = (req.query.q || "").trim();

  const groups = await Group.find({
    "members.user": req.userId,
  }).select("_id");

  const filter = {
    group: { $in: groups.map((g) => g._id) },
  };

  if (q) {
    filter.title = {
      $regex: escapeRegex(q),
      $options: "i",
    };
  }

  if (req.query.day) {
    filter.dayOfWeek = req.query.day;
  }

  res.json(
    await Schedule.find(filter)
      .populate("user", "firstName lastName")
      .limit(50)
  );
});

// Shifts other people put up for grabs
router.get("/open", async (req, res) => {
  const groups = await Group.find({
    "members.user": req.userId,
  }).select("_id");

  res.json(
    await Schedule.find({
      status: "up_for_grabs",
      group: { $in: groups.map((g) => g._id) },
    })
  );
});

// Admin edits an existing shift
router.put("/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid shift ID" });
  }

  const shift = await Schedule.findById(id);

  if (!shift) {
    return res.status(404).json({ error: "Shift not found" });
  }

  const isAdmin = await Group.exists({
    _id: shift.group,
    members: {
      $elemMatch: { user: req.userId, role: "admin" },
    },
  });

  if (!isAdmin) {
    return res.status(403).json({
      error: "Only group admins can edit shifts",
    });
  }

  const updates = {};
  const allowedFields = [
    "dayOfWeek",
    "startTime",
    "endTime",
    "title",
    "status",
  ];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  if (
    updates.dayOfWeek !== undefined &&
    !validDays.includes(updates.dayOfWeek)
  ) {
    return res.status(400).json({
      error: "Invalid dayOfWeek",
    });
  }

  if (
    updates.startTime !== undefined &&
    !validTime(updates.startTime)
  ) {
    return res.status(400).json({
      error: "Invalid startTime. Use HH:mm format",
    });
  }

  if (
    updates.endTime !== undefined &&
    !validTime(updates.endTime)
  ) {
    return res.status(400).json({
      error: "Invalid endTime. Use HH:mm format",
    });
  }

  if (
    updates.title !== undefined &&
    (typeof updates.title !== "string" || !updates.title.trim())
  ) {
    return res.status(400).json({
      error: "Title cannot be empty",
    });
  }

  if (
    updates.status !== undefined &&
    !["assigned", "up_for_grabs"].includes(updates.status)
  ) {
    return res.status(400).json({
      error: "Invalid shift status",
    });
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      error: "No valid fields provided",
    });
  }

  const updatedShift = await Schedule.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  res.json(updatedShift);
});

// Admin deletes an existing shift
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid shift ID" });
  }

  const shift = await Schedule.findById(id);

  if (!shift) {
    return res.status(404).json({ error: "Shift not found" });
  }

  const isAdmin = await Group.exists({
    _id: shift.group,
    members: {
      $elemMatch: { user: req.userId, role: "admin" },
    },
  });

  if (!isAdmin) {
    return res.status(403).json({
      error: "Only group admins can delete shifts",
    });
  }

  await Schedule.deleteOne({ _id: id });

  res.json({ message: "Shift deleted successfully" });
});

// Release a shift
router.post("/:id/release", async (req, res) => {
  const r = await Schedule.updateOne(
    { _id: req.params.id, user: req.userId },
    { status: "up_for_grabs" }
  );

  if (!r.matchedCount) {
    return res.status(404).json({
      error: "Shift not found or not yours",
    });
  }

  res.json({ message: "Shift is now up for grabs" });
});

// Claim a shift
router.post("/:id/claim", async (req, res) => {
  const shift = await Schedule.findById(req.params.id);

  if (!shift) {
    return res.status(404).json({ error: "Not found" });
  }

  const inGroup = await Group.exists({
    _id: shift.group,
    "members.user": req.userId,
  });

  if (!inGroup) {
    return res.status(403).json({
      error: "Not in this group",
    });
  }

  const claimed = await Schedule.findOneAndUpdate(
    { _id: shift._id, status: "up_for_grabs" },
    { user: req.userId, status: "assigned" },
    { new: true }
  );

  if (!claimed) {
    return res.status(409).json({
      error: "Shift no longer available",
    });
  }

  res.json(claimed);
});

module.exports = router;
