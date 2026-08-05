import express from "express";
import { generateDocument } from "../controllers/document.controller.js";

const router = express.Router();

// Document generation route
router.post("/generate", generateDocument);

export default router;
