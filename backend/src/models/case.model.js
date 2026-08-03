import { readDb, writeDb } from "../config/db.js";

function ensureCasesArray(db) {
  if (!db.cases) db.cases = [];
  return db;
}

export function getAllCases(userId) {
  const db = ensureCasesArray(readDb());
  return db.cases
    .filter((c) => c.user_id === userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export function findCaseById(id, userId) {
  const db = ensureCasesArray(readDb());
  return db.cases.find((c) => c.id === id && c.user_id === userId) || null;
}

export function createCase({
  userId,
  title,
  client,
  court,
  caseNumber,
  status,
  description,
  date,
}) {
  const db = ensureCasesArray(readDb());

  const newCase = {
    id: db.cases.length ? Math.max(...db.cases.map((c) => c.id)) + 1 : 1,
    user_id: userId,
    title,
    client,
    court: court || "",
    case_number: caseNumber || "",
    status: status || "open",
    description: description || "",
    date: date || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.cases.push(newCase);
  writeDb(db);
  return newCase;
}

export function updateCase(id, userId, updates) {
  const db = ensureCasesArray(readDb());
  const caseItem = db.cases.find((c) => c.id === id && c.user_id === userId);
  if (!caseItem) return null;

  const fieldMap = {
    title: "title",
    client: "client",
    court: "court",
    caseNumber: "case_number",
    status: "status",
    description: "description",
    date: "date",
  };

  for (const [key, dbField] of Object.entries(fieldMap)) {
    if (updates[key] !== undefined) caseItem[dbField] = updates[key];
  }

  caseItem.updated_at = new Date().toISOString();
  writeDb(db);
  return caseItem;
}

export function deleteCase(id, userId) {
  const db = ensureCasesArray(readDb());
  const index = db.cases.findIndex((c) => c.id === id && c.user_id === userId);
  if (index === -1) return false;

  db.cases.splice(index, 1);
  writeDb(db);
  return true;
}