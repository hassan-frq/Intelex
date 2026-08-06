import {
  getDocumentsByCase,
  findDocumentById,
  insertDocument,
  deleteDocument,
} from "../models/document.model.js";
import { findCaseById } from "../models/case.model.js";

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFoundError";
  }
}

const ALLOWED_MIME_TYPES = ["application/pdf"];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

async function assertCaseOwnership(caseId, userId) {
  const caseItem = await findCaseById(caseId, userId);
  if (!caseItem) {
    throw new NotFoundError("Case not found.");
  }
}

export async function listDocuments(caseId, userId) {
  await assertCaseOwnership(caseId, userId);
  return getDocumentsByCase(caseId, userId);
}

export async function addDocument(caseId, userId, file) {
  if (!file) {
    throw new ValidationError("No file provided.");
  }
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new ValidationError("Only PDF files are allowed.");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new ValidationError("File must be smaller than 15MB.");
  }

  await assertCaseOwnership(caseId, userId);

  return insertDocument({
    caseId,
    userId,
    filename: file.originalname,
    mimeType: file.mimetype,
    fileSize: file.size,
    fileData: file.buffer,
  });
}

export async function getDocumentForDownload(id, userId) {
  const doc = await findDocumentById(id, userId);
  if (!doc) throw new NotFoundError("Document not found.");
  return doc;
}

export async function removeDocument(id, userId) {
  const success = await deleteDocument(id, userId);
  if (!success) throw new NotFoundError("Document not found.");
  return true;
}