const router = require("express").Router();
const requireAuth = require("../middleware/auth");
const Group = require("../models/Group");
const User = require("../models/User");

router.use(requireAuth);

router.post("/", async (req, res) => {
  const { groupName } = req.body;
  if (!groupName) return res.status(400).json({ error: "groupName required" });
  const group = await Group.create({
    groupName, owner: req.userId,
    members: [{ user: req.userId, role: "admin" }],
  });
  res.status(201).json(group);
});

router.get("/", async (req, res) => {
  res.json(await Group.find({ "members.user": req.userId }));
});

// admin adds a user by email; the filter blocks duplicates
router.post("/:id/members", async (req, res) => {
  const target = await User.findOne({ email: (req.body.email || "").toLowerCase() });
  if (!target) return res.status(404).json({ error: "No user with that email" });
  const result = await Group.updateOne(
    { _id: req.params.id,
      members: { $elemMatch: { user: req.userId, role: "admin" } },
      "members.user": { $ne: target._id } },
    { $push: { members: { user: target._id, role: req.body.role === "admin" ? "admin" : "member" } } }
  );
  if (!result.matchedCount)
    return res.status(409).json({ error: "Not an admin of this group, or user already a member" });
  res.json({ message: "Member added" });
});

module.exports = router;
