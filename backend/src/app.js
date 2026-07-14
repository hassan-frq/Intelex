import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import speechRoutes from "./routes/speech.routes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);
app.use(express.json());

// Health check — quick way to confirm the server's alive
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/speech", speechRoutes);

export default app;
