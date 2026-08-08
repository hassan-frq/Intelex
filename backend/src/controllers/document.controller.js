
import { draftLegalContentWithGroq, compileTemplate } from "../services/document.service.js";
import {
  listDocuments,
  addDocument,
  getDocumentForDownload,
  removeDocument,
  ValidationError,
  NotFoundError,
} from "../services/document.service.js";

export async function generateDocument(req, res) {
  try {
    const { 
      transcript, 
      caseId, 
      courtId,
      documentTypeId, 
      petitioner, 
      respondent, 
      caseNumber, 
      advocate, 
      draftDate,
      subject,
      extraMetadata
    } = req.body;

    if (!transcript || !transcript.trim()) {
      return res.status(400).json({ error: "Transcription text is required to generate a document." });
    }

    if (!petitioner || !respondent) {
      return res.status(400).json({ error: "Petitioner and Respondent names are required." });
    }

    const metadata = {
      courtId,
      documentTypeId: documentTypeId || "petition",
      petitioner,
      respondent,
      caseNumber,
      advocate,
      draftDate,
      subject,
      extraMetadata: extraMetadata || {}
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


function handleError(err, res) {
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message });
  }
  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: err.message });
  }
  console.error("Document controller error:", err);
  return res.status(500).json({ error: "Something went wrong." });
}

export async function getCaseDocuments(req, res) {
  try {
    const caseId = Number(req.params.caseId);
    const documents = await listDocuments(caseId, req.user.id);
    res.json({ documents });
  } catch (err) {
    handleError(err, res);
  }
}

export async function uploadCaseDocument(req, res) {
  try {
    const caseId = Number(req.params.caseId);
    const document = await addDocument(caseId, req.user.id, req.file);
    res.status(201).json({ document });
  } catch (err) {
    handleError(err, res);
  }
}

export async function downloadCaseDocument(req, res) {
  try {
    const id = Number(req.params.id);
    const doc = await getDocumentForDownload(id, req.user.id);

    res.setHeader("Content-Type", doc.mime_type);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(doc.filename)}"`
    );
    res.send(doc.file_data);
  } catch (err) {
    handleError(err, res);
  }
}

export async function deleteCaseDocument(req, res) {
  try {
    const id = Number(req.params.id);
    await removeDocument(id, req.user.id);
    res.status(204).send();
  } catch (err) {
    handleError(err, res);
  }
}

