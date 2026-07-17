import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/**
 * Sends the transcribed text to the backend to extract legal keywords.
 * 
 * @param {string} transcript - The transcribed legal text.
 * @returns {Promise<string[]>} - A promise resolving to an array of keywords.
 */
export async function extractKeywords(transcript) {
  const response = await axios.post(
    `${API_BASE_URL}/api/keywords/extract`,
    { transcript },
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  return response.data.keywords;
}
