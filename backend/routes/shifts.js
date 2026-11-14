const router = require("express").Router();
const requireAuth = require("../middleware/auth");
const Group = require("../models/Group");
const Schedule = require("../models/Schedule");

router.use(requireAuth);

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// admin assigns a shift to a member
router.post("/", async (req, res) => {
  const { groupId, userId, dayOfWeek, startTime, endTime, title } = req.body;
  const group = await Group.findOne({
    _id: groupId,
    members: { $elemMatch: { user: req.userId, role: "admin" } },
    "members.user": userId,
  });
  if (!group) return res.status(403).json({ error: "Must be a group admin and the user must be a member" });
  const shift = await Schedule.create({ group: groupId, user: userId, dayOfWeek, startTime, endTime, title });
  res.status(201).json(shift);
});

router.get("/mine", async (req, res) => {
  res.json(await Schedule.find({ user: req.userId }).populate("group", "groupName"));
});

// SEARCH: partial, case-insensitive, done on the server, limited to my groups
// GET /api/shifts/search?q=sy&day=Monday
router.get("/search", async (req, res) => {
  const q = (req.query.q || "").trim();
  const groups = await Group.find({ "members.user": req.userId }).select("_id");
  const filter = { group: { $in: groups.map((g) => g._id) } };
  if (q) filter.title = { $regex: escapeRegex(q), $options: "i" };
  if (req.query.day) filter.dayOfWeek = req.query.day;
  res.json(await Schedule.find(filter).populate("user", "firstName lastName").limit(50));
});

// shifts other people put up for grabs in a group I belong to
router.get("/open", async (req, res) => {
  const groups = await Group.find({ "members.user": req.userId }).select("_id");
  res.json(await Schedule.find({ status: "up_for_grabs", group: { $in: groups.map((g) => g._id) } }));
});

router.post("/:id/release", async (req, res) => {
  const r = await Schedule.updateOne({ _id: req.params.id, user: req.userId }, { status: "up_for_grabs" });
  if (!r.matchedCount) return res.status(404).json({ error: "Shift not found or not yours" });
  res.json({ message: "Shift is now up for grabs" });
});

// atomic claim: only succeeds if it's still up for grabs and I'm in that group
router.post("/:id/claim", async (req, res) => {
  const shift = await Schedule.findById(req.params.id);
  if (!shift) return res.status(404).json({ error: "Not found" });
  const inGroup = await Group.exists({ _id: shift.group, "members.user": req.userId });
  if (!inGroup) return res.status(403).json({ error: "Not in this group" });
  const claimed = await Schedule.findOneAndUpdate(
    { _id: shift._id, status: "up_for_grabs" },
    { user: req.userId, status: "assigned" }, { new: true });
  if (!claimed) return res.status(409).json({ error: "Shift no longer available" });
  res.json(claimed);
});

module.exports = router;
