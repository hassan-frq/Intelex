import express from "express";
import { extractKeywords } from "../controllers/keywords.controller.js";

const router = express.Router();

router.post("/extract", extractKeywords);

export default router;
