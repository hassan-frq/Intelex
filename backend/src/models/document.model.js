import sql from "../config/db.js";

export async function getDocumentsByCase(caseId, userId) {
  return sql`
    SELECT id, case_id, filename, mime_type, file_size, uploaded_at
    FROM case_documents
    WHERE case_id = ${caseId} AND user_id = ${userId}
    ORDER BY uploaded_at DESC
  `;
}

export async function findDocumentById(id, userId) {
  const rows = await sql`
    SELECT *
    FROM case_documents
    WHERE id = ${id} AND user_id = ${userId}
    LIMIT 1
  `;
  return rows[0] || null;
}

export async function insertDocument({
  caseId,
  userId,
  filename,
  mimeType,
  fileSize,
  fileData,
}) {
  const rows = await sql`
    INSERT INTO case_documents (case_id, user_id, filename, mime_type, file_size, file_data)
    VALUES (${caseId}, ${userId}, ${filename}, ${mimeType}, ${fileSize}, ${fileData})
    RETURNING id, case_id, filename, mime_type, file_size, uploaded_at
  `;
  return rows[0];
}

export async function deleteDocument(id, userId) {
  const rows = await sql`
    DELETE FROM case_documents
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING id
  `;
  return rows.length > 0;
}