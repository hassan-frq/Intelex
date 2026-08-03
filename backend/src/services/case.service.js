import {
  getAllCases,
  findCaseById,
  createCase,
  updateCase,
  deleteCase,
} from "../models/case.model.js";

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

const VALID_STATUSES = ["open", "in_progress", "closed"];

function validateCaseInput({ title, client }, isCreate) {
  if (isCreate) {
    if (!title || !title.trim()) {
      throw new ValidationError("Case title is required.");
    }
    if (!client || !client.trim()) {
      throw new ValidationError("Client name is required.");
    }
  }
}

function validateStatus(status) {
  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    throw new ValidationError(
      `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`
    );
  }
}

export function listCases(userId) {
  return getAllCases(userId);
}

export function getCase(id, userId) {
  const caseItem = findCaseById(id, userId);
  if (!caseItem) throw new NotFoundError("Case not found.");
  return caseItem;
}

export function addCase(userId, data) {
  validateCaseInput(data, true);
  validateStatus(data.status);

  return createCase({
    userId,
    title: data.title.trim(),
    client: data.client.trim(),
    court: data.court?.trim(),
    caseNumber: data.caseNumber?.trim(),
    status: data.status || "open",
    description: data.description?.trim(),
    date: data.date,
  });
}

export function editCase(id, userId, data) {
  validateCaseInput(data, false);
  validateStatus(data.status);

  if (data.title !== undefined && !data.title.trim()) {
    throw new ValidationError("Case title cannot be empty.");
  }
  if (data.client !== undefined && !data.client.trim()) {
    throw new ValidationError("Client name cannot be empty.");
  }

  const updated = updateCase(id, userId, data);
  if (!updated) throw new NotFoundError("Case not found.");
  return updated;
}

export function removeCase(id, userId) {
  const success = deleteCase(id, userId);
  if (!success) throw new NotFoundError("Case not found.");
  return true;
}