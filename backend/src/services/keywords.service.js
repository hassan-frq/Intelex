
  /**
 * Extracting legal keywords from transcript using Groq API
 * @param {string} transcript 
 * @returns {Promise<string[]>} 
 */
export async function extractKeywords(transcript) {
  if (!transcript || !transcript.trim()) {
    return [];
  }

  
  const models = ["llama-3.3-70b-versatile", "llama3-8b-8192"];
  let lastError = null;

  for (const model of models) {
    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: "system",
                content:
                  "You are an expert legal AI assistant. Your task is to extract the most relevant legal keywords, phrases, statutory references (Acts, Sections, Articles), and case laws from the provided text.\n\n" +
                  "Do NOT use simple frequency-based word extraction. Focus on extracting:\n" +
                  "1. Core legal concepts/doctrines (e.g., 'adverse possession', 'medical negligence', 'promissory estoppel').\n" +
                  "2. Relevant statutes, acts, regulations, or articles (e.g., 'Specific Relief Act 1877', 'Article 199').\n" +
                  "3. Essential factual details of the dispute or petition (e.g., 'encroachment', 'wrongful termination').\n" +
                  "4. Parties/Entities involved if they are crucial to understanding the legal dispute.\n\n" +
                  "You must respond ONLY with a JSON object in the following format:\n" +
                  "{\n" +
                  "  \"keywords\": [\"keyword1\", \"keyword2\", ...]\n" +
                  "}",
              },
              {
                role: "user",
                content: `Please extract the legal keywords from the following text:\n\n${transcript}`,
              },
            ],
            response_format: { type: "json_object" },
            temperature: 0.1, 
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Groq API error (${model}): ${response.status} - ${errText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error(`Empty response content from model ${model}`);
      }

      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.keywords)) {
       
        return [
          ...new Set(
            parsed.keywords
              .map((kw) => kw.trim())
              .filter((kw) => kw.length > 0)
          ),
        ];
      }

      throw new Error(`Invalid response format from model ${model}: ${content}`);
    } catch (err) {
      console.warn(`Failed keyword extraction with model ${model}:`, err.message);
      lastError = err;
    }
  }

  throw new Error(`Failed to extract keywords after trying all models. Last error: ${lastError?.message}`);
}
