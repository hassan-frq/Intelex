// function SpeechToText() {
//   return <h1>Speech to Text</h1>;
// }

// export default SpeechToText;

import { useState, useRef } from "react";
import Button from "../../components/common/Button/Button";
import Loader from "../../components/common/Loader/Loader";

function SpeechToText() {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    setError("");
    setTranscript("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        await transcribeAudio(audioBlob);

        // Release the mic
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setError("Microphone access was denied or unavailable.");
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob) => {
    setIsTranscribing(true);

    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");
      formData.append("model", "whisper-large-v3-turbo");

      const response = await fetch(
        "https://api.groq.com/openai/v1/audio/transcriptions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Groq API error: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      setTranscript(data.text);
    } catch (err) {
      setError("Transcription failed. Check the console for details.");
      console.error(err);
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Speech to Text — Test</h1>

      <Button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </Button>

      {isTranscribing && <Loader />}

      {error && <p className="text-red-500">{error}</p>}

      {transcript && (
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4">
          <p className="text-sm text-zinc-400 mb-2">Transcript:</p>
          <p className="text-white">{transcript}</p>
        </div>
      )}
    </div>
  );
}

export default SpeechToText;