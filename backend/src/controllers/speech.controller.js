import { transcribeWithGroq } from "../services/speech.service.js";

export async function transcribeAudio(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided." });
    }

    const transcript = await transcribeWithGroq(
      req.file.buffer,
      req.file.originalname
    );

    res.json({ transcript });
  } catch (err) {
    console.error("Transcription error:", err);
    res.status(500).json({ error: "Failed to transcribe audio." });
  }
}