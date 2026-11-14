const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  dayOfWeek: { type: String, required: true,
    enum: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"] },
  startTime: { type: String, required: true }, // "09:00"
  endTime: { type: String, required: true },
  title: { type: String, default: "Shift", trim: true },
  status: { type: String, enum: ["assigned", "up_for_grabs"], default: "assigned" },
}, { timestamps: true });

module.exports = mongoose.model("Schedule", scheduleSchema, "schedules");
