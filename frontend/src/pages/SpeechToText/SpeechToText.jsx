import { useState, useRef } from "react";
import Button from "../../components/common/Button/Button";
import Loader from "../../components/common/Loader/Loader";
import { transcribeAudio as transcribeAudioService } from "../../services/speechService";
import { extractKeywords as extractKeywordsService } from "../../services/keywordsService";

const CHUNK_DURATION_MS = 5000;

function SpeechToText() {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [isExtracting, setIsExtracting] = useState(false);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const isRecordingRef = useRef(false);

  const startRecording = async () => {
    setError("");
    setTranscript("");
    setKeywords([]);

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

  const handleExtractKeywords = async () => {
    if (!transcript) return;
    setError("");
    setIsExtracting(true);
    try {
      const extracted = await extractKeywordsService(transcript);
      setKeywords(extracted);
    } catch (err) {
      setError("Keywords extraction failed. Check the console for details.");
      console.error(err);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-white font-sans">Speech to Text — Test</h1>

      <Button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </Button>

      {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

      {transcript && (
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 shadow-lg shadow-black/20">
          <p className="text-sm text-zinc-400 mb-2 font-medium">Transcript:</p>
          <p className="text-white leading-relaxed">{transcript}</p>
        </div>
      )}

      {transcript && !isRecording && !isTranscribing && (
        <div className="pt-2">
          <Button
            onClick={handleExtractKeywords}
            className="bg-indigo-600 hover:bg-indigo-700 active:scale-98 transition-all duration-150 shadow-lg shadow-indigo-900/30"
          >
            {isExtracting ? "Extracting..." : "Extract Legal Keywords"}
          </Button>
        </div>
      )}

      {keywords.length > 0 && !isExtracting && (
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 shadow-xl shadow-black/40 transition-all duration-350">
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, index) => (
              <span
                key={index}
                className="px-3.5 py-1.5 text-sm bg-zinc-800/60 hover:bg-zinc-800 text-zinc-200 rounded-full border border-zinc-700/60 hover:border-indigo-500/50 cursor-default transition-all duration-200 hover:scale-105 active:scale-95 hover:text-white"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SpeechToText;