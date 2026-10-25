require("dotenv").config();

const express = require("express");
const cors=require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const resume = require("./routes/resume.routes");

const app = express();

app.use(express.json({ limit: "10kb" }));
app.use(cors());

app.get("/", (req, res) => {
  res.json({ message: "Authentication API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api", resume);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const startServer = async () => {
  if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
    throw new Error("MONGO_URI and JWT_SECRET must be configured");
  }

  await connectDB();

  const port = process.env.PORT || 5000;

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

startServer().catch((error) => {
  console.error("Server startup failed:", error.message);
  process.exit(1);
});