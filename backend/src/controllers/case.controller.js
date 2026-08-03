import {
  listCases,
  getCase,
  addCase,
  editCase,
  removeCase,
  ValidationError,
  NotFoundError,
} from "../services/case.service.js";

function handleError(err, res) {
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message });
  }
  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: err.message });
  }
  console.error("Case controller error:", err);
  return res.status(500).json({ error: "Something went wrong." });
}

export function getCases(req, res) {
  try {
    const cases = listCases(req.user.id);
    res.json({ cases });
  } catch (err) {
    handleError(err, res);
  }
}

export function getCaseById(req, res) {
  try {
    const id = Number(req.params.id);
    const caseItem = getCase(id, req.user.id);
    res.json({ case: caseItem });
  } catch (err) {
    handleError(err, res);
  }
}

export function createCase(req, res) {
  try {
    const caseItem = addCase(req.user.id, req.body);
    res.status(201).json({ case: caseItem });
  } catch (err) {
    handleError(err, res);
  }
}

export function updateCase(req, res) {
  try {
    const id = Number(req.params.id);
    const caseItem = editCase(id, req.user.id, req.body);
    res.json({ case: caseItem });
  } catch (err) {
    handleError(err, res);
  }
}

export function deleteCase(req, res) {
  try {
    const id = Number(req.params.id);
    removeCase(id, req.user.id);
    res.status(204).send();
  } catch (err) {
    handleError(err, res);
  }
}