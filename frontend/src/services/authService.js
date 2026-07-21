import api from "./api";

export async function login(email, password) {
  const { data } = await api.post("/api/auth/login", { email, password });
  return data; // { token, user }
}