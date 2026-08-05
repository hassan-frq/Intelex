import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/**
 * @param {object} metadata - Case fields (petitioner, respondent, subject, etc.)
 * @param {string} transcript - Transcription of audio or typed text
 * @returns {Promise<string>} - Compiled HTML content
 */
export async function generateDocument(metadata, transcript) {
  const response = await axios.post(
    `${API_BASE_URL}/api/document/generate`,
    {
      transcript,
      ...metadata
    },
    {
      headers: { "Content-Type": "application/json" }
    }
  );

  if (response.data && response.data.htmlContent) {
    return response.data.htmlContent;
  }
  
  throw new Error("Invalid response format received from document generator.");
}
