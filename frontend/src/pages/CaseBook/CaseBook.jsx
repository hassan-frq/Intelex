import { useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiFolder } from "react-icons/fi";
import {
  getCases,
  createCase,
  updateCase,
  deleteCase,
} from "../../services/caseService";
import CaseDocuments from "./CaseDocuments";

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "closed", label: "Closed" },
];

const STATUS_STYLES = {
  open: {
    backgroundColor: "rgba(201, 168, 76, 0.08)",
    borderColor: "rgba(201, 168, 76, 0.2)",
    color: "#c9a84c",
  },
  in_progress: {
    backgroundColor: "#162030",
    borderColor: "#1e2d3d",
    color: "#8a9baa",
  },
  closed: {
    backgroundColor: "rgba(76, 175, 130, 0.08)",
    borderColor: "rgba(76, 175, 130, 0.3)",
    color: "#4caf82",
  },
};

const EMPTY_FORM = {
  title: "",
  client: "",
  court: "",
  caseNumber: "",
  status: "open",
  description: "",
  date: "",
};

const inputStyle = {
  backgroundColor: "#0a1420",
  borderColor: "#1e2d3d",
  color: "#8a9baa",
};

const labelClass =
  "mb-1.5 block text-[10px] font-medium uppercase tracking-[0.1em]";

