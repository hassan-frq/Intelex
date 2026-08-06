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

export async function getCaseDocuments(caseId) {
  const { data } = await api.get(`/api/cases/${caseId}/documents`);
  return data.documents;
}

export async function uploadCaseDocument(caseId, file) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post(`/api/cases/${caseId}/documents`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.document;
}

export async function deleteCaseDocument(documentId) {
  await api.delete(`/api/documents/${documentId}`);
}

export async function viewCaseDocument(documentId) {
  const { data } = await api.get(`/api/documents/${documentId}`, {
    responseType: "blob",
  });
  const blobUrl = URL.createObjectURL(data);
  window.open(blobUrl, "_blank");
}