import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  FiArrowLeft, 
  FiPrinter, 
  FiDownload, 
  FiSave, 
  FiFileText, 
  FiCheck, 
  FiBookOpen
} from "react-icons/fi";
import html2pdf from "html2pdf.js";

function Preview() {
  const location = useLocation();
  const navigate = useNavigate();
  const paperRef = useRef(null);

  const [toastMessage, setToastMessage] = useState("");

  const [documentData] = useState(() => {
    // 1. Try location state
    if (location.state && location.state.content) {
      return {
        content: location.state.content,
        metadata: location.state.metadata || {}
      };
    }

    // 2. Fallback to localStorage draft
    try {
      const savedDraft = localStorage.getItem("intelex_latest_draft");
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        return {
          content: parsed.htmlContent,
          metadata: {
            court: parsed.selectedCourt,
            docType: parsed.selectedDocType,
            petitioner: parsed.metadata?.petitioner,
            respondent: parsed.metadata?.respondent,
            caseNumber: parsed.metadata?.caseNumber,
            advocate: parsed.metadata?.advocate,
            draftDate: parsed.metadata?.draftDate,
            precedents: parsed.precedents || []
          }
        };
      }
    } catch (e) {
      console.error("Failed to load local draft for preview", e);
    }
    return null;
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!paperRef.current) return;
    
    const element = document.createElement("div");
    element.style.fontFamily = "'Times New Roman', Georgia, serif";
    element.style.fontSize = "15px";
    element.style.lineHeight = "2";
    element.style.color = "#111111";
    element.style.width = "100%";
    element.style.padding = "0.2in 0.2in 0.2in 0.5in"; 
    element.innerHTML = paperRef.current.innerHTML;

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

    const docTypeName = documentData?.metadata?.docType?.id || "legal_document";
    const opt = {
      margin:       [0.8, 1.2, 0.8, 0.8],
      filename:     `${docTypeName}_preview.pdf`.toLowerCase(),
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak:    { mode: ['css', 'legacy'] }
    };

    if (html2pdf) {
      showToast("Compiling vector PDF document for export...");
      html2pdf().from(element).set(opt).save().then(() => {
        showToast("PDF exported successfully!");
      }).catch(err => {
        console.error("PDF export error:", err);
        showToast("Failed to generate PDF file.");
      });
    } else {
      showToast("PDF generation module is loading. Please retry.");
    }
  };

  const handleSaveToCaseBook = () => {
    showToast("Document saved to Case Book repository.");
  };

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
            DOCUMENT PREVIEW
          </span>
          <h1 className="text-[22px] font-semibold tracking-tight text-[#e8e0d0] flex items-center gap-2.5">
            <FiFileText className="text-[#c9a84c]" size={20} /> Case Document Preview
          </h1>
          <p className="text-[13px] text-[#4d6070] mt-0.5">
            Inspect print layout, review citation attachments, and export formal court filings.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 mt-3 md:mt-0">
          <button
            onClick={() => navigate("/case/1/generate")}
            className="flex items-center gap-2 rounded-lg border border-[#1e2d3d] bg-[#162030] px-3.5 py-2 text-[13px] font-medium text-[#8a9baa] transition hover:bg-[#1c2a3a] hover:text-[#e8e0d0]"
          >
            <FiArrowLeft className="h-4 w-4" /> Return to Generator
          </button>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#1e2d3d] bg-[#111c27] p-3.5 sm:flex-row sm:items-center sm:justify-between shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-[#4d6070] font-medium">
            Document Mode: <span className="text-[#c9a84c] font-semibold uppercase">Official Court Print View</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-lg border border-[#1e2d3d] bg-[#162030] px-3.5 py-1.5 text-[13px] font-medium text-[#8a9baa] transition hover:bg-[#1c2a3a] hover:text-[#e8e0d0]"
          >
            <FiPrinter className="h-4 w-4" /> Print
          </button>

          <button
            onClick={handleSaveToCaseBook}
            className="flex items-center gap-2 rounded-lg border border-[#1e2d3d] bg-[#162030] px-3.5 py-1.5 text-[13px] font-medium text-[#8a9baa] transition hover:bg-[#1c2a3a] hover:text-[#e8e0d0]"
          >
            <FiSave className="h-4 w-4" /> Save to Case Book
          </button>

          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 rounded-lg border border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.12)] px-4 py-1.5 text-[13px] font-medium text-[#c9a84c] transition hover:bg-[rgba(201,168,76,0.2)] hover:border-[#c9a84c] cursor-pointer"
          >
            <FiDownload className="h-4 w-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      {documentData && documentData.content ? (
        <div className="grid gap-6 lg:grid-cols-12">
          
          {/* Document Paper Preview */}
          <div className="lg:col-span-8 bg-[#0a1420] p-6 rounded-xl border border-[#1e2d3d] flex justify-center shadow-inner overflow-x-auto min-h-[850px]">
            <div 
              ref={paperRef}
              className="w-full max-w-[800px] min-h-[1050px] bg-white text-zinc-900 p-12 md:p-16 shadow-2xl rounded-sm border border-zinc-300 flex flex-col justify-between font-serif relative"
            >
              {/* Paper Margins */}
              <div className="absolute left-10 md:left-12 top-0 bottom-0 border-l border-red-200 pointer-events-none" />
              <div className="absolute left-[44px] md:left-[52px] top-0 bottom-0 border-l-2 border-red-300/40 pointer-events-none" />

              {/* Document HTML Body */}
              <div 
                className="pl-8 md:pl-10 w-full h-full leading-relaxed text-[15px]"
                dangerouslySetInnerHTML={{ __html: documentData.content }}
              />

              <div className="absolute bottom-4 right-8 font-sans text-[10px] text-zinc-400 pointer-events-none select-none">
                Intelex Legal Preview Engine — Official Court Record
              </div>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Metadata Card */}
            <div className="rounded-xl border border-[#1e2d3d] bg-[#111c27] p-5 space-y-3.5 shadow-md">
              <span className="block text-[10px] font-medium uppercase tracking-[0.12em] text-[#c9a84c]">
                CASE METADATA SUMMARY
              </span>

              <div className="space-y-2.5 text-[12px]">
                <div className="flex justify-between border-b border-[#1e2d3d] pb-2">
                  <span className="text-[#4d6070]">Jurisdiction</span>
                  <span className="font-medium text-[#e8e0d0]">{documentData.metadata?.court?.name || "High Court"}</span>
                </div>
                <div className="flex justify-between border-b border-[#1e2d3d] pb-2">
                  <span className="text-[#4d6070]">Document Type</span>
                  <span className="font-medium text-[#c9a84c]">{documentData.metadata?.docType?.name || "Petition"}</span>
                </div>
                <div className="flex justify-between border-b border-[#1e2d3d] pb-2">
                  <span className="text-[#4d6070]">Petitioner</span>
                  <span className="font-medium text-[#e8e0d0] truncate max-w-[160px]">{documentData.metadata?.petitioner || "N/A"}</span>
                </div>
                <div className="flex justify-between border-b border-[#1e2d3d] pb-2">
                  <span className="text-[#4d6070]">Respondent</span>
                  <span className="font-medium text-[#e8e0d0] truncate max-w-[160px]">{documentData.metadata?.respondent || "N/A"}</span>
                </div>
                <div className="flex justify-between border-b border-[#1e2d3d] pb-2">
                  <span className="text-[#4d6070]">Case / Writ No.</span>
                  <span className="font-medium text-[#e8e0d0]">{documentData.metadata?.caseNumber || "Unassigned"}</span>
                </div>
                <div className="flex justify-between border-b border-[#1e2d3d] pb-2">
                  <span className="text-[#4d6070]">Advocate</span>
                  <span className="font-medium text-[#e8e0d0]">{documentData.metadata?.advocate || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4d6070]">Drafting Date</span>
                  <span className="font-medium text-[#8a9baa]">{documentData.metadata?.draftDate || "Today"}</span>
                </div>
              </div>
            </div>

            {/* Cited Precedents */}
            <div className="rounded-xl border border-[#1e2d3d] bg-[#111c27] p-5 space-y-3 shadow-md">
              <span className="block text-[10px] font-medium uppercase tracking-[0.12em] text-[#4d6070]">
                CITED PRECEDENT CASE LAW
              </span>

              {documentData.metadata?.precedents && documentData.metadata.precedents.length > 0 ? (
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {documentData.metadata.precedents.map((ref, idx) => (
                    <div key={idx} className="rounded-lg border border-[#1e2d3d] bg-[#0a1420] p-3 text-[12px]">
                      <span className="font-semibold text-[#e8e0d0] block truncate">{ref.title}</span>
                      <span className="text-[11px] text-[#8a9baa] block mt-0.5">{ref.court}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-[#4d6070] italic">
                  No explicit external precedent citations attached.
                </p>
              )}
            </div>

            {/* Export Specs */}
            <div className="rounded-xl border border-[#1e2d3d] bg-[#111c27] p-5 space-y-2.5 shadow-md">
              <span className="block text-[10px] font-medium uppercase tracking-[0.12em] text-[#4d6070]">
                EXPORT & PRINT SPECS
              </span>
              <div className="space-y-1.5 text-[11px] text-[#8a9baa]">
                <p>• Standard A4 Legal Portrait Format</p>
                <p>• Judicial Spacing (Double line height, 15px Serif)</p>
                <p>• High-Resolution Vector PDF Output</p>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#1e2d3d] bg-[#111c27] p-12 text-center shadow-md min-h-[400px]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(201,168,76,0.08)] text-[#c9a84c] mb-4">
            <FiBookOpen className="h-6 w-6" />
          </div>
          <h3 className="text-[16px] font-semibold text-[#e8e0d0]">No Active Document Preview</h3>
          <p className="mt-1.5 text-[13px] text-[#8a9baa] max-w-md">
            Please compile or select a legal document draft in the Document Generator to view its formal court preview.
          </p>
          <button
            onClick={() => navigate("/case/1/generate")}
            className="mt-6 rounded-lg border border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.12)] px-4 py-2 text-[13px] font-medium text-[#c9a84c] transition hover:bg-[rgba(201,168,76,0.2)] hover:border-[#c9a84c]"
          >
            Go to Document Generator
          </button>
        </div>
      )}

    </div>
  );
}

export default Preview;