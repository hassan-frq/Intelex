import express from "express";
import cors from "cors";
import speechRoutes from "./routes/speech.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { requireAuth } from "./middleware/auth.middleware.js";
import keywordsRoutes from "./routes/keywords.routes.js";
import documentRoutes from "./routes/document.routes.js";
import userRoutes from "./routes/user.routes.js";
import caseRoutes from "./routes/case.routes.js";
import dotenv from "dotenv";


dotenv.config();
const app = express();
console.log("DATABASE_URL:", process.env.DATABASE_URL);
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


app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});


app.use("/api/auth", authRoutes);
app.use("/api/speech", requireAuth, speechRoutes);
app.use("/api/keywords", requireAuth, keywordsRoutes);
app.use("/api/users", requireAuth, userRoutes);
app.use("/api/cases", requireAuth, caseRoutes);
app.use("/api", requireAuth, documentRoutes);


export default app;