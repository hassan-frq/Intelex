import { createContext, useContext, useState, useCallback } from "react";
import { login as loginRequest } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("intelex_token"));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("intelex_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email, password) => {
    const { token: newToken, user: newUser } = await loginRequest(email, password);

    localStorage.setItem("intelex_token", newToken);
    localStorage.setItem("intelex_user", JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);

    return newUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("intelex_token");
    localStorage.removeItem("intelex_user");
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}