function CaseBook() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadCases();
  }, []);

  async function loadCases() {
    try {
      setLoading(true);
      const data = await getCases();
      setCases(data);
    } catch (err) {
      console.error("Failed to load cases:", err);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingCase(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  }

  function openEditModal(caseItem) {
    setEditingCase(caseItem);
    setForm({
      title: caseItem.title,
      client: caseItem.client,
      court: caseItem.court || "",
      caseNumber: caseItem.case_number || "",
      status: caseItem.status,
      description: caseItem.description || "",
      date: caseItem.date ? String(caseItem.date).slice(0, 10) : "",
    });
    setFormError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingCase(null);
    setForm(EMPTY_FORM);
    setFormError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    if (!form.title.trim() || !form.client.trim()) {
      setFormError("Title and client are required.");
      return;
    }

    try {
      setSubmitting(true);
      if (editingCase) {
        const updated = await updateCase(editingCase.id, form);
        setCases((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        );
      } else {
        const created = await createCase(form);
        setCases((prev) => [created, ...prev]);
      }
      closeModal();
    } catch (err) {
      setFormError(
        err.response?.data?.error || "Something went wrong. Try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this case? This cannot be undone.")) return;

    try {
      setDeletingId(id);
      await deleteCase(id);
      setCases((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Failed to delete case:", err);
      alert("Failed to delete case. Try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="mb-3">
        <span
          className="text-[10px] font-medium uppercase tracking-[0.15em]"
          style={{ color: "#c9a84c" }}
        >
          Case Law
        </span>
        <h1 className="mt-1 text-[22px] font-semibold" style={{ color: "#e8e0d0" }}>
          Case Book
        </h1>
        <p className="mt-1 text-[13px]" style={{ color: "#4d6070" }}>
          Manage and track all your cases in one place.
        </p>
      </div>

      {loading ? (
        <p className="text-[13px]" style={{ color: "#4d6070" }}>Loading...</p>
      ) : cases.length === 0 ? (
        <div
          className="rounded-xl border border-dashed p-12 text-center"
          style={{ borderColor: "#1e2d3d" }}
        >
          <FiFolder className="mx-auto mb-4" size={36} style={{ color: "#2d4a5e" }} />
          <h3 className="text-base font-medium" style={{ color: "#e8e0d0" }}>
            No cases yet
          </h3>
          <p className="mt-1 text-[13px]" style={{ color: "#4d6070" }}>
            Create your first case to get started.
          </p>
          <button
            onClick={openCreateModal}
            className="mx-auto mt-5 flex items-center gap-2 rounded-lg border px-4 py-2 text-[13px] font-medium transition"
            style={{
              backgroundColor: "rgba(201, 168, 76, 0.08)",
              borderColor: "rgba(201, 168, 76, 0.2)",
              color: "#c9a84c",
            }}
          >
            <FiPlus size={15} /> New Case
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cases.map((caseItem) => (
            <div
              key={caseItem.id}
              className="rounded-xl border p-5 transition"
              style={{ backgroundColor: "#111c27", borderColor: "#1e2d3d" }}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-[15px] font-semibold" style={{ color: "#e8e0d0" }}>
                  {caseItem.title}
                </h3>
                <span
                  className="shrink-0 rounded-[20px] border px-3 py-1 text-[11px] font-medium"
                  style={STATUS_STYLES[caseItem.status]}
                >
                  {STATUS_OPTIONS.find((s) => s.value === caseItem.status)?.label}
                </span>
              </div>

              <p className="mt-2 text-[13px]" style={{ color: "#8a9baa" }}>
                {caseItem.client}
              </p>

              <div className="mt-4 space-y-1 text-[12px]" style={{ color: "#4d6070" }}>
                {caseItem.court && <p>Court: {caseItem.court}</p>}
                {caseItem.case_number && <p>Case #: {caseItem.case_number}</p>}
                {caseItem.date && (
                  <p>
                    Date:{" "}
                    {new Date(caseItem.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
              </div>

              {caseItem.description && (
                <p className="mt-4 line-clamp-2 text-[13px]" style={{ color: "#8a9baa" }}>
                  {caseItem.description}
                </p>
              )}

              <div className="mt-5 flex gap-2 border-t pt-4" style={{ borderColor: "#1e2d3d" }}>
                <button
                  onClick={() => openEditModal(caseItem)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border py-2 text-[12px] font-medium transition"
                  style={{ backgroundColor: "#162030", borderColor: "#1e2d3d", color: "#8a9baa" }}
                >
                  <FiEdit2 size={13} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(caseItem.id)}
                  disabled={deletingId === caseItem.id}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border py-2 text-[12px] font-medium transition disabled:opacity-50"
                  style={{ backgroundColor: "#162030", borderColor: "#1e2d3d", color: "#e05555" }}
                >
                  <FiTrash2 size={13} />
                  {deletingId === caseItem.id ? "Deleting..." : "Delete"}
                </button>
              </div>

              <CaseDocuments caseId={caseItem.id} />
            </div>
          ))}
        </div>
      )}

      {cases.length > 0 && (
        <button
          onClick={openCreateModal}
          title="New Case"
          className="fixed bottom-8 right-8 flex h-14 w-14 items-center justify-center rounded-full border shadow-lg transition hover:scale-105"
          style={{
            backgroundColor: "#111c27",
            borderColor: "rgba(201, 168, 76, 0.3)",
            color: "#c9a84c",
          }}
        >
          <FiPlus size={22} />
        </button>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={closeModal}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border p-6 shadow-2xl"
            style={{ backgroundColor: "#111c27", borderColor: "#1e2d3d" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-5 text-[16px] font-semibold" style={{ color: "#e8e0d0" }}>
              {editingCase ? "Edit Case" : "New Case"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelClass} style={{ color: "#4d6070" }}>
                  Case Title
                </label>
                <input
                  placeholder="e.g. State vs. Ali"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-lg border px-4 py-2.5 text-[13px] focus:outline-none"
                  style={inputStyle}
                />
              </div>

              <div>
                <label className={labelClass} style={{ color: "#4d6070" }}>
                  Client
                </label>
                <input
                  placeholder="e.g. Ahmed Khan"
                  value={form.client}
                  onChange={(e) => setForm({ ...form, client: e.target.value })}
                  className="w-full rounded-lg border px-4 py-2.5 text-[13px] focus:outline-none"
                  style={inputStyle}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass} style={{ color: "#4d6070" }}>
                    Court
                  </label>
                  <input
                    placeholder="e.g. Lahore High Court"
                    value={form.court}
                    onChange={(e) => setForm({ ...form, court: e.target.value })}
                    className="w-full rounded-lg border px-4 py-2.5 text-[13px] focus:outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelClass} style={{ color: "#4d6070" }}>
                    Case Number
                  </label>
                  <input
                    placeholder="e.g. WP-1234-2026"
                    value={form.caseNumber}
                    onChange={(e) => setForm({ ...form, caseNumber: e.target.value })}
                    className="w-full rounded-lg border px-4 py-2.5 text-[13px] focus:outline-none"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass} style={{ color: "#4d6070" }}>
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full rounded-lg border px-4 py-2.5 text-[13px] focus:outline-none"
                    style={inputStyle}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass} style={{ color: "#4d6070" }}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full rounded-lg border px-4 py-2.5 text-[13px] focus:outline-none"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass} style={{ color: "#4d6070" }}>
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of the case..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-lg border px-4 py-2.5 text-[13px] focus:outline-none"
                  style={inputStyle}
                />
              </div>

              {formError && (
                <p className="text-[12px]" style={{ color: "#e05555" }}>{formError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-lg border py-2.5 text-[13px] font-medium transition"
                  style={{ backgroundColor: "#162030", borderColor: "#1e2d3d", color: "#8a9baa" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-lg border py-2.5 text-[13px] font-medium transition disabled:opacity-60"
                  style={{
                    backgroundColor: "rgba(201, 168, 76, 0.08)",
                    borderColor: "rgba(201, 168, 76, 0.2)",
                    color: "#c9a84c",
                  }}
                >
                  {submitting
                    ? "Saving..."
                    : editingCase
                    ? "Save Changes"
                    : "Create Case"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CaseBook;