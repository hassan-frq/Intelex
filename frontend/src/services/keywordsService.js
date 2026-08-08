import api from "./api";

/**
 * Sends the transcribed text to the backend to extract legal keywords.
 * 
 * @param {string} transcript - The transcribed legal text.
 * @returns {Promise<string[]>} - A promise resolving to an array of keywords.
 */
export async function extractKeywords(transcript) {
  const response = await api.post("/api/keywords/extract", { transcript });

  return response.data.keywords;
}