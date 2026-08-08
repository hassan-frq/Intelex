import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByEmail, createUser } from "../models/user.model.js";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "1d";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set. Add it to backend/.env");
}

export async function loginWithCredentials(email, password) {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new AuthError("Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    throw new AuthError("Invalid email or password");
  }

  const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
}

export async function registerWithCredentials(name, email, password) {
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new AuthError("An account with that email already exists", 409);
  }

  if (password.length < 8) {
    throw new AuthError("Password must be at least 8 characters", 400);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser({ name, email, passwordHash });

  const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export class AuthError extends Error {
  constructor(message, status = 401) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}