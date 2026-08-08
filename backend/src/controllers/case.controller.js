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

export async function getCases(req, res) {
  try {
    const cases = await listCases(req.user.id);
    res.json({ cases });
  } catch (err) {
    handleError(err, res);
  }
}

export async function getCaseById(req, res) {
  try {
    const id = Number(req.params.id);
    const caseItem = await getCase(id, req.user.id);
    res.json({ case: caseItem });
  } catch (err) {
    handleError(err, res);
  }
}

export async function createCase(req, res) {
  try {
    const caseItem = await addCase(req.user.id, req.body);
    res.status(201).json({ case: caseItem });
  } catch (err) {
    handleError(err, res);
  }
}

export async function updateCase(req, res) {
  try {
    const id = Number(req.params.id);
    const caseItem = await editCase(id, req.user.id, req.body);
    res.json({ case: caseItem });
  } catch (err) {
    handleError(err, res);
  }
}

export async function deleteCase(req, res) {
  try {
    const id = Number(req.params.id);
    await removeCase(id, req.user.id);
    res.status(204).send();
  } catch (err) {
    handleError(err, res);
  }
}