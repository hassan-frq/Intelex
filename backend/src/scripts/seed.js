// Run with: npm run seed
import "dotenv/config";
import bcrypt from "bcryptjs";
import { findUserByEmail, createUser } from "../models/user.model.js";
import sql from "../config/db.js";

const TEST_USER = {
  name: "Test User",
  email: "test@intelex.dev",
  password: "password123",
};

async function seed() {
  const existing = await findUserByEmail(TEST_USER.email);

  if (existing) {
    console.log(`User ${TEST_USER.email} already exists (id ${existing.id}). Skipping.`);
    return;
  }

  const passwordHash = await bcrypt.hash(TEST_USER.password, 10);
  const user = await createUser({
    name: TEST_USER.name,
    email: TEST_USER.email,
    passwordHash,
  });

  console.log("Created test user:");
  console.log(`  email: ${TEST_USER.email}`);
  console.log(`  password: ${TEST_USER.password}`);
  console.log(`  id: ${user.id}`);
}

seed()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(() => sql.end());