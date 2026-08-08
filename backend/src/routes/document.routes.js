
import { Router } from "express";
import upload from "../middleware/upload.middleware.js";
import {
  getCaseDocuments,
  uploadCaseDocument,
  downloadCaseDocument,
  deleteCaseDocument,
} from "../controllers/document.controller.js";

import { generateDocument } from "../controllers/document.controller.js";
const router = Router();
// Document generation route
router.post("/generate", generateDocument);

// Nested under /api/cases/:caseId/documents
router.get("/cases/:caseId/documents", getCaseDocuments);
router.post("/cases/:caseId/documents", upload.single("file"), uploadCaseDocument);

// Standalone by document id
router.get("/documents/:id", downloadCaseDocument);
router.delete("/documents/:id", deleteCaseDocument);

export default router;

