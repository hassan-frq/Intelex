import sql from "../config/db.js";

export async function findUserByEmail(email) {
  const rows = await sql`
    SELECT * FROM users WHERE email = ${email} LIMIT 1
  `;
  return rows[0] || null;
}

export async function findUserById(id) {
  const rows = await sql`
    SELECT id, name, email, created_at
    FROM users
    WHERE id = ${id}
    LIMIT 1
  `;
  return rows[0] || null;
}

// Internal use only (password verification) - includes password_hash.
export async function findUserWithPasswordById(id) {
  const rows = await sql`
    SELECT * FROM users WHERE id = ${id} LIMIT 1
  `;
  return rows[0] || null;
}

export async function updateUser(id, { name, email }) {
  const rows = await sql`
    UPDATE users
    SET
      name = COALESCE(${name ?? null}, name),
      email = COALESCE(${email ?? null}, email)
    WHERE id = ${id}
    RETURNING id, name, email, created_at
  `;
  return rows[0] || null;
}

export async function updateUserPassword(id, newPasswordHash) {
  const rows = await sql`
    UPDATE users
    SET password_hash = ${newPasswordHash}
    WHERE id = ${id}
    RETURNING id
  `;
  return rows.length > 0;
}

export async function createUser({ name, email, passwordHash }) {
  const rows = await sql`
    INSERT INTO users (name, email, password_hash)
    VALUES (${name}, ${email}, ${passwordHash})
    RETURNING id, name, email, created_at
  `;
  return rows[0];
}