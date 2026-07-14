import express from "express";
import upload from "../middleware/upload.middleware.js";
import { transcribeAudio } from "../controllers/speech.controller.js";

const router = express.Router();

router.post("/transcribe", upload.single("audioFile"), transcribeAudio);

export default router;