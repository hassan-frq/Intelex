import bcrypt from "bcryptjs";
import {
  findUserById,
  findUserByEmail,
  findUserWithPasswordById,
  updateUser,
  updateUserPassword,
} from "../models/user.model.js";
import { AuthError } from "./auth.service.js";

export function getProfile(userId) {
  const user = findUserById(userId);
  if (!user) {
    throw new AuthError("User not found");
  }
  return user;
}

export function updateProfile(userId, { name, email }) {
  if (email) {
    const existing = findUserByEmail(email);
    if (existing && existing.id !== userId) {
      throw new ValidationError("That email is already in use");
    }
  }

  const updated = updateUser(userId, { name, email });
  if (!updated) {
    throw new AuthError("User not found");
  }
  return updated;
}

export async function changePassword(userId, currentPassword, newPassword) {
  const user = findUserWithPasswordById(userId);
  if (!user) {
    throw new AuthError("User not found");
  }

  const matches = await bcrypt.compare(currentPassword, user.password_hash);
  if (!matches) {
    throw new ValidationError("Current password is incorrect");
  }

  if (newPassword.length < 8) {
    throw new ValidationError("New password must be at least 8 characters");
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  updateUserPassword(userId, newHash);
}

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
    this.status = 400;
  }
}