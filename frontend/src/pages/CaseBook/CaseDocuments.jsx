import { useEffect, useRef, useState } from "react";
import { FiPaperclip, FiUpload, FiTrash2, FiFileText } from "react-icons/fi";
import {
  getCaseDocuments,
  uploadCaseDocument,
  deleteCaseDocument,
  viewCaseDocument,
} from "../../services/caseService";

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function CaseDocuments({ caseId }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadDocuments();
  }, [caseId]);

  async function loadDocuments() {
    try {
      setLoading(true);
      const docs = await getCaseDocuments(caseId);
      setDocuments(docs);
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      return;
    }

    setError("");
    setUploading(true);
    try {
      const doc = await uploadCaseDocument(caseId, file);
      setDocuments((prev) => [doc, ...prev]);
    } catch (err) {
      setError(err.response?.data?.error || "Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(docId) {
    if (!window.confirm("Delete this document?")) return;
    try {
      setDeletingId(docId);
      await deleteCaseDocument(docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err) {
      console.error("Failed to delete document:", err);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mt-4 border-t pt-4" style={{ borderColor: "#1e2d3d" }}>
      <div className="mb-2 flex items-center justify-between">
        <span
          className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.12em]"
          style={{ color: "#4d6070" }}
        >
          <FiPaperclip size={12} /> Documents
        </span>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1 text-[11px] font-medium transition disabled:opacity-50"
          style={{ color: "#c9a84c" }}
        >
          <FiUpload size={11} />
          {uploading ? "Uploading..." : "Upload PDF"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {error && (
        <p className="mb-2 text-[11px]" style={{ color: "#e05555" }}>
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-[11px]" style={{ color: "#4d6070" }}>Loading...</p>
      ) : documents.length === 0 ? (
        <p className="text-[11px]" style={{ color: "#4d6070" }}>
          No documents attached yet.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-[11px]"
              style={{ backgroundColor: "#0a1420", borderColor: "#1e2d3d" }}
            >
              <button
                onClick={() => viewCaseDocument(doc.id)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left transition"
                style={{ color: "#8a9baa" }}
              >
                <FiFileText size={13} className="shrink-0" style={{ color: "#4d6070" }} />
                <span className="truncate">{doc.filename}</span>
                <span className="shrink-0" style={{ color: "#4d6070" }}>
                  ({formatSize(doc.file_size)})
                </span>
              </button>

              <button
                onClick={() => handleDelete(doc.id)}
                disabled={deletingId === doc.id}
                className="shrink-0 transition disabled:opacity-50"
                style={{ color: "#4d6070" }}
              >
                <FiTrash2 size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CaseDocuments;