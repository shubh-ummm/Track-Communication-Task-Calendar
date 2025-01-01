const express = require("express");
const {
  getUsers,
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  createCommunication,
  getCommunications,
  updateCommunication,
  deleteCommunication,
  createCommunicationType,
  getCommunicationTypes,
} = require("../controllers/Admin");
const AdminRoutes = express.Router();
const { isAdmin } = require("../middlewares/verifyToken");

AdminRoutes.get("/getusers", isAdmin, getUsers);
AdminRoutes.get("/companies", isAdmin, getCompanies);
AdminRoutes.post("/company", isAdmin, createCompany);
AdminRoutes.put("/companies/:id", isAdmin, updateCompany);
AdminRoutes.delete("/companies/:id", isAdmin, deleteCompany);

AdminRoutes.post("/communications", isAdmin, createCommunication);
AdminRoutes.get("/communications", isAdmin, getCommunications);
AdminRoutes.put("/communications/:id", isAdmin, updateCommunication);
AdminRoutes.delete("/communications/:id", isAdmin, deleteCommunication);

AdminRoutes.post("/communication-types", isAdmin, createCommunicationType);
AdminRoutes.get("/communication-types", isAdmin, getCommunicationTypes);

module.exports = AdminRoutes;
