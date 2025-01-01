const express = require("express");
require("dotenv").config();
const app = express();
const port = process.env.PORT;
const cors = require("cors");
const connectDB = require("./utils/db");
const AuthRoutes = require("./routes/Auth");
const AdminRoutes = require("./routes/AdminRoutes");
const UserRoutes = require("./routes/UserRoutes");
const cookieParser = require("cookie-parser");
require("./models/Company");
require("./models/Communication");
require("./models/CommunicationType");

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["set-cookie"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

connectDB();

app.use("/api/auth", AuthRoutes);
app.use("/api/admin", AdminRoutes);
app.use("/api/user", UserRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Something went wrong!", error: err.message });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
