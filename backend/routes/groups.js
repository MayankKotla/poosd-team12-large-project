
const router = require("express").Router();
const mongoose = require("mongoose");
const requireAuth = require("../middleware/auth");
const Group = require("../models/Group");
const User = require("../models/User");

router.use(requireAuth);

// Create a group
router.post("/", async (req, res) => {
  const { groupName } = req.body;

  if (!groupName) {
    return res.status(400).json({ error: "groupName required" });
  }

  const group = await Group.create({
    groupName,
    owner: req.userId,
    members: [{ user: req.userId, role: "admin" }],
  });

  res.status(201).json(group);
});

// Get groups belonging to logged-in user
router.get("/", async (req, res) => {
  res.json(await Group.find({ "members.user": req.userId }));
});

// Admin adds a user by email
router.post("/:id/members", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Invalid group ID" });
  }

  const target = await User.findOne({
    email: (req.body.email || "").toLowerCase(),
  });

  if (!target) {
    return res.status(404).json({ error: "No user with that email" });
  }

  const result = await Group.updateOne(
    {
      _id: req.params.id,
      members: {
        $elemMatch: { user: req.userId, role: "admin" },
      },
      "members.user": { $ne: target._id },
    },
    {
      $push: {
        members: {
          user: target._id,
          role: req.body.role === "admin" ? "admin" : "member",
        },
      },
    }
  );

  if (!result.matchedCount) {
    return res.status(409).json({
      error: "Not an admin of this group, or user already a member",
    });
  }

  res.json({ message: "Member added" });
});

// Admin removes a member
router.delete("/:id/members/:userId", async (req, res) => {
  const { id, userId } = req.params;

  if (
    !mongoose.isValidObjectId(id) ||
    !mongoose.isValidObjectId(userId)
  ) {
    return res.status(400).json({
      error: "Invalid group or user ID",
    });
  }

  const group = await Group.findOne({
    _id: id,
    members: {
      $elemMatch: { user: req.userId, role: "admin" },
    },
  });

  if (!group) {
    return res.status(403).json({
      error: "You must be a group admin to remove members",
    });
  }

  // Protect the group owner
  if (group.owner.toString() === userId) {
    return res.status(403).json({
      error: "The group owner cannot be removed",
    });
  }

  const result = await Group.updateOne(
    { _id: id },
    { $pull: { members: { user: userId } } }
  );

  if (!result.modifiedCount) {
    return res.status(404).json({
      error: "User is not a member of this group",
    });
  }

  res.json({ message: "Member removed successfully" });
});

module.exports = router;
