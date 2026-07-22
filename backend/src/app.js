import express from "express";
import cors from "cors";
import speechRoutes from "./routes/speech.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { requireAuth } from "./middleware/auth.middleware.js";
import keywordsRoutes from "./routes/keywords.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/speech", requireAuth, speechRoutes);
app.use("/api/keywords", requireAuth, keywordsRoutes);
app.use("/api/users", requireAuth, userRoutes);

export default app;