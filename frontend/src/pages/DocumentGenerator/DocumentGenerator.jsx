import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  FiMic,
  FiSquare,
  FiEye
} from "react-icons/fi";
import { transcribeAudio } from "../../services/speechService";
import { generateDocument, searchReferences, generateWithCitations } from "../../services/documentService";
import html2pdf from "html2pdf.js";

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

const CHUNK_DURATION_MS = 5000;

const DYNAMIC_FIELDS_CONFIG = {
  civil: [
    { key: "suitValue", label: "Value of Suit", placeholder: "e.g., PKR 5,000,000", type: "text" },
    { key: "courtFee", label: "Court Fee Affixed/Paid", placeholder: "e.g., PKR 15,000", type: "text" },
    { key: "impugnedCourt", label: "Impugned Court/Tribunal", placeholder: "e.g., District Judge, Lahore", type: "text" },
    { key: "impugnedOrderDate", label: "Impugned Order/Decree Date", placeholder: "", type: "date" },
  ],
  corporate: [
    { key: "companyName", label: "Company Name", placeholder: "e.g., Apex Industries (Pvt) Ltd", type: "text" },
    { key: "cuin", label: "CUIN Number", placeholder: "e.g., 0043219", type: "text" },
    { key: "authorizedCapital", label: "Authorized Capital", placeholder: "e.g., PKR 10,000,000", type: "text" },
    { key: "paidUpCapital", label: "Paid-up Capital", placeholder: "e.g., PKR 1,000,000", type: "text" },
    { key: "registeredAddress", label: "Registered Office Address", placeholder: "e.g., 45-Main Boulevard, Gulberg, Lahore", type: "text", fullWidth: true },
  ],
  criminal: [
    { key: "firNo", label: "FIR Number", placeholder: "e.g., 412/2026", type: "text" },
    { key: "firDate", label: "Date of FIR Registration", placeholder: "", type: "date" },
    { key: "offense", label: "Offenses (PPC Sections)", placeholder: "e.g., Section 324/34 PPC", type: "text" },
    { key: "policeStation", label: "Police Station", placeholder: "e.g., PS Anarkali, Lahore", type: "text" },
  ],
  commercial: [
    { key: "principalAmount", label: "Principal Amount", placeholder: "e.g., PKR 25,000,000", type: "text" },
    { key: "interestMarkup", label: "Interest / Markup", placeholder: "e.g., 18% per annum", type: "text" },
    { key: "totalClaim", label: "Total Claim Amount", placeholder: "e.g., PKR 29,500,000", type: "text" },
  ],
  tax: [
    { key: "taxYear", label: "Tax Year", placeholder: "e.g., 2025", type: "text" },
    { key: "assessedIncome", label: "Assessed Income", placeholder: "e.g., PKR 12,000,000", type: "text" },
    { key: "disputedTax", label: "Disputed Tax Demand", placeholder: "e.g., PKR 3,500,050", type: "text" },
    { key: "tribunalOrderDate", label: "Date of Tribunal Order", placeholder: "", type: "date" },
  ],
  appellate: [
    { key: "impugnedCourt", label: "Challenged (Impugned) Court", placeholder: "e.g., Lahore High Court", type: "text" },
    { key: "impugnedOrderDate", label: "Date of Impugned Judgment", placeholder: "", type: "date" },
  ],
  review: [
    { key: "impugnedCourt", label: "Challenged (Impugned) Court", placeholder: "e.g., Supreme Court of Pakistan", type: "text" },
    { key: "impugnedOrderDate", label: "Date of Judgment to Review", placeholder: "", type: "date" },
  ],
  transfer: [
    { key: "impugnedCourt", label: "Source High Court", placeholder: "e.g., High Court of Sindh", type: "text" },
  ],
  contempt: [
    { key: "impugnedOrderDate", label: "Violated Order Date", placeholder: "", type: "date" },
  ]
};

