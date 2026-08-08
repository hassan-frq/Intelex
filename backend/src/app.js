import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import speechRoutes from "./routes/speech.routes.js";
import keywordsRoutes from "./routes/keywords.routes.js";
import documentRoutes from "./routes/document.routes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:5175",
      "http://127.0.0.1:5175"
    ],
  })
);
app.use(express.json());

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Health check — quick way to confirm the server's alive
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/speech", speechRoutes);
app.use("/api/keywords", keywordsRoutes);
app.use("/api/document", documentRoutes);

export default app;
