// Run with: npm run seed
import bcrypt from "bcryptjs";
import { findUserByEmail, createUser } from "../models/user.model.js";

const TEST_USER = {
  name: "Test User",
  email: "test@intelex.dev",
  password: "password123",
};

async function seed() {
  const existing = findUserByEmail(TEST_USER.email);

  if (existing) {
    console.log(`User ${TEST_USER.email} already exists (id ${existing.id}). Skipping.`);
    return;
  }

  const passwordHash = await bcrypt.hash(TEST_USER.password, 10);
  const user = createUser({
    name: TEST_USER.name,
    email: TEST_USER.email,
    passwordHash,
  });

  console.log("Created test user:");
  console.log(`  email: ${TEST_USER.email}`);
  console.log(`  password: ${TEST_USER.password}`);
  console.log(`  id: ${user.id}`);
}

seed();