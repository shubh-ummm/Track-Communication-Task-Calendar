
const mongoose = require("mongoose");

const communicationTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ["Email", "Phone Call", "LinkedIn Message", "LinkedIn Post"],
    },
  },
  { timestamps: true }
);

const CommunicationType = mongoose.model(
  "CommunicationType",
  communicationTypeSchema
);

module.exports = CommunicationType;
