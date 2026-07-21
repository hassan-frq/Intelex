import { extractKeywords as extractKeywordsService } from "../services/keywords.service.js";

export async function extractKeywords(req, res) {
  try {
    const { transcript } = req.body;
    if (!transcript || typeof transcript !== "string") {
      return res.status(400).json({ error: "Missing or invalid transcript in request body." });
    }
    const keywords = await extractKeywordsService(transcript);
    res.json({ keywords });
  } catch (err) {
    console.error("Keywords extraction error:", err);
    res.status(500).json({ error: "Failed to extract keywords from transcript." });
  }
}