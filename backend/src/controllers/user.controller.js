import {
  getProfile,
  updateProfile,
  changePassword,
  ValidationError,
} from "../services/user.service.js";
import { AuthError } from "../services/auth.service.js";

function handleError(err, res) {
  if (err instanceof ValidationError || err instanceof AuthError) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error("User route error:", err);
  return res.status(500).json({ error: "Something went wrong. Please try again." });
}

export function getMe(req, res) {
  try {
    const user = getProfile(req.user.id);
    res.json({ user });
  } catch (err) {
    handleError(err, res);
  }
}

export function updateMe(req, res) {
  const { name, email } = req.body;

  if (!name && !email) {
    return res.status(400).json({ error: "Provide a name or email to update" });
  }

  try {
    const user = updateProfile(req.user.id, { name, email });
    res.json({ user });
  } catch (err) {
    handleError(err, res);
  }
}

export async function updateMyPassword(req, res) {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Current and new password are required" });
  }

  try {
    await changePassword(req.user.id, currentPassword, newPassword);
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    handleError(err, res);
  }
}