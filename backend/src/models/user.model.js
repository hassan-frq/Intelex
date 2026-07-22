import { readDb, writeDb } from "../config/db.js";

export function findUserByEmail(email) {
  const db = readDb();
  return db.users.find((u) => u.email === email) || null;
}

export function findUserById(id) {
  const db = readDb();
  const user = db.users.find((u) => u.id === id);
  if (!user) return null;
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

// Internal use only (password verification) - includes password_hash.
export function findUserWithPasswordById(id) {
  const db = readDb();
  return db.users.find((u) => u.id === id) || null;
}

export function updateUser(id, { name, email }) {
  const db = readDb();
  const user = db.users.find((u) => u.id === id);
  if (!user) return null;

  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;

  writeDb(db);
  return findUserById(id);
}

export function updateUserPassword(id, newPasswordHash) {
  const db = readDb();
  const user = db.users.find((u) => u.id === id);
  if (!user) return null;

  user.password_hash = newPasswordHash;
  writeDb(db);
  return true;
}

export function createUser({ name, email, passwordHash }) {
  const db = readDb();

  const newUser = {
    id: db.users.length ? Math.max(...db.users.map((u) => u.id)) + 1 : 1,
    name,
    email,
    password_hash: passwordHash,
    created_at: new Date().toISOString(),
  };

  db.users.push(newUser);
  writeDb(db);

  return findUserById(newUser.id);
}