import sql from "../config/db.js";

export async function getAllCases(userId) {
  return sql`
    SELECT * FROM cases
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;
}

export async function findCaseById(id, userId) {
  const rows = await sql`
    SELECT * FROM cases
    WHERE id = ${id} AND user_id = ${userId}
    LIMIT 1
  `;
  return rows[0] || null;
}

export async function createCase({
  userId,
  title,
  client,
  court,
  caseNumber,
  status,
  description,
  date,
}) {
  const rows = await sql`
    INSERT INTO cases (
      user_id, title, client, court, case_number, status, description, date
    ) VALUES (
      ${userId},
      ${title},
      ${client},
      ${court || ""},
      ${caseNumber || ""},
      ${status || "open"},
      ${description || ""},
      ${date || null}
    )
    RETURNING *
  `;
  return rows[0];
}

const FIELD_MAP = {
  title: "title",
  client: "client",
  court: "court",
  caseNumber: "case_number",
  status: "status",
  description: "description",
  date: "date",
};

export async function updateCase(id, userId, updates) {
  const existing = await findCaseById(id, userId);
  if (!existing) return null;

  const merged = { ...existing };
  for (const [key, dbField] of Object.entries(FIELD_MAP)) {
    if (updates[key] !== undefined) merged[dbField] = updates[key];
  }

  const rows = await sql`
    UPDATE cases
    SET
      title = ${merged.title},
      client = ${merged.client},
      court = ${merged.court},
      case_number = ${merged.case_number},
      status = ${merged.status},
      description = ${merged.description},
      date = ${merged.date},
      updated_at = now()
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING *
  `;
  return rows[0] || null;
}

export async function deleteCase(id, userId) {
  const rows = await sql`
    DELETE FROM cases
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING id
  `;
  return rows.length > 0;
}