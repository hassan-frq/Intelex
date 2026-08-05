import { loginWithCredentials, registerWithCredentials, AuthError } from "../services/auth.service.js";

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const { token, user } = await loginWithCredentials(email, password);
    return res.json({ token, user });
  } catch (err) {
    if (err instanceof AuthError) {
      return res.status(err.status).json({ error: err.message });
    }

    console.error("Login error:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}

export async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  try {
    const { token, user } = await registerWithCredentials(name, email, password);
    return res.status(201).json({ token, user });
  } catch (err) {
    if (err instanceof AuthError) {
      return res.status(err.status).json({ error: err.message });
    }

    console.error("Register error:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}