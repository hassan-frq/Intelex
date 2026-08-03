import api from "./api";

export async function getCases() {
  const { data } = await api.get("/api/cases");
  return data.cases;
}

export async function getCase(id) {
  const { data } = await api.get(`/api/cases/${id}`);
  return data.case;
}

export async function createCase(caseData) {
  const { data } = await api.post("/api/cases", caseData);
  return data.case;
}

export async function updateCase(id, caseData) {
  const { data } = await api.put(`/api/cases/${id}`, caseData);
  return data.case;
}

export async function deleteCase(id) {
  await api.delete(`/api/cases/${id}`);
}