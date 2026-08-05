import { draftLegalContentWithGroq, compileTemplate } from "../services/document.service.js";

export async function generateDocument(req, res) {
  try {
    const { 
      transcript, 
      caseId, 
      documentTypeId, 
      petitioner, 
      respondent, 
      caseNumber, 
      advocate, 
      draftDate,
      subject 
    } = req.body;

    if (!transcript || !transcript.trim()) {
      return res.status(400).json({ error: "Transcription text is required to generate a document." });
    }

    if (!petitioner || !respondent) {
      return res.status(400).json({ error: "Petitioner and Respondent names are required." });
    }

    const metadata = {
      documentTypeId: documentTypeId || "petition",
      petitioner,
      respondent,
      caseNumber,
      advocate,
      draftDate,
      subject
    };

    console.log(`Drafting legal document of type: ${metadata.documentTypeId} for Petitioner: ${metadata.petitioner}`);

    // 1. Call Groq service to generate structural legal content (facts, grounds, prayer)
    const draftData = await draftLegalContentWithGroq(metadata, transcript);

    // 2. Load templates locally and compile HTML
    const htmlContent = await compileTemplate(metadata, draftData);

    // 3. Return compiled HTML
    res.json({ 
      success: true,
      htmlContent 
    });

  } catch (err) {
    console.error("Document generation error:", err);
    res.status(500).json({ error: `Failed to generate document: ${err.message}` });
  }
}
