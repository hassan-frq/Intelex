import api from "./api";

export async function getProfile() {
  const { data } = await api.get("/api/users/me");
  return data.user;
}

export async function updateProfile({ name, email }) {
  const { data } = await api.put("/api/users/me", { name, email });
  return data.user;
}

export async function changePassword({ currentPassword, newPassword }) {
  const { data } = await api.put("/api/users/me/password", {
    currentPassword,
    newPassword,
  });
  return data.message;
}