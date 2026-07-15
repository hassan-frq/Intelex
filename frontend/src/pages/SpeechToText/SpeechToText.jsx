import { useState, useRef } from "react";
import Button from "../../components/common/Button/Button";
import Loader from "../../components/common/Loader/Loader";
import { transcribeAudio as transcribeAudioService } from "../../services/speechService";

const CHUNK_DURATION_MS = 5000;

function SpeechToText() {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const isRecordingRef = useRef(false);

  const startRecording = async () => {
    setError("");
    setTranscript("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      isRecordingRef.current = true;
      setIsRecording(true);

      recordChunk(stream);
    } catch (err) {
      setError("Microphone access was denied or unavailable.");
      console.error(err);
    }
  };

  const recordChunk = (stream) => {
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    const chunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(chunks, { type: "audio/webm" });
      await transcribeAudio(audioBlob);

      // If we're still supposed to be recording, start the next chunk
      if (isRecordingRef.current) {
        recordChunk(stream);
      } else {
        stream.getTracks().forEach((track) => track.stop());
      }
    };

    mediaRecorder.start();

    // Stop this recorder after CHUNK_DURATION_MS, which triggers onstop above
    setTimeout(() => {
      if (mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }
    }, CHUNK_DURATION_MS);
  };

  const stopRecording = () => {
    isRecordingRef.current = false;
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  const transcribeAudio = async (audioBlob) => {
    setIsTranscribing(true);

    try {
      const text = await transcribeAudioService(audioBlob);
      setTranscript((prev) => prev + " " + text);
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

      <div className="min-h-[24px]">
        {isTranscribing && <Loader />}
      </div>

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