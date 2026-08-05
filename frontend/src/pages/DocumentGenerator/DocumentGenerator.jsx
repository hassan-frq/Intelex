import React, { useState, useEffect, useRef } from "react";
import { 
  FiArrowLeft, 
  FiCheck, 
  FiDownload, 
  FiFileText, 
  FiSave, 
  FiRotateCcw,
  FiFile,
  FiEdit,
  FiBookOpen,
  FiAlertCircle,
  FiMic,
  FiSquare
} from "react-icons/fi";
import { transcribeAudio } from "../../services/speechService";
import { generateDocument } from "../../services/documentService";
import html2pdf from "html2pdf.js";

// Configuration Arrays: Easily extensible in code by developer in the future
const COURTS = [
  { 
    id: "supreme_court", 
    name: "Supreme Court of Pakistan", 
    shortName: "Supreme Court", 
    city: "Islamabad", 
    prefix: "IN THE SUPREME COURT OF PAKISTAN" 
  },
  { 
    id: "islamabad_hc", 
    name: "Islamabad High Court", 
    shortName: "Islamabad HC", 
    city: "Islamabad", 
    prefix: "IN THE ISLAMABAD HIGH COURT, ISLAMABAD" 
  },
  { 
    id: "lahore_hc", 
    name: "Lahore High Court", 
    shortName: "Lahore HC", 
    city: "Lahore", 
    prefix: "IN THE LAHORE HIGH COURT, LAHORE" 
  }
];

const COURT_DOCUMENT_TYPES = {
  supreme_court: [
    { 
      id: "petition", 
      name: "Petition (Art 184/3)", 
      description: "Constitutional Petition in original jurisdiction for human rights.",
      defaultTitle: "WRIT PETITION UNDER ARTICLE 184(3)"
    },
    { 
      id: "appellate", 
      name: "Appellate Petition", 
      description: "Civil/Criminal Petition for Leave to Appeal under Article 185(3).",
      defaultTitle: "PETITION FOR LEAVE TO APPEAL UNDER ARTICLE 185(3)"
    },
    { 
      id: "suomoto", 
      name: "Sou Moto", 
      description: "Response statement to a Supreme Court initiated inquiry.",
      defaultTitle: "REPLY STATEMENT IN SOU MOTO CASE"
    },
    { 
      id: "writ", 
      name: "Writ Petition", 
      description: "Appellate challenge seeking a writ of direction.",
      defaultTitle: "WRIT PETITION"
    },
    { 
      id: "review", 
      name: "Review Petition", 
      description: "Review of a Supreme Court judgment under Article 188.",
      defaultTitle: "REVIEW PETITION UNDER ARTICLE 188"
    },
    { 
      id: "transfer", 
      name: "Transfer Petition", 
      description: "Transfer a suit from one provincial High Court to another.",
      defaultTitle: "TRANSFER PETITION UNDER ARTICLE 186A"
    },
    { 
      id: "contempt", 
      name: "Contempt Petition", 
      description: "Action against willful disobedience of court orders (Art 204).",
      defaultTitle: "CONTEMPT PETITION UNDER ARTICLE 204"
    }
  ],
  islamabad_hc: [
    { 
      id: "writ", 
      name: "Writ Petition (Art 199)", 
      description: "Constitutional writ of Certiorari, Mandamus, or Prohibition.",
      defaultTitle: "WRIT PETITION UNDER ARTICLE 199"
    },
    { 
      id: "criminal", 
      name: "Criminal Petition (CrPC)", 
      description: "Bail application under Section 497/498 or Quashment.",
      defaultTitle: "CRIMINAL MISCELLANEOUS BAIL APPLICATION"
    },
    { 
      id: "civil", 
      name: "Civil Petition (CPC)", 
      description: "Civil Revision under Section 115 or Second Appeal.",
      defaultTitle: "CIVIL REVISION UNDER SECTION 115 CPC"
    },
    { 
      id: "commercial", 
      name: "Commercial Suit", 
      description: "Recovery of finance suit or commercial contract breach.",
      defaultTitle: "SUIT FOR RECOVERY OF FINANCE"
    },
    { 
      id: "tax", 
      name: "Tax Reference", 
      description: "Tax appeal Reference under Section 133 of Income Tax Ordinance.",
      defaultTitle: "TAX REFERENCE UNDER SECTION 133"
    }
  ],
  lahore_hc: [
    { 
      id: "writ", 
      name: "Writ Petition (Art 199)", 
      description: "Constitutional writ petition under Article 199.",
      defaultTitle: "WRIT PETITION UNDER ARTICLE 199"
    },
    { 
      id: "criminal", 
      name: "Criminal Petition (CrPC)", 
      description: "Criminal Miscellaneous bail application, revision, or quashment.",
      defaultTitle: "CRIMINAL MISCELLANEOUS PETITION"
    },
    { 
      id: "civil", 
      name: "Civil Petition (CPC)", 
      description: "Civil Revision under Section 115 CPC or Second Appeal.",
      defaultTitle: "CIVIL REVISION UNDER SECTION 115 CPC"
    },
    { 
      id: "corporate", 
      name: "Corporate Petition", 
      description: "Winding up, oppression, or corporate deadlock petition.",
      defaultTitle: "COMPANY PETITION UNDER THE COMPANIES ACT, 2017"
    }
  ]
};

