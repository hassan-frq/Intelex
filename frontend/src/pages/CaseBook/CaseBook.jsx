import { useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiFolder } from "react-icons/fi";
import {
  getCases,
  createCase,
  updateCase,
  deleteCase,
} from "../../services/caseService";
import Button from "../../components/common/Button/Button";
import Input from "../../components/common/Input/Input";
import Modal from "../../components/common/Modal/Modal";
import Loader from "../../components/common/Loader/Loader";

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "closed", label: "Closed" },
];

const STATUS_STYLES = {
  open: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  in_progress: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  closed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
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
      date: caseItem.date || "",
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Case Book</h1>
        <p className="mt-2 whitespace-nowrap text-zinc-400">
          Manage and track all your cases in one place.
        </p>
      </div>

      {loading ? (
        <Loader />
      ) : cases.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-700 p-12 text-center">
          <FiFolder className="mx-auto mb-4 text-zinc-600" size={40} />
          <h3 className="text-lg font-medium text-white">No cases yet</h3>
          <p className="mt-1 text-zinc-400">
            Create your first case to get started.
          </p>
          <button
            onClick={openCreateModal}
            className="mx-auto mt-5 flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <FiPlus size={16} /> New Case
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cases.map((caseItem) => (
            <div
              key={caseItem.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-zinc-700"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-white">
                  {caseItem.title}
                </h3>
                <span
                  className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${
                    STATUS_STYLES[caseItem.status]
                  }`}
                >
                  {STATUS_OPTIONS.find((s) => s.value === caseItem.status)?.label}
                </span>
              </div>

              <p className="mt-2 text-sm text-zinc-400">{caseItem.client}</p>

              <div className="mt-4 space-y-1 text-sm text-zinc-500">
                {caseItem.court && <p>Court: {caseItem.court}</p>}
                {caseItem.case_number && <p>Case #: {caseItem.case_number}</p>}
                {caseItem.date && <p>Date: {caseItem.date}</p>}
              </div>

              {caseItem.description && (
                <p className="mt-4 line-clamp-2 text-sm text-zinc-400">
                  {caseItem.description}
                </p>
              )}

              <div className="mt-5 flex gap-2 border-t border-zinc-800 pt-4">
                <button
                  onClick={() => openEditModal(caseItem)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-800 py-2 text-sm text-white transition hover:border-blue-500"
                >
                  <FiEdit2 size={14} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(caseItem.id)}
                  disabled={deletingId === caseItem.id}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-800 py-2 text-sm text-red-400 transition hover:border-red-500 disabled:opacity-50"
                >
                  <FiTrash2 size={14} />
                  {deletingId === caseItem.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {cases.length > 0 && (
        <button
          onClick={openCreateModal}
          title="New Case"
          className="fixed bottom-8 right-8 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 transition hover:scale-105 hover:bg-blue-700"
        >
          <FiPlus size={24} />
        </button>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingCase ? "Edit Case" : "New Case"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Case Title"
            placeholder="e.g. State vs. Ali"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <Input
            label="Client"
            placeholder="e.g. Ahmed Khan"
            value={form.client}
            onChange={(e) => setForm({ ...form, client: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Court"
              placeholder="e.g. Lahore High Court"
              value={form.court}
              onChange={(e) => setForm({ ...form, court: e.target.value })}
            />
            <Input
              label="Case Number"
              placeholder="e.g. WP-1234-2026"
              value={form.caseNumber}
              onChange={(e) =>
                setForm({ ...form, caseNumber: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="mb-1 block text-sm font-medium text-zinc-300">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>

          <div className="space-y-3">
            <label className="mb-1 block text-sm font-medium text-zinc-300">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Brief summary of the case..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {formError && <p className="text-sm text-red-400">{formError}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 rounded-xl border border-zinc-700 py-3 text-zinc-300 transition hover:bg-zinc-800"
            >
              Cancel
            </button>
            <Button type="submit" className="flex-1">
              {submitting
                ? "Saving..."
                : editingCase
                ? "Save Changes"
                : "Create Case"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default CaseBook;