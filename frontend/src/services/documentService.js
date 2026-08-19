import api from "./api";

/**
 * @param {object} metadata - Case fields (petitioner, respondent, subject, etc.)
 * @param {string} transcript - Transcription of audio or typed text
 * @returns {Promise<string>} - Compiled HTML content
 */
export async function generateDocument(metadata, transcript) {
  const response = await api.post(
    "/api/document/generate",
    {
      transcript,
      ...metadata
    }
  );

  if (response.data && response.data.htmlContent) {
    return response.data.htmlContent;
  }
  
  throw new Error("Invalid response format received from document generator.");
}

/**
 * Calls backend references search API (keyword extraction + Google Scholar search)
 * @param {string} courtId 
 * @param {string} transcript 
 * @returns {Promise<{keywords: string[], results: Array}>}
 */
export async function searchReferences(courtId, transcript) {
  const response = await api.post(
    "/api/document/search-references",
    { courtId, transcript }
  );
  return response.data;
}

/**
 * Calls backend document generation endpoint with curation references list
 * @param {object} metadata 
 * @param {string} transcript 
 * @param {Array} selectedReferences 
 * @returns {Promise<string>} Compiled HTML
 */
export async function generateWithCitations(metadata, transcript, selectedReferences) {
  const response = await api.post(
    "/api/document/generate-with-citations",
    { metadata, transcript, selectedReferences }
  );
  return response.data.htmlContent;
}
