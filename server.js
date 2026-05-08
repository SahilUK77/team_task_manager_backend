const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const teamRoutes = require("./routes/team");
const chatRoutes = require("./routes/chat");
const projectRoutes = require("./routes/project");
const taskRoutes = require("./routes/task");
const db = require("./config/db");
const { initializeSchema } = require("./config/schema");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/teams", teamRoutes);
app.use("/chat", chatRoutes);
app.use("/projects", projectRoutes);
app.use("/tasks", taskRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Backend is running 🚀" });
});

// Health check
app.get("/health", (req, res) => {
  db.ping((err) => {
    if (err) return res.status(500).json({ db: "error" });
    res.json({ status: "OK", db: "connected" });
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// ✅ START SERVER ONLY AFTER DB CONNECTS
const resolvedPort = Number(process.env.PORT);
const PORT = Number.isFinite(resolvedPort) && resolvedPort > 0 ? resolvedPort : 8080;
const HOST = "0.0.0.0";

async function initSchemaWithRetry(maxRetries = 10, delayMs = 3000) {
  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      await initializeSchema(db);
      schemaReady = true;
      schemaError = null;
      console.log("✅ Database schema ready");
      return;
    } catch (error) {
      schemaError = error;
      console.error(`❌ Schema init failed (attempt ${attempt}/${maxRetries}):`, error.message);
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  console.error("❌ Schema initialization failed after retries. Service stays up for diagnostics.");
}

function startServer() {
  app.listen(PORT, HOST, async () => {
    console.log(`🚀 Server running on ${HOST}:${PORT}`);
    console.log(`ℹ️ process.env.PORT=${process.env.PORT || "<undefined>"}`);
    await initSchemaWithRetry();
  });
}

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

startServer();