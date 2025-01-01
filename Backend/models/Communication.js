// models/Communication.ts
const mongoose = require("mongoose");

const communicationSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Email", "Phone Call", "LinkedIn Message", "LinkedIn Post"],
    },
    issueDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    deadlineDate: {
      type: Date,
      required: true,
    },
    notes: String,
    completed: {
      type: Boolean,
      default: false,
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Communication = mongoose.model("Communication", communicationSchema);

module.exports = Communication;