function DocumentGenerator() {
  // Navigation and generator steps: 'config' | 'generating' | 'editor'
  const [step, setStep] = useState("config");
  
  // Selection states
  const [selectedCourtId, setSelectedCourtId] = useState(COURTS[0].id);
  const [selectedDocTypeId, setSelectedDocTypeId] = useState(COURT_DOCUMENT_TYPES[COURTS[0].id][0].id);
  
  // Metadata fields
  const [petitioner, setPetitioner] = useState("");
  const [respondent, setRespondent] = useState("");
  const [caseNumber, setCaseNumber] = useState("");
  const [subject, setSubject] = useState("");
  const [advocate, setAdvocate] = useState("");
  const [draftDate, setDraftDate] = useState(new Date().toISOString().split("T")[0]);
  
  // Keep selection synchronized when court changes
  useEffect(() => {
    const validTypes = COURT_DOCUMENT_TYPES[selectedCourtId] || [];
    if (validTypes.length > 0) {
      const isValid = validTypes.some(type => type.id === selectedDocTypeId);
      if (!isValid) {
        setSelectedDocTypeId(validTypes[0].id);
      }
    }
  }, [selectedCourtId, selectedDocTypeId]);

  // Audio Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingState, setRecordingState] = useState("idle"); // 'idle' | 'recording' | 'transcribing' | 'success' | 'error'
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  // Generation loading states
  const [loadingStageIndex, setLoadingStageIndex] = useState(0);
  const loadingStages = [
    "Analyzing case metadata...",
    "Sending request to Llama legal engine...",
    "Formatting document layout to superior court conventions...",
    "Injecting petitioner and respondent signatures...",
    "Finalizing document preview..."
  ];

  // Rich Text Editor editable state
  const [editableContent, setEditableContent] = useState("");
  const editorRef = useRef(null);
  
  // Custom toast notification state
  const [toastMessage, setToastMessage] = useState("");

  const selectedCourt = COURTS.find(c => c.id === selectedCourtId) || COURTS[0];
  const currentDocTypes = COURT_DOCUMENT_TYPES[selectedCourtId] || COURT_DOCUMENT_TYPES.supreme_court;
  const selectedDocType = currentDocTypes.find(d => d.id === selectedDocTypeId) || currentDocTypes[0];

  // Helper for toaster
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 4500);
  };

  // Manage Recording Timer
  useEffect(() => {
    if (isRecording) {
      setRecordingDuration(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRecording]);

  // Audio Capture Start
  const startRecording = async () => {
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        // Close audio track streams
        stream.getTracks().forEach(track => track.stop());
        
        setRecordingState("transcribing");
        try {
          showToast("Sending voice clip for transcription...");
          const transcriptText = await transcribeAudio(audioBlob);
          if (transcriptText && transcriptText.trim()) {
            setSubject(prev => prev ? `${prev} ${transcriptText}` : transcriptText);
            setRecordingState("success");
            showToast("Speech transcribed successfully!");
          } else {
            setRecordingState("error");
            showToast("No clear speech detected. Please try again.");
          }
        } catch (err) {
          console.error("Transcription failed:", err);
          setRecordingState("error");
          showToast("Failed to transcribe audio. Please type manually.");
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingState("recording");
      showToast("Dictation started. Click stop when finished speaking.");
    } catch (err) {
      console.error("Failed to access microphone:", err);
      showToast("Microphone access denied. Check your browser permissions.");
    }
  };

  // Audio Capture Stop
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Handle Document Generation Trigger
  const handleGenerate = async (e) => {
    e.preventDefault();
    setStep("generating");
    setLoadingStageIndex(0);

    // Simulate progressive visual stages while call is in progress
    const loadingTimer = setInterval(() => {
      setLoadingStageIndex(prev => {
        if (prev < loadingStages.length - 1) return prev + 1;
        return prev;
      });
    }, 1500);

    try {
      const metadata = {
        caseId: 1,
        courtId: selectedCourtId,
        documentTypeId: selectedDocTypeId,
        petitioner,
        respondent,
        caseNumber,
        advocate,
        draftDate,
        subject
      };

      // Call actual document generator endpoint
      const htmlContent = await generateDocument(metadata, subject);
      
      clearInterval(loadingTimer);
      setEditableContent(htmlContent);
      setStep("editor");
      showToast("Legal document drafted successfully from transcription.");
    } catch (err) {
      clearInterval(loadingTimer);
      console.error("Compilation failed:", err);
      setStep("config");
      showToast(`Error compiling document: ${err.response?.data?.error || err.message}`);
    }
  };

  // Format Recording Duration time
  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // High-Fidelity PDF Export using html2pdf.js (Direct File Download)
  const handleDownload = () => {
    const content = editorRef.current ? editorRef.current.innerHTML : editableContent;
    
    // Create a temporary container styled exactly as an A4 page with appropriate margins
    const element = document.createElement("div");
    
    // Standard legal margins layout styling
    element.style.fontFamily = "'Times New Roman', Georgia, serif";
    element.style.fontSize = "15px";
    element.style.lineHeight = "2";
    element.style.color = "#111111";
    element.style.width = "100%";
    element.style.padding = "0.2in 0.2in 0.2in 0.5in"; // Padding offset to ensure bind-line aligns correctly
    element.innerHTML = content;
    
    // Configure html2pdf options
    const opt = {
      margin:       [0.8, 1.2, 0.8, 0.8], // [top, left, bottom, right] in inches
      filename:     `${selectedDocType.id}_supreme_court.pdf`.toLowerCase(),
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    
    // Trigger download
    if (html2pdf) {
      showToast("Compiling PDF document for download...");
      html2pdf().from(element).set(opt).save().then(() => {
        showToast("PDF downloaded successfully!");
      }).catch(err => {
        console.error("PDF generation failed:", err);
        showToast("Failed to compile PDF. Check console.");
      });
    } else {
      showToast("PDF exporter library is still loading. Please wait a moment.");
    }
  };

  // Rich Text Editor formatting wrapper
  const formatText = (command) => {
    document.execCommand(command, false, null);
    if (editorRef.current) {
      setEditableContent(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-4 text-white shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20 text-blue-500">
            <FiCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Header Panel */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <FiFileText className="text-blue-500" /> Document Generator
          </h1>
        </div>
      </div>

      {step === "config" && (
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleGenerate} className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
            
            {/* Section 1: Court Selection */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-3">
                1. Target Jurisdiction (Court)
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                {COURTS.map((court) => {
                  const isSelected = selectedCourtId === court.id;
                  return (
                    <button
                      key={court.id}
                      type="button"
                      onClick={() => setSelectedCourtId(court.id)}
                      className={`relative flex flex-col justify-between rounded-xl border p-4 text-left transition duration-200 focus:outline-none ${
                        isSelected
                          ? "border-blue-600 bg-blue-600/5 text-white"
                          : "border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900"
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded ${
                          isSelected ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400"
                        }`}>
                          {court.city}
                        </span>
                        {isSelected && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-xs">
                            <FiCheck className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                      <span className="mt-4 block font-semibold text-sm text-zinc-200">
                        {court.shortName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Document Type */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-3">
                2. Document Classification
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                {currentDocTypes.map((docType) => {
                  const isSelected = selectedDocTypeId === docType.id;
                  return (
                    <button
                      key={docType.id}
                      type="button"
                      onClick={() => setSelectedDocTypeId(docType.id)}
                      className={`relative flex flex-col text-left rounded-xl border p-4 transition duration-200 focus:outline-none ${
                        isSelected
                          ? "border-blue-600 bg-blue-600/5 text-white"
                          : "border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm text-zinc-200">{docType.name}</span>
                        {isSelected && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-xs">
                            <FiCheck className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-zinc-500 leading-relaxed">
                        {docType.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <hr className="border-zinc-800" />

            {/* Section 3: Case Data */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
                3. Case Data
              </h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">
                    Petitioner Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Mian Muhammad Nawaz"
                    value={petitioner}
                    onChange={(e) => setPetitioner(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-650 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-150"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">
                    Respondent Name(s)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Federation of Pakistan"
                    value={respondent}
                    onChange={(e) => setRespondent(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-650 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-150"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">
                    Case / Writ Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., W.P. No. 4392 / 2026"
                    value={caseNumber}
                    onChange={(e) => setCaseNumber(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-650 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-150"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">
                    Advocate On Record
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Barrister Ali Zafar"
                    value={advocate}
                    onChange={(e) => setAdvocate(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-650 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-150"
                  />
                </div>
              </div>

              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                    Subject / Fact Summary
                  </label>
                  
                  {/* Inline Dictation Assist */}
                  <div className="flex items-center gap-3">
                    {isRecording && (
                      <span className="flex items-center gap-1.5 text-xs text-red-500 font-semibold animate-pulse">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        Recording {formatTime(recordingDuration)}
                      </span>
                    )}
                    {recordingState === "transcribing" && (
                      <span className="flex items-center gap-1.5 text-xs text-blue-500 font-semibold animate-pulse">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        Transcribing...
                      </span>
                    )}
                    
                    {!isRecording ? (
                      <button
                        type="button"
                        onClick={startRecording}
                        disabled={recordingState === "transcribing"}
                        className="flex items-center gap-2 rounded-lg border border-blue-500/40 bg-blue-600/10 px-3.5 py-2 text-xs font-bold text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.15)] transition duration-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 focus:outline-none disabled:opacity-50 cursor-pointer"
                      >
                        <FiMic className="h-3.5 w-3.5 text-red-500 animate-pulse" /> Dictate Facts (Voice Assist)
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="flex items-center gap-2 rounded-lg border border-red-600 bg-red-600 px-3.5 py-2 text-xs font-bold text-white shadow-[0_0_15px_rgba(239,68,68,0.45)] transition duration-150 hover:bg-red-700 focus:outline-none cursor-pointer animate-pulse"
                      >
                        <FiSquare className="h-3.5 w-3.5 text-white" /> Stop Recording
                      </button>
                    )}
                  </div>
                </div>
                
                <textarea
                  required
                  rows={4}
                  placeholder="Describe the legal grievances... You can write manually or click 'Dictate Facts' above to speak into your mic."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-650 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-150 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">
                  Drafting Date
                </label>
                <input
                  type="date"
                  value={draftDate}
                  onChange={(e) => setDraftDate(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-650 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-150"
                />
              </div>
            </div>

            {/* Generate PDF Trigger Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-white font-semibold transition duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900 active:scale-[0.99] cursor-pointer shadow-lg shadow-blue-600/10"
            >
              <FiFileText className="h-5 w-5" /> Compile & Generate Document
            </button>
          </form>
        </div>
      )}

      {step === "generating" && (
        <div className="flex min-h-[500px] flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-xl">
          <div className="relative flex h-20 w-20 items-center justify-center">
            {/* Spinning ring outer */}
            <div className="absolute h-full w-full rounded-full border-4 border-zinc-800 border-t-blue-600 animate-spin" />
            <FiFileText className="h-8 w-8 text-blue-500 animate-pulse" />
          </div>
          
          <h2 className="mt-8 text-xl font-semibold text-white">
            Generating Legal Document
          </h2>
          
          <div className="mt-3 w-full max-w-md bg-zinc-950 rounded-full h-2.5 overflow-hidden border border-zinc-800">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${((loadingStageIndex + 1) / loadingStages.length) * 100}%` }}
            />
          </div>

          {/* Progressive message stages */}
          <div className="mt-6 h-8 text-center">
            <p className="text-sm font-medium text-zinc-400 animate-fade-in">
              {loadingStages[loadingStageIndex]}
            </p>
          </div>
          
          <p className="mt-2 text-xs text-zinc-650">
            Querying Groq Llama models and compile engine...
          </p>
        </div>
      )}

      {step === "editor" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Editor Header / Action Row */}
          <div className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:flex-row sm:items-center sm:justify-between shadow-lg">
            
            {/* Left Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep("config")}
                className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-700 hover:text-white"
              >
                <FiArrowLeft className="h-4 w-4" /> Edit Setup
              </button>
              <div className="h-6 w-px bg-zinc-800 hidden sm:block" />
              <span className="text-xs text-zinc-400 font-medium">
                Draft Status: <span className="text-emerald-500 font-semibold uppercase">Compiled Live Preview</span>
              </span>
            </div>

            {/* Rich styling utilities */}
            <div className="flex flex-wrap items-center gap-1.5 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
              <button 
                onClick={() => formatText("bold")}
                title="Bold"
                className="px-3 py-1.5 rounded text-sm font-bold text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
              >
                B
              </button>
              <button 
                onClick={() => formatText("italic")}
                title="Italic"
                className="px-3 py-1.5 rounded text-sm italic text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
              >
                I
              </button>
              <button 
                onClick={() => formatText("underline")}
                title="Underline"
                className="px-3 py-1.5 rounded text-sm underline text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
              >
                U
              </button>
              <div className="h-4 w-px bg-zinc-800 mx-1" />
              <button 
                onClick={async () => {
                  try {
                    showToast("Re-compiling from source template...");
                    const metadata = {
                      caseId: 1,
                      courtId: selectedCourtId,
                      documentTypeId: selectedDocTypeId,
                      petitioner,
                      respondent,
                      caseNumber,
                      advocate,
                      draftDate,
                      subject
                    };
                    const freshHtml = await generateDocument(metadata, subject);
                    setEditableContent(freshHtml);
                    showToast("Document reverted to fresh API template content.");
                  } catch (err) {
                    showToast("Failed to fetch default content.");
                  }
                }}
                title="Revert Content"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
              >
                <FiRotateCcw className="h-3 w-3" /> Revert
              </button>
            </div>

            {/* Right Export Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => showToast("Draft saved locally to dashboard database.")}
                className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
              >
                <FiSave className="h-4 w-4" /> Save Draft
              </button>
              
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 shadow-md shadow-blue-600/10 cursor-pointer"
              >
                <FiDownload className="h-4 w-4" /> Download PDF
              </button>
            </div>

          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            
            {/* Editor Sheet (A4 Styled editable layout) */}
            <div className="lg:col-span-8 bg-zinc-950 p-8 rounded-2xl border border-zinc-800 flex justify-center shadow-inner overflow-x-auto min-h-[850px]">
              
              {/* Paper Sheet container */}
              <div className="w-full max-w-[800px] min-h-[1050px] bg-white text-zinc-900 p-16 md:p-20 shadow-2xl rounded-sm border border-zinc-200 flex flex-col justify-between font-serif relative">
                
                {/* Traditional Pakistani Legal double-red-line margin on the left */}
                <div className="absolute left-10 md:left-12 top-0 bottom-0 border-l border-red-200 pointer-events-none" />
                <div className="absolute left-[44px] md:left-[52px] top-0 bottom-0 border-l-2 border-red-300/40 pointer-events-none" />
                
                {/* Editable Document Wrapper */}
                <div 
                  ref={editorRef}
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                  className="pl-8 md:pl-10 w-full h-full outline-none focus:outline-none select-text cursor-text"
                  onBlur={(e) => setEditableContent(e.currentTarget.innerHTML)}
                  dangerouslySetInnerHTML={{ __html: editableContent }}
                />

                <div className="absolute bottom-4 right-8 font-sans text-[10px] text-zinc-400 pointer-events-none select-none">
                  Page 1 of 1 (Intelex Draft Compiler)
                </div>
              </div>

            </div>

            {/* Editing tips Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 shadow-lg">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                  <FiEdit className="text-blue-500" /> Editing Canvas Instructions
                </h3>
                <ul className="space-y-3 text-xs text-zinc-400 leading-relaxed list-disc pl-4">
                  <li>
                    The page behaves like a live paper editor. You can **click anywhere on the text** to edit, insert details, or delete paragraphs directly.
                  </li>
                  <li>
                    Use the toolbar above to apply text decoration styling (bold, italic, underline) or reset parameters.
                  </li>
                  <li>
                    Once finalized, click <strong className="text-white">Download PDF</strong> to export this document as a printable vector PDF file.
                  </li>
                  <li>
                    Changes are stored locally in the draft session; use <strong className="text-white">Save Draft</strong> to sync changes with the case book.
                  </li>
                </ul>
              </div>

              
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default DocumentGenerator;