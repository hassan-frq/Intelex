import api from "./api";

export async function transcribeAudio(audioBlob) {
  const formData = new FormData();
  formData.append("audioFile", audioBlob, "recording.webm");

  const response = await api.post("/api/speech/transcribe", formData);

  return response.data.transcript;
}