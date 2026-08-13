import { useState, useRef } from "react";
import { FiMic, FiMicOff, FiTag } from "react-icons/fi";
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
  const fullRecorderRef = useRef(null);
  const fullChunksRef = useRef([]);

  const startRecording = async () => {
    setError("");
    setTranscript("");
    setKeywords([]);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      isRecordingRef.current = true;
      setIsRecording(true);

      fullChunksRef.current = [];
      const fullRecorder = new MediaRecorder(stream);
      fullRecorderRef.current = fullRecorder;

      fullRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          fullChunksRef.current.push(event.data);
        }
      };

      fullRecorder.start();
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

      if (isRecordingRef.current) {
        recordChunk(stream);
      } else {
        stream.getTracks().forEach((track) => track.stop());
      }
    };

    mediaRecorder.start();

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

    if (fullRecorderRef.current && fullRecorderRef.current.state !== "inactive") {
      fullRecorderRef.current.onstop = async () => {
        const fullBlob = new Blob(fullChunksRef.current, { type: "audio/webm" });
        await transcribeFullAudio(fullBlob);
      };
      fullRecorderRef.current.stop();
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

  const transcribeFullAudio = async (audioBlob) => {
    setIsTranscribing(true);
    try {
      const text = await transcribeAudioService(audioBlob);
      setTranscript(text);
    } catch (err) {
      setError("Full transcription failed. Check the console for details.");
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
    <div className="p-8 space-y-4 max-w-2xl">

      {/* Page header */}
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: "#c9a84c", letterSpacing: "0.15em" }}>
          Ambient Transcript Synthesis
        </p>
        <h1 className="text-2xl font-semibold" style={{ color: "#e8e0d0" }}>
          Speech to Text
        </h1>
        <p className="text-sm mt-1" style={{ color: "#4d6070" }}>
          Record legal proceedings and generate an accurate transcript.
        </p>
      </div>

      {/* Recording card */}
      <div className="rounded-xl p-5" style={{ background: "#111c27", border: "1px solid #1e2d3d" }}>

        {/* Status row */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className="rounded-full"
            style={{
              width: 8,
              height: 8,
              background: isRecording ? "#e05555" : "#2d4a3e",
              flexShrink: 0,
            }}
          />
          <span
            className="text-xs font-medium uppercase"
            style={{
              letterSpacing: "0.1em",
              color: isRecording ? "#e05555" : "#4d6070",
            }}
          >
            {isRecording ? "Recording active" : isTranscribing ? "Processing..." : "Ready"}
          </span>
        </div>

        {/* Record / Stop button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className="w-full flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-all"
          style={{
            background: isRecording ? "rgba(224, 85, 85, 0.08)" : "rgba(201, 168, 76, 0.08)",
            border: isRecording ? "1px solid rgba(224, 85, 85, 0.3)" : "1px solid rgba(201, 168, 76, 0.3)",
            color: isRecording ? "#e05555" : "#c9a84c",
            letterSpacing: "0.03em",
            cursor: "pointer",
          }}
        >
          {isRecording ? <FiMicOff size={15} /> : <FiMic size={15} />}
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm font-medium" style={{ color: "#e05555" }}>
          {error}
        </p>
      )}

      {/* Transcript card */}
      {transcript && (
        <div className="rounded-xl p-5" style={{ background: "#111c27", border: "1px solid #1e2d3d" }}>
          <p className="text-xs font-medium uppercase mb-3" style={{ color: "#4d6070", letterSpacing: "0.12em" }}>
            Transcript
          </p>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            readOnly={isRecording}
            rows={6}
            className="w-full rounded-lg p-3 text-sm leading-relaxed resize-none focus:outline-none transition-all"
            style={{
              background: "#0a1420",
              border: "1px solid #1e2d3d",
              color: "#8a9baa",
              fontFamily: "Georgia, serif",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
            onBlur={(e) => (e.target.style.borderColor = "#1e2d3d")}
          />
          {!isRecording && (
            <p className="text-xs mt-2" style={{ color: "#2d4a5e" }}>
              Edit transcript before extracting keywords.
            </p>
          )}
        </div>
      )}

      {/* Extract keywords button */}
      {transcript && !isRecording && !isTranscribing && (
        <button
          onClick={handleExtractKeywords}
          className="w-full flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-all"
          style={{
            background: "#162030",
            border: "1px solid #1e2d3d",
            color: "#8a9baa",
            cursor: "pointer",
          }}
        >
          <FiTag size={14} />
          {isExtracting ? "Extracting..." : "Extract legal keywords"}
        </button>
      )}

      {/* Keywords card */}
      {keywords.length > 0 && !isExtracting && (
        <div className="rounded-xl p-5" style={{ background: "#111c27", border: "1px solid #1e2d3d" }}>
          <p className="text-xs font-medium uppercase mb-3" style={{ color: "#4d6070", letterSpacing: "0.12em" }}>
            Legal keywords
          </p>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, index) => (
              <span
                key={index}
                className="text-xs font-medium cursor-default"
                style={{
                  padding: "5px 12px",
                  borderRadius: 20,
                  background: "rgba(201, 168, 76, 0.08)",
                  border: "1px solid rgba(201, 168, 76, 0.2)",
                  color: "#c9a84c",
                }}
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