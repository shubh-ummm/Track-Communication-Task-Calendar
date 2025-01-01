const express = require("express");
const {
  getCommunications,
  completeCommunication,
  completeMultipleCommunications,
} = require("../controllers/User");
const { verifyToken } = require("../middlewares/verifyToken");

const UserRoutes = express.Router();

const errorHandler = (err, req, res, next) => {
  console.error("User routes error:", err);
  res.status(500).json({
    message: "An error occurred in the user routes",
    error: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

UserRoutes.use(verifyToken);

UserRoutes.get("/communications", getCommunications);
UserRoutes.patch(
  "/communications/:communicationId/complete",
  completeCommunication
);
UserRoutes.post(
  "/communications/complete-multiple",
  completeMultipleCommunications
);

UserRoutes.use(errorHandler);

module.exports = UserRoutes;
