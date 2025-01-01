// models/Company.ts
const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    linkedinProfile: { type: String, required: true },
    emails: [{ type: String, required: true }],
    phoneNumbers: [{ type: String, required: true }],
    comments: String,
    communicationPeriodicity: { type: Number, required: true, default: 7 },
    lastCommunications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Communication",
      },
    ],
    nextCommunication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Communication",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate for all communications
companySchema.virtual("communications", {
  ref: "Communication",
  localField: "_id",
  foreignField: "companyId",
});

const Company = mongoose.model("Company", companySchema);

module.exports = Company;
