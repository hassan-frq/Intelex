export async function transcribeWithGroq(audioBuffer, originalFilename) {
  const formData = new FormData();
  const audioBlob = new Blob([audioBuffer]);

  formData.append("file", audioBlob, originalFilename || "audio.webm");
  formData.append("model", "whisper-large-v3-turbo");

  const response = await fetch(
    "https://api.groq.com/openai/v1/audio/transcriptions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  return data.text;
}