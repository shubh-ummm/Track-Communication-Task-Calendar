const Communication = require("../models/Communication");
const Company = require("../models/Company");

const getCommunications = async (req, res) => {
  try {
    const userId = req.user._id;

    const communications = await Communication.find()
      .populate("companyId", "name location")
      .sort({ issueDate: -1 }) 
      .lean()
      .exec();

    console.log("Raw communications with populated company:", communications);

    const transformedCommunications = await Promise.all(
      communications.map(async (comm) => {
        let companyDetails = comm.companyId;
        if (comm.companyId && typeof comm.companyId === "string") {
          try {
            companyDetails = await Company.findById(comm.companyId).lean();
          } catch (err) {
            console.error(
              `Error fetching company details for ID ${comm.companyId}:`,
              err
            );
          }
        }

        return {
          _id: comm._id.toString(),
          type: comm.type || "Unknown",
          companyId:
            comm.companyId?._id?.toString() ||
            comm.companyId?.toString() ||
            null,
          companyName: companyDetails?.name || "Unknown Company",
          companyLocation: companyDetails?.location || "Unknown Location",
          issueDate: comm.issueDate || null,
          deadlineDate: comm.deadlineDate || null,
          notes: comm.notes || "",
          completed: Boolean(comm.completed),
          completedBy: comm.completedBy?.toString() || null,
          completedAt: comm.completedAt || null,
        };
      })
    );

    console.log("Final transformed communications:", transformedCommunications);

    res.json(transformedCommunications);
  } catch (err) {
    console.error("Error in getCommunications:", err);
    res.status(500).json({
      message: "Error fetching communications",
      error: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};

const completeCommunication = async (req, res) => {
  try {
    const { communicationId } = req.params;
    const userId = req.user._id;

    const communication = await Communication.findByIdAndUpdate(
      communicationId,
      {
        completed: true,
        completedBy: userId,
        completedAt: new Date(),
      },
      { new: true }
    ).populate("companyId", "name location");

    if (!communication) {
      return res.status(404).json({ message: "Communication not found" });
    }

    res.json(communication);
  } catch (err) {
    console.error("Error in completeCommunication:", err);
    res.status(500).json({
      message: "Error completing communication",
      error: err.message,
    });
  }
};

const completeMultipleCommunications = async (req, res) => {
  try {
    const { communicationIds } = req.body;
    const userId = req.user._id;

    if (!Array.isArray(communicationIds) || communicationIds.length === 0) {
      return res.status(400).json({ message: "No communications provided" });
    }

    const updatedCommunications = await Communication.updateMany(
      {
        _id: { $in: communicationIds },
        completed: false,
      },
      {
        completed: true,
        completedBy: userId,
        completedAt: new Date(),
      }
    );

    if (updatedCommunications.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "No communications were updated" });
    }

    res.json({
      message: `${updatedCommunications.modifiedCount} communications marked as complete`,
      modifiedCount: updatedCommunications.modifiedCount,
    });
  } catch (err) {
    console.error("Error in completeMultipleCommunications:", err);
    res.status(500).json({
      message: "Error completing communications",
      error: err.message,
    });
  }
};

module.exports = {
  getCommunications,
  completeCommunication,
  completeMultipleCommunications,
};
