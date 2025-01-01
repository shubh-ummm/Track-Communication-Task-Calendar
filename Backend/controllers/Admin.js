const User = require("../models/user");
const Company = require("../models/Company");
const Communication = require("../models/Communication");
const CommunicationType = require("../models/CommunicationType");

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all companies
const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find()
      .populate({
        path: "lastCommunications",
        populate: { path: "type" },
      })
      .populate({
        path: "nextCommunication",
        populate: { path: "type" },
      });
    res.status(200).json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new company
const createCompany = async (req, res) => {
  try {
    const newCompany = new Company(req.body);
    const savedCompany = await newCompany.save();
    res.status(201).json(savedCompany);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a company
const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCompany = await Company.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    ).populate({
      path: "lastCommunications nextCommunication",
      populate: { path: "type" },
    });

    if (!updatedCompany) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json(updatedCompany);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a company
const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCompany = await Company.findByIdAndDelete(id);

    if (!deletedCompany) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json({ message: "Company deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Create Communication Type
const createCommunicationType = async (req, res) => {
  try {
    const newType = new CommunicationType(req.body);
    const savedType = await newType.save();
    res.status(201).json(savedType);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get Communication Types
const getCommunicationTypes = async (req, res) => {
  try {
    const types = await CommunicationType.find();
    res.status(200).json(types);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create Communication
const createCommunication = async (req, res) => {
  try {
    const newCommunication = new Communication(req.body);
    const savedCommunication = await newCommunication.save();

    // Update company's lastCommunications and nextCommunication
    const company = await Company.findById(req.body.companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Add to lastCommunications (keep only last 5)
    company.lastCommunications = [
      savedCommunication._id,
      ...company.lastCommunications,
    ].slice(0, 5);

    // Update nextCommunication if this is a planned communication
    if (req.body.status === "planned") {
      const existingNext = company.nextCommunication;
      if (
        !existingNext ||
        new Date(req.body.date) < new Date(existingNext.date)
      ) {
        company.nextCommunication = savedCommunication._id;
      }
    }

    await company.save();

    const populatedCommunication = await savedCommunication.populate([
      { path: "type" },
      { path: "companyId" },
    ]);

    res.status(201).json(populatedCommunication);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get Communications
const getCommunications = async (req, res) => {
  try {
    const communications = await Communication.find()
      .populate("type")
      .populate("companyId");
    res.status(200).json(communications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Communication
const updateCommunication = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCommunication = await Communication.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    )
      .populate("type")
      .populate("companyId");

    if (!updatedCommunication) {
      return res.status(404).json({ message: "Communication not found" });
    }

    res.status(200).json(updatedCommunication);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete Communication
const deleteCommunication = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCommunication = await Communication.findByIdAndDelete(id);

    if (!deletedCommunication) {
      return res.status(404).json({ message: "Communication not found" });
    }

    // Remove from company's lastCommunications and nextCommunication
    const company = await Company.findById(deletedCommunication.companyId);
    if (company) {
      company.lastCommunications = company.lastCommunications.filter(
        (commId) => commId.toString() !== id
      );
      if (company.nextCommunication?.toString() === id) {
        company.nextCommunication = null;
      }
      await company.save();
    }

    res.status(200).json({ message: "Communication deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  createCommunicationType,
  getCommunicationTypes,
  createCommunication,
  getCommunications,
  updateCommunication,
  deleteCommunication,
};
