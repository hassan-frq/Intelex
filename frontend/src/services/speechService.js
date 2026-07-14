import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export async function transcribeAudio(audioBlob) {
  const formData = new FormData();
  formData.append("audioFile", audioBlob, "recording.webm");

  const response = await axios.post(
    `${API_BASE_URL}/api/speech/transcribe`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  return response.data.transcript;
}