import {
  listDocuments,
  addDocument,
  getDocumentForDownload,
  removeDocument,
  ValidationError,
  NotFoundError,
} from "../services/document.service.js";

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