function DocumentGenerator() {
  const navigate = useNavigate();
  
  const [step, setStep] = useState("config"); // 'config' | 'generating' | 'curation' | 'editor'
  const [loadingPhase, setLoadingPhase] = useState("searching"); // 'searching' | 'drafting'
  const [extractedKeywords, setExtractedKeywords] = useState([]);
  const [scrapedPrecedents, setScrapedPrecedents] = useState([]);
  const [selectedPrecedentIndices, setSelectedPrecedentIndices] = useState({}); // { 0: true, 1: true }
  
  const [selectedCourtId, setSelectedCourtId] = useState(COURTS[0].id);
  const [selectedDocTypeId, setSelectedDocTypeId] = useState(COURT_DOCUMENT_TYPES[COURTS[0].id][0].id);
  
  // Metadata fields
  const [petitioner, setPetitioner] = useState("");
  const [respondent, setRespondent] = useState("");
  const [caseNumber, setCaseNumber] = useState("");
  const [subject, setSubject] = useState("");
  const [advocate, setAdvocate] = useState("");
  const [draftDate, setDraftDate] = useState(new Date().toISOString().split("T")[0]);
  
  const [extraMetadata, setExtraMetadata] = useState({});

  const handleExtraMetadataChange = (key, val) => {
    setExtraMetadata(prev => ({
      ...prev,
      [key]: val
    }));
  };
  
  const handleSelectCourt = (courtId) => {
    setSelectedCourtId(courtId);
    const validTypes = COURT_DOCUMENT_TYPES[courtId] || [];
    if (validTypes.length > 0 && !validTypes.some(t => t.id === selectedDocTypeId)) {
      setSelectedDocTypeId(validTypes[0].id);
    }
    setExtraMetadata({});
  };

  const handleSelectDocType = (docTypeId) => {
    setSelectedDocTypeId(docTypeId);
    setExtraMetadata({});
  };

  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingState, setRecordingState] = useState("idle"); // 'idle' | 'recording' | 'transcribing' | 'success' | 'error'
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const streamRef = useRef(null);
  const isRecordingRef = useRef(false);
  const transcriptsMapRef = useRef({});

  // Generation loading states
  const [loadingStageIndex, setLoadingStageIndex] = useState(0);
  
  const searchingStages = [
    "Analyzing case details and metadata...",
    "Invoking legal keyword extraction...",
    "Warming up Google Scholar session...",
    "Querying precedents for the target court...",
    "Parsing case links, snippets, and citations..."
  ];

  const draftingStages = [
    "Crawling full text pages of selected cases...",
    "Filtering excerpts using Llama pre-filter...",
    "Injecting case-law citations into Groq prompt...",
    "Drafting formal facts, grounds, and prayers...",
    "Compiling document into clean court formats..."
  ];

  const currentLoadingStages = loadingPhase === "searching" ? searchingStages : draftingStages;

  // Text Editor editable state
  const [editableContent, setEditableContent] = useState("");
  const editorRef = useRef(null);
  
  // Toast notification state
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

  const recordChunk = (stream, seq) => {
    if (!isRecordingRef.current) return;

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

      if (isRecordingRef.current) {
        recordChunk(stream, seq + 1);
      } else {
        stream.getTracks().forEach((track) => track.stop());
      }

      // Transcription in background
      try {
        setRecordingState("transcribing");
        const transcriptText = await transcribeAudio(audioBlob);
        if (transcriptText && transcriptText.trim()) {
          transcriptsMapRef.current[seq] = transcriptText.trim();

          const sortedSeqs = Object.keys(transcriptsMapRef.current)
            .map(Number)
            .sort((a, b) => a - b);
          const orderedTexts = sortedSeqs.map((s) => transcriptsMapRef.current[s]);
          
          setSubject(orderedTexts.join(" "));
          setRecordingState("success");
        } else {
          setRecordingState("success");
        }
      } catch (err) {
        console.error(`Transcription failed for chunk ${seq}:`, err);
        setRecordingState("error");
      }
    };

    mediaRecorder.start();

    setTimeout(() => {
      if (mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }
    }, CHUNK_DURATION_MS);
  };

  // Audio Capture Start
  const startRecording = async () => {
    transcriptsMapRef.current = {};
    setRecordingState("idle");
    setRecordingDuration(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      isRecordingRef.current = true;
      setIsRecording(true);
      setRecordingState("recording");
      showToast("Dictation started. Speak into your microphone.");

      recordChunk(stream, 0);
    } catch (err) {
      console.error("Failed to access microphone:", err);
      showToast("Microphone access denied. Check your browser permissions.");
    }
  };

  // Audio Capture Stop
  const stopRecording = () => {
    isRecordingRef.current = false;
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    showToast("Dictation stopped. Finalizing transcription...");
  };

  // Phase 1: Search references and keywords
  const handleStartSearch = async (e) => {
    e.preventDefault();
    setStep("generating");
    setLoadingPhase("searching");
    setLoadingStageIndex(0);

    const loadingTimer = setInterval(() => {
      setLoadingStageIndex(prev => {
        if (prev < searchingStages.length - 1) return prev + 1;
        return prev;
      });
    }, 2000);

    try {
      console.log("Starting reference search...");
      const data = await searchReferences(selectedCourtId, subject);
      clearInterval(loadingTimer);

      setExtractedKeywords(data.keywords || []);
      setScrapedPrecedents(data.results || []);

      // Auto-select the first 3 precedents if available
      const initialSelections = {};
      if (data.results && Array.isArray(data.results)) {
        data.results.forEach((_, idx) => {
          if (idx < 3) {
            initialSelections[idx] = true;
          }
        });
      }
      setSelectedPrecedentIndices(initialSelections);

      if (!data.results || data.results.length === 0) {
        showToast("No relevant precedents found on Google Scholar. Proceeding with standard draft.");
        await handleDraftDirectly(subject);
      } else {
        setStep("curation");
        showToast("Google Scholar case search completed successfully!");
      }
    } catch (err) {
      clearInterval(loadingTimer);
      console.error("Reference search failed:", err);
      showToast("Searching references failed or timed out. Proceeding to draft directly.");
      await handleDraftDirectly(subject);
    }
  };

  // Phase 2: Generate draft document using user-selected citations
  const handleDraftWithCitations = async () => {
    setStep("generating");
    setLoadingPhase("drafting");
    setLoadingStageIndex(0);

    const loadingTimer = setInterval(() => {
      setLoadingStageIndex(prev => {
        if (prev < draftingStages.length - 1) return prev + 1;
        return prev;
      });
    }, 2500);

    try {
      const selectedList = scrapedPrecedents.filter((_, idx) => selectedPrecedentIndices[idx]);
      const metadata = {
        caseId: 1,
        courtId: selectedCourtId,
        documentTypeId: selectedDocTypeId,
        petitioner,
        respondent,
        caseNumber,
        advocate,
        draftDate,
        subject,
        extraMetadata
      };

      console.log(`Generating draft with ${selectedList.length} references...`);
      const htmlContent = await generateWithCitations(metadata, subject, selectedList);
      
      clearInterval(loadingTimer);
      setEditableContent(htmlContent);
      setStep("editor");
      saveDraftToLocalStorage(htmlContent, metadata, selectedList);
      showToast("Legal document drafted successfully with citations.");
    } catch (err) {
      clearInterval(loadingTimer);
      console.error("Generation with citations failed:", err);
      showToast("Failed to compile with citations. Attempting fallback generation...");
      await handleDraftDirectly(subject);
    }
  };

  // Fallback / Direct Drafting without references
  const handleDraftDirectly = async (inputSubject) => {
    setStep("generating");
    setLoadingPhase("drafting");
    setLoadingStageIndex(0);

    const loadingTimer = setInterval(() => {
      setLoadingStageIndex(prev => {
        if (prev < draftingStages.length - 1) return prev + 1;
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
        subject: inputSubject || subject,
        extraMetadata
      };

      const htmlContent = await generateDocument(metadata, inputSubject || subject);
      
      clearInterval(loadingTimer);
      setEditableContent(htmlContent);
      setStep("editor");
      saveDraftToLocalStorage(htmlContent, metadata, []);
      showToast("Document generated successfully.");
    } catch (err) {
      clearInterval(loadingTimer);
      console.error("Direct compilation failed:", err);
      setStep("config");
      showToast(`Error compiling document: ${err.response?.data?.error || err.message}`);
    }
  };

  const saveDraftToLocalStorage = (htmlContent, metadata, precedents = []) => {
    try {
      const draftObj = {
        htmlContent: htmlContent || editableContent,
        metadata: metadata || {
          courtId: selectedCourtId,
          documentTypeId: selectedDocTypeId,
          petitioner,
          respondent,
          caseNumber,
          advocate,
          draftDate,
          subject,
          extraMetadata
        },
        selectedCourt,
        selectedDocType,
        precedents: precedents.length > 0 ? precedents : scrapedPrecedents.filter((_, i) => selectedPrecedentIndices[i]),
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem("intelex_latest_draft", JSON.stringify(draftObj));
    } catch (e) {
      console.error("Could not save draft to local storage", e);
    }
  };

  const navigateToPreview = () => {
    saveDraftToLocalStorage(editableContent, null, []);
    navigate("/case/1/preview", {
      state: {
        content: editableContent,
        metadata: {
          court: selectedCourt,
          docType: selectedDocType,
          petitioner,
          respondent,
          caseNumber,
          advocate,
          draftDate,
          subject,
          extraMetadata,
          precedents: scrapedPrecedents.filter((_, i) => selectedPrecedentIndices[i])
        }
      }
    });
  };

  // Format Recording Duration time
  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleDownload = () => {
    const content = editorRef.current ? editorRef.current.innerHTML : editableContent;
    
    const element = document.createElement("div");
    
    element.style.fontFamily = "'Times New Roman', Georgia, serif";
    element.style.fontSize = "15px";
    element.style.lineHeight = "2";
    element.style.color = "#111111";
    element.style.width = "100%";
    element.style.padding = "0.2in 0.2in 0.2in 0.5in"; 
    element.innerHTML = content;

    const style = document.createElement("style");
    style.innerHTML = `
      p, li, tr, th, td, h1, h2, h3, h4, h5, h6, table, blockquote, 
      .party-block, .party-row, .versus-row, 
      .court-header, .court-jurisdiction, .case-number, 
      .subject-title, .salutation, .section-title, .footer-block, .legal-block {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
    `;
    element.appendChild(style);
    
    const opt = {
      margin:       [0.8, 1.2, 0.8, 0.8],
      filename:     `${selectedDocType.id}_supreme_court.pdf`.toLowerCase(),
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak:    { mode: ['css', 'legacy'] }
    };
    
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

  // Text Editor formatting wrapper
  const formatText = (command) => {
    document.execCommand(command, false, null);
    if (editorRef.current) {
      setEditableContent(editorRef.current.innerHTML);
    }
  };

  // Stepper Visual Data
  const stepperSteps = [
    { id: "config", label: "1. Case Setup" },
    { id: "searching", label: "2. Scholar Search" },
    { id: "curation", label: "3. Precedent Curation" },
    { id: "editor", label: "4. Live Draft Editor" }
  ];

  const getActiveStepIndex = () => {
    if (step === "config") return 0;
    if (step === "generating" && loadingPhase === "searching") return 1;
    if (step === "curation") return 2;
    if (step === "generating" && loadingPhase === "drafting") return 3;
    if (step === "editor") return 3;
    return 0;
  };

  const currentActiveIndex = getActiveStepIndex();

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg border border-[#1e2d3d] bg-[#111c27] px-4 py-3 text-[#e8e0d0] shadow-2xl transition duration-300">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-[rgba(201,168,76,0.12)] text-[#c9a84c]">
            <FiCheck className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[13px] font-medium">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Signature Page Header */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between border-b border-[#1e2d3d] pb-4">
        <div>
          <span className="block text-[10px] font-medium uppercase tracking-[0.15em] text-[#c9a84c] mb-1">
            DOCUMENT GENERATION
          </span>
          <h1 className="text-[22px] font-semibold tracking-tight text-[#e8e0d0] flex items-center gap-2.5">
            <FiFileText className="text-[#c9a84c]" size={20} /> Document Generator
          </h1>
          <p className="text-[13px] text-[#4d6070] mt-0.5">
            Configure case parameters, curate precedent case law citations, and draft formal court petitions.
          </p>
        </div>

        {step === "editor" && (
          <div className="flex items-center gap-2 mt-3 md:mt-0">
            <button
              onClick={navigateToPreview}
              className="flex items-center gap-2 rounded-lg border border-[#1e2d3d] bg-[#162030] px-3.5 py-2 text-[13px] font-medium text-[#e8e0d0] transition hover:bg-[#1c2a3a] hover:border-[rgba(201,168,76,0.3)] hover:text-[#c9a84c]"
            >
              <FiEye className="h-4 w-4" /> Full Preview & Print
            </button>
          </div>
        )}
      </div>

      {/* Visual Stepper Progress Bar */}
      <div className="rounded-xl border border-[#1e2d3d] bg-[#111c27] p-3.5 shadow-sm">
        <div className="flex items-center justify-between gap-2 overflow-x-auto">
          {stepperSteps.map((s, idx) => {
            const isActive = idx === currentActiveIndex;
            const isCompleted = idx < currentActiveIndex;

            return (
              <div key={s.id} className="flex flex-1 items-center gap-2 min-w-[140px]">
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg text-[12px] font-semibold border transition ${
                  isActive
                    ? "border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.12)] text-[#c9a84c]"
                    : isCompleted
                    ? "border-[rgba(76,175,130,0.3)] bg-[rgba(76,175,130,0.08)] text-[#4caf82]"
                    : "border-[#1e2d3d] bg-[#0a1420] text-[#4d6070]"
                }`}>
                  {isCompleted ? <FiCheck className="h-3.5 w-3.5" /> : idx + 1}
                </div>
                <span className={`text-[12px] font-medium truncate ${
                  isActive ? "text-[#c9a84c]" : isCompleted ? "text-[#e8e0d0]" : "text-[#4d6070]"
                }`}>
                  {s.label.split(". ")[1]}
                </span>
                {idx < stepperSteps.length - 1 && (
                  <div className={`h-0.5 flex-1 rounded transition hidden sm:block ${
                    idx < currentActiveIndex ? "bg-[#4caf82]/40" : "bg-[#1e2d3d]"
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: CONFIGURATION & CASE DATA */}
      {step === "config" && (
        <div className="max-w-4xl mx-auto space-y-6">
          <form onSubmit={handleStartSearch} className="space-y-6 rounded-xl border border-[#1e2d3d] bg-[#111c27] p-6 shadow-md">
            
            {/* Section 1: Court Selection */}
            <div>
              <span className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-[#4d6070]">
                1. Target Jurisdiction (Court)
              </span>
              <div className="grid gap-3 sm:grid-cols-3">
                {COURTS.map((court) => {
                  const isSelected = selectedCourtId === court.id;
                  return (
                    <button
                      key={court.id}
                      type="button"
                      onClick={() => handleSelectCourt(court.id)}
                      className={`relative flex flex-col justify-between rounded-lg border p-4 text-left transition focus:outline-none ${
                        isSelected
                          ? "border-[rgba(201,168,76,0.4)] bg-[rgba(201,168,76,0.08)] text-[#e8e0d0]"
                          : "border-[#1e2d3d] bg-[#0a1420] text-[#8a9baa] hover:border-[rgba(201,168,76,0.2)] hover:bg-[#162030]"
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className={`text-[10px] font-medium uppercase px-2 py-0.5 rounded ${
                          isSelected ? "bg-[rgba(201,168,76,0.2)] text-[#c9a84c]" : "bg-[#162030] text-[#4d6070]"
                        }`}>
                          {court.city}
                        </span>
                        {isSelected && (
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#c9a84c] text-[#0f1923] text-[10px]">
                            <FiCheck className="h-3 w-3 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <span className="mt-3 block font-semibold text-[13px] text-[#e8e0d0]">
                        {court.shortName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Document Type */}
            <div>
              <span className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-[#4d6070]">
                2. Document Classification
              </span>
              <div className="grid gap-3 sm:grid-cols-3">
                {currentDocTypes.map((docType) => {
                  const isSelected = selectedDocTypeId === docType.id;
                  return (
                    <button
                      key={docType.id}
                      type="button"
                      onClick={() => handleSelectDocType(docType.id)}
                      className={`relative flex flex-col text-left rounded-lg border p-3.5 transition focus:outline-none ${
                        isSelected
                          ? "border-[rgba(201,168,76,0.4)] bg-[rgba(201,168,76,0.08)] text-[#e8e0d0]"
                          : "border-[#1e2d3d] bg-[#0a1420] text-[#8a9baa] hover:border-[rgba(201,168,76,0.2)] hover:bg-[#162030]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-[13px] text-[#e8e0d0]">{docType.name}</span>
                        {isSelected && (
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#c9a84c] text-[#0f1923] text-[10px]">
                            <FiCheck className="h-3 w-3 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#8a9baa] leading-relaxed">
                        {docType.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <hr className="border-[#1e2d3d]" />

            {/* Section 3: Case Data */}
            <div className="space-y-4">
              <span className="block text-[10px] font-medium uppercase tracking-[0.12em] text-[#4d6070]">
                3. Case Data & Metadata
              </span>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a9baa]">
                    Petitioner Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Mian Muhammad Nawaz"
                    value={petitioner}
                    onChange={(e) => setPetitioner(e.target.value)}
                    className="w-full rounded-lg border border-[#1e2d3d] bg-[#0a1420] px-3.5 py-2.5 text-[13px] text-[#e8e0d0] placeholder-[#2d4a5e] focus:border-[#c9a84c] focus:outline-none focus:ring-1 focus:ring-[#c9a84c] transition"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a9baa]">
                    Respondent Name(s)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Federation of Pakistan"
                    value={respondent}
                    onChange={(e) => setRespondent(e.target.value)}
                    className="w-full rounded-lg border border-[#1e2d3d] bg-[#0a1420] px-3.5 py-2.5 text-[13px] text-[#e8e0d0] placeholder-[#2d4a5e] focus:border-[#c9a84c] focus:outline-none focus:ring-1 focus:ring-[#c9a84c] transition"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a9baa]">
                    Advocate On Record
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Barrister Ali Zafar"
                    value={advocate}
                    onChange={(e) => setAdvocate(e.target.value)}
                    className="w-full rounded-lg border border-[#1e2d3d] bg-[#0a1420] px-3.5 py-2.5 text-[13px] text-[#e8e0d0] placeholder-[#2d4a5e] focus:border-[#c9a84c] focus:outline-none focus:ring-1 focus:ring-[#c9a84c] transition"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a9baa]">
                    Case / Writ Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., W.P. No. 1245 / 2026"
                    value={caseNumber}
                    onChange={(e) => setCaseNumber(e.target.value)}
                    className="w-full rounded-lg border border-[#1e2d3d] bg-[#0a1420] px-3.5 py-2.5 text-[13px] text-[#e8e0d0] placeholder-[#2d4a5e] focus:border-[#c9a84c] focus:outline-none focus:ring-1 focus:ring-[#c9a84c] transition"
                  />
                </div>
              </div>

              {/* Dynamic Case Data Fields Section */}
              {DYNAMIC_FIELDS_CONFIG[selectedDocTypeId] && DYNAMIC_FIELDS_CONFIG[selectedDocTypeId].length > 0 && (
                <div className="rounded-lg border border-[#1e2d3d] bg-[#0a1420] p-4 space-y-3">
                  <div className="flex items-center gap-2 border-b border-[#1e2d3d] pb-2">
                    <span className="h-2 w-2 rounded-full bg-[#c9a84c] animate-pulse" />
                    <span className="text-[10px] font-medium text-[#c9a84c] uppercase tracking-[0.1em]">
                      {selectedDocType.name} Specific Parameters
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {DYNAMIC_FIELDS_CONFIG[selectedDocTypeId].map((field) => (
                      <div key={field.key} className={field.fullWidth ? "sm:col-span-2" : ""}>
                        <label className="mb-1 block text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a9baa]">
                          {field.label}
                        </label>
                        <input
                          type={field.type}
                          required
                          placeholder={field.placeholder}
                          value={extraMetadata[field.key] || ""}
                          onChange={(e) => handleExtraMetadataChange(field.key, e.target.value)}
                          className="w-full rounded-lg border border-[#1e2d3d] bg-[#111c27] px-3 py-2 text-[13px] text-[#e8e0d0] placeholder-[#2d4a5e] focus:border-[#c9a84c] focus:outline-none focus:ring-1 focus:ring-[#c9a84c] transition"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1.5">
                  <label className="block text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a9baa]">
                    Case Facts & Legal Dispute (AI Auto-Generates Legal Caption)
                  </label>
                  
                  {/* Voice Assist Bar */}
                  <div className="flex items-center gap-3">
                    {isRecording && (
                      <span className="flex items-center gap-1.5 text-[11px] text-[#e05555] font-medium animate-pulse">
                        <span className="h-2 w-2 rounded-full bg-[#e05555]" />
                        Recording {formatTime(recordingDuration)}
                      </span>
                    )}
                    {recordingState === "transcribing" && (
                      <span className="flex items-center gap-1.5 text-[11px] text-[#c9a84c] font-medium animate-pulse">
                        <span className="h-2 w-2 rounded-full bg-[#c9a84c]" />
                        Transcribing voice...
                      </span>
                    )}
                    
                    {!isRecording ? (
                      <button
                        type="button"
                        onClick={startRecording}
                        disabled={recordingState === "transcribing"}
                        className="flex items-center gap-2 rounded-lg border border-[rgba(201,168,76,0.25)] bg-[rgba(201,168,76,0.1)] px-3 py-1.5 text-[12px] font-medium text-[#c9a84c] transition hover:bg-[rgba(201,168,76,0.18)] hover:border-[#c9a84c] disabled:opacity-50 cursor-pointer"
                      >
                        <FiMic className="h-3.5 w-3.5 text-[#e05555] animate-pulse" /> Dictate Facts (Voice Assist)
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="flex items-center gap-2 rounded-lg border border-[#e05555] bg-[rgba(224,85,85,0.15)] px-3 py-1.5 text-[12px] font-medium text-[#e05555] transition hover:bg-[rgba(224,85,85,0.25)] cursor-pointer"
                      >
                        <FiSquare className="h-3.5 w-3.5" /> Stop Recording
                      </button>
                    )}
                  </div>
                </div>
                
                <textarea
                  required
                  rows={4}
                  placeholder="Describe the facts of your dispute or dictate via microphone (e.g., Petitioner was serving as Associate Professor and terminated without show-cause notice on 10-01-2026...). The system will generate a precise court legal caption automatically."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-lg border border-[#1e2d3d] bg-[#0a1420] px-3.5 py-2.5 text-[13px] text-[#e8e0d0] placeholder-[#2d4a5e] focus:border-[#c9a84c] focus:outline-none focus:ring-1 focus:ring-[#c9a84c] transition resize-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a9baa]">
                  Drafting Date
                </label>
                <input
                  type="date"
                  value={draftDate}
                  onChange={(e) => setDraftDate(e.target.value)}
                  className="w-full rounded-lg border border-[#1e2d3d] bg-[#0a1420] px-3.5 py-2.5 text-[13px] text-[#e8e0d0] focus:border-[#c9a84c] focus:outline-none focus:ring-1 focus:ring-[#c9a84c] transition"
                />
              </div>
            </div>

            {/* Generate Trigger Primary Action Button (Gold Tint per Design Spec) */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.12)] px-5 py-3 text-[13px] font-medium text-[#c9a84c] transition hover:bg-[rgba(201,168,76,0.2)] hover:border-[#c9a84c] cursor-pointer"
            >
              <FiFileText className="h-4 w-4" /> Compile & Generate Document
            </button>
          </form>
        </div>
      )}

      {/* STEP 2: PRECEDENT CASE LAW CURATION */}
      {step === "curation" && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="rounded-xl border border-[#1e2d3d] bg-[#111c27] p-6 shadow-md space-y-5">
            
            {/* Header info */}
            <div className="border-b border-[#1e2d3d] pb-4">
              <span className="block text-[10px] font-medium uppercase tracking-[0.12em] text-[#c9a84c] mb-1">
                PRECEDENT CASE LAW CURATION
              </span>
              <h2 className="text-[18px] font-semibold text-[#e8e0d0] flex items-center gap-2">
                <FiBookOpen className="text-[#c9a84c]" /> Scraped Google Scholar Precedents
              </h2>
              <p className="text-[12px] text-[#8a9baa] mt-1">
                Select which scraped precedents should be passed as legal citations to guide the factual and grounds drafting engine.
              </p>
            </div>

            {/* Keyword tags */}
            {extractedKeywords.length > 0 && (
              <div className="space-y-2">
                <span className="block text-[10px] font-medium uppercase tracking-[0.12em] text-[#4d6070]">
                  Extracted Legal Keywords
                </span>
                <div className="flex flex-wrap gap-2">
                  {extractedKeywords.map((kw, i) => (
                    <span 
                      key={i} 
                      className="inline-flex items-center rounded-full bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.2)] px-3 py-1 text-[12px] font-medium text-[#c9a84c]"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Precedents checklist */}
            <div className="space-y-3">
              <span className="block text-[10px] font-medium uppercase tracking-[0.12em] text-[#4d6070]">
                Google Scholar Case Results
              </span>

              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {scrapedPrecedents.map((ref, idx) => {
                  const isSelected = !!selectedPrecedentIndices[idx];
                  return (
                    <div 
                      key={idx}
                      onClick={() => {
                        setSelectedPrecedentIndices(prev => ({
                          ...prev,
                          [idx]: !prev[idx]
                        }));
                      }}
                      className={`group flex items-start gap-3.5 rounded-lg border p-4 text-left transition cursor-pointer ${
                        isSelected
                          ? "border-[rgba(201,168,76,0.4)] bg-[rgba(201,168,76,0.08)] text-[#e8e0d0]"
                          : "border-[#1e2d3d] bg-[#0a1420] text-[#8a9baa] hover:border-[rgba(201,168,76,0.2)] hover:bg-[#162030]"
                      }`}
                    >
                      {/* Custom Gold Checkbox */}
                      <div className="flex h-5 items-center pt-0.5">
                        <div className={`flex h-4 w-4 items-center justify-center rounded border transition ${
                          isSelected 
                            ? "bg-[#c9a84c] border-[#c9a84c] text-[#0f1923]" 
                            : "border-[#1e2d3d] bg-[#0a1420]"
                        }`}>
                          {isSelected && <FiCheck className="h-3 w-3 stroke-[3]" />}
                        </div>
                      </div>

                      {/* Case details */}
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-semibold text-[13px] text-[#e8e0d0] group-hover:text-[#c9a84c] transition">
                            {ref.title}
                          </span>
                          {ref.link && (
                            <a 
                              href={ref.link} 
                              target="_blank" 
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-[11px] text-[#c9a84c] hover:underline inline-flex items-center gap-1"
                            >
                              Source <FiFile className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 text-[11px] text-[#8a9baa]">
                          <span>{ref.court}</span>
                          {ref.citedBy && (
                            <span className="rounded bg-[#162030] px-2 py-0.5 text-[#4d6070] font-medium border border-[#1e2d3d]">
                              Cited by {ref.citedBy}
                            </span>
                          )}
                        </div>

                        {ref.snippet && (
                          <p className="text-[12px] text-[#8a9baa] leading-relaxed italic bg-[#0a1420] p-2.5 rounded border border-[#1e2d3d]">
                            "{ref.snippet}"
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stepper Wizard Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 border-t border-[#1e2d3d] pt-4">
              <button
                type="button"
                onClick={() => setStep("config")}
                className="flex-1 rounded-lg border border-[#1e2d3d] bg-[#162030] px-4 py-2.5 text-[13px] font-medium text-[#8a9baa] transition hover:bg-[#1c2a3a] hover:text-[#e8e0d0]"
              >
                Back to Setup
              </button>

              <button
                type="button"
                onClick={() => handleDraftDirectly(subject)}
                className="flex-1 rounded-lg border border-[#1e2d3d] bg-[#162030] px-4 py-2.5 text-[13px] font-medium text-[#8a9baa] transition hover:bg-[#1c2a3a] hover:text-[#e8e0d0]"
              >
                Skip Citations
              </button>

              <button
                type="button"
                onClick={handleDraftWithCitations}
                className="flex-[2] rounded-lg border border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.12)] px-4 py-2.5 text-[13px] font-medium text-[#c9a84c] transition hover:bg-[rgba(201,168,76,0.2)] hover:border-[#c9a84c] flex items-center justify-center gap-2 cursor-pointer"
              >
                <FiCheck className="h-4 w-4" /> Compile with Citations
              </button>
            </div>

          </div>
        </div>
      )}

      {/* STEP LOADING: SEARCHING & DRAFTING */}
      {step === "generating" && (
        <div className="flex min-h-[450px] flex-col items-center justify-center rounded-xl border border-[#1e2d3d] bg-[#111c27] p-8 shadow-md">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <div className="absolute h-full w-full rounded-full border-2 border-[#1e2d3d] border-t-[#c9a84c] animate-spin" />
            <FiFileText className="h-6 w-6 text-[#c9a84c] animate-pulse" />
          </div>
          
          <h2 className="mt-6 text-[18px] font-semibold text-[#e8e0d0]">
            {loadingPhase === "searching" ? "Searching Case Law Precedents" : "Compiling Formal Legal Document"}
          </h2>
          
          <div className="mt-4 w-full max-w-md bg-[#0a1420] rounded-full h-2 overflow-hidden border border-[#1e2d3d]">
            <div 
              className="bg-[#c9a84c] h-full rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${((loadingStageIndex + 1) / currentLoadingStages.length) * 100}%` }}
            />
          </div>

          {/* Progressive message stages */}
          <div className="mt-5 h-6 text-center">
            <p className="text-[13px] font-medium text-[#8a9baa]">
              {currentLoadingStages[loadingStageIndex]}
            </p>
          </div>
          
          <p className="mt-2 text-[11px] text-[#2d4a5e]">
            {loadingPhase === "searching" ? "Executing live Google Scholar web scraper..." : "Executing Groq legal drafting engine..."}
          </p>
        </div>
      )}

      {/* STEP 3: LIVE EDITOR & PAPER CANVAS */}
      {step === "editor" && (
        <div className="space-y-6">
          
          {/* Editor Header / Toolbar */}
          <div className="flex flex-col gap-3 rounded-xl border border-[#1e2d3d] bg-[#111c27] p-3.5 sm:flex-row sm:items-center sm:justify-between shadow-md">
            
            {/* Left Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep("config")}
                className="flex items-center gap-2 rounded-lg border border-[#1e2d3d] bg-[#162030] px-3 py-1.5 text-[13px] font-medium text-[#8a9baa] transition hover:bg-[#1c2a3a] hover:text-[#e8e0d0]"
              >
                <FiArrowLeft className="h-3.5 w-3.5" /> Edit Setup
              </button>
              <div className="h-5 w-px bg-[#1e2d3d] hidden sm:block" />
              <span className="text-[12px] text-[#4d6070] font-medium">
                Status: <span className="text-[#4caf82] font-semibold uppercase">Compiled Live Preview</span>
              </span>
            </div>

            {/* Rich styling utilities */}
            <div className="flex flex-wrap items-center gap-1 bg-[#0a1420] p-1 rounded-lg border border-[#1e2d3d]">
              <button 
                onClick={() => formatText("bold")}
                title="Bold"
                className="px-2.5 py-1 rounded text-[12px] font-bold text-[#8a9baa] hover:bg-[#162030] hover:text-[#e8e0d0] transition"
              >
                B
              </button>
              <button 
                onClick={() => formatText("italic")}
                title="Italic"
                className="px-2.5 py-1 rounded text-[12px] italic text-[#8a9baa] hover:bg-[#162030] hover:text-[#e8e0d0] transition"
              >
                I
              </button>
              <button 
                onClick={() => formatText("underline")}
                title="Underline"
                className="px-2.5 py-1 rounded text-[12px] underline text-[#8a9baa] hover:bg-[#162030] hover:text-[#e8e0d0] transition"
              >
                U
              </button>
              <div className="h-4 w-px bg-[#1e2d3d] mx-1" />
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
                      subject,
                      extraMetadata
                    };
                    const freshHtml = await generateDocument(metadata, subject);
                    setEditableContent(freshHtml);
                    showToast("Document reverted to fresh template content.");
                  } catch (_err) {
                    showToast("Failed to fetch default content.");
                  }
                }}
                title="Revert Content"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] text-[#8a9baa] hover:bg-[#162030] hover:text-[#e8e0d0] transition"
              >
                <FiRotateCcw className="h-3 w-3" /> Revert
              </button>
            </div>

            {/* Right Export Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  saveDraftToLocalStorage(editableContent, null, []);
                  showToast("Draft saved locally to session database.");
                }}
                className="flex items-center gap-2 rounded-lg border border-[#1e2d3d] bg-[#162030] px-3.5 py-1.5 text-[13px] font-medium text-[#8a9baa] transition hover:bg-[#1c2a3a] hover:text-[#e8e0d0]"
              >
                <FiSave className="h-3.5 w-3.5" /> Save Draft
              </button>
              
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 rounded-lg border border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.12)] px-3.5 py-1.5 text-[13px] font-medium text-[#c9a84c] transition hover:bg-[rgba(201,168,76,0.2)] hover:border-[#c9a84c] cursor-pointer"
              >
                <FiDownload className="h-3.5 w-3.5" /> Download PDF
              </button>
            </div>

          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            
            {/* Main Canvas Area */}
            <div className="lg:col-span-8 bg-[#0a1420] p-6 rounded-xl border border-[#1e2d3d] flex justify-center shadow-inner overflow-x-auto min-h-[800px]">
              
              <div className="w-full max-w-[800px] min-h-[1000px] bg-white text-zinc-900 p-12 md:p-16 shadow-2xl rounded-sm border border-zinc-300 flex flex-col justify-between font-serif relative">
                
                <div className="absolute left-10 md:left-12 top-0 bottom-0 border-l border-red-200 pointer-events-none" />
                <div className="absolute left-[44px] md:left-[52px] top-0 bottom-0 border-l-2 border-red-300/40 pointer-events-none" />
                
                <div 
                  ref={editorRef}
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                  className="pl-8 md:pl-10 w-full h-full outline-none focus:outline-none select-text cursor-text leading-relaxed text-[15px]"
                  onBlur={(e) => setEditableContent(e.currentTarget.innerHTML)}
                  dangerouslySetInnerHTML={{ __html: editableContent }}
                />

                <div className="absolute bottom-4 right-8 font-sans text-[10px] text-zinc-400 pointer-events-none select-none">
                  Intelex Legal Draft Engine — Page 1 of 1
                </div>
              </div>

            </div>

            {/* Side Panel: Instructions & Meta */}
            <div className="lg:col-span-4 space-y-5">
              <div className="rounded-xl border border-[#1e2d3d] bg-[#111c27] p-5 space-y-3.5 shadow-md">
                <span className="block text-[10px] font-medium uppercase tracking-[0.12em] text-[#c9a84c]">
                  EDITING CANVAS GUIDE
                </span>
                <h3 className="text-[14px] font-semibold text-[#e8e0d0] flex items-center gap-2">
                  <FiEdit className="text-[#c9a84c]" /> Live Paper Canvas
                </h3>
                <ul className="space-y-2.5 text-[12px] text-[#8a9baa] leading-relaxed list-disc pl-4">
                  <li>
                    Click anywhere on the document canvas to edit facts, grounds, or prayer statements directly.
                  </li>
                  <li>
                    Use formatting tools on top (Bold, Italic, Underline) to apply text styles.
                  </li>
                  <li>
                    Click <strong className="text-[#e8e0d0]">Full Preview & Print</strong> to open a print-ready view with full metadata summary.
                  </li>
                  <li>
                    Click <strong className="text-[#c9a84c]">Download PDF</strong> to export as a vector PDF.
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border border-[#1e2d3d] bg-[#111c27] p-5 space-y-3 shadow-md">
                <span className="block text-[10px] font-medium uppercase tracking-[0.12em] text-[#4d6070]">
                  CASE PARAMETERS
                </span>
                <div className="space-y-2 text-[12px]">
                  <div className="flex justify-between border-b border-[#1e2d3d] pb-1.5">
                    <span className="text-[#4d6070]">Jurisdiction</span>
                    <span className="font-medium text-[#e8e0d0]">{selectedCourt.shortName}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#1e2d3d] pb-1.5">
                    <span className="text-[#4d6070]">Document Type</span>
                    <span className="font-medium text-[#c9a84c]">{selectedDocType.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#1e2d3d] pb-1.5">
                    <span className="text-[#4d6070]">Petitioner</span>
                    <span className="font-medium text-[#e8e0d0] truncate max-w-[150px]">{petitioner || "N/A"}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#1e2d3d] pb-1.5">
                    <span className="text-[#4d6070]">Respondent</span>
                    <span className="font-medium text-[#e8e0d0] truncate max-w-[150px]">{respondent || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4d6070]">Advocate</span>
                    <span className="font-medium text-[#e8e0d0] truncate max-w-[150px]">{advocate || "N/A"}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default DocumentGenerator;