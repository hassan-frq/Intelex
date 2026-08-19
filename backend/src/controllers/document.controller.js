
import { 
  draftLegalContentWithGroq, 
  compileTemplate, 
  draftLegalContentWithCitations,
  fetchExcerptFromUrl,
  generateFallbackPrecedents
} from "../services/document.service.js";
import {
  listDocuments,
  addDocument,
  getDocumentForDownload,
  removeDocument,
  ValidationError,
  NotFoundError,
} from "../services/document.service.js";
import { extractKeywordsWithGroq } from "../services/keywords.service.js";
import { scrapeCourtCases } from "../scripts/scrape.js";

export async function generateDocument(req, res) {
  try {
    const { 
      transcript, 
      caseId, 
      courtId,
      documentTypeId, 
      petitioner, 
      respondent, 
      caseNumber, 
      advocate, 
      draftDate,
      subject,
      extraMetadata
    } = req.body;

    if (!transcript || !transcript.trim()) {
      return res.status(400).json({ error: "Transcription text is required to generate a document." });
    }

    if (!petitioner || !respondent) {
      return res.status(400).json({ error: "Petitioner and Respondent names are required." });
    }

    const metadata = {
      courtId,
      documentTypeId: documentTypeId || "petition",
      petitioner,
      respondent,
      caseNumber,
      advocate,
      draftDate,
      subject,
      extraMetadata: extraMetadata || {}
    };

    console.log(`Drafting legal document of type: ${metadata.documentTypeId} for Petitioner: ${metadata.petitioner}`);

    // 1. Call Groq service to generate structural legal content (facts, grounds, prayer)
    const draftData = await draftLegalContentWithGroq(metadata, transcript);

    // 2. Load templates locally and compile HTML
    const htmlContent = await compileTemplate(metadata, draftData);

    // 3. Return compiled HTML
    res.json({ 
      success: true,
      htmlContent 
    });

  } catch (err) {
    console.error("Document generation error:", err);
    res.status(500).json({ error: `Failed to generate document: ${err.message}` });
  }
}

export async function searchReferences(req, res) {
  try {
    const { transcript, courtId } = req.body;
    if (!transcript || !transcript.trim()) {
      return res.status(400).json({ error: "Transcription text is required to search references." });
    }

    // 1. Extract Keywords
    console.log("Extracting keywords for references search...");
    const keywords = await extractKeywordsWithGroq(transcript);
    console.log("Extracted keywords:", keywords);

    if (!keywords || keywords.length === 0) {
      return res.json({ keywords: [], results: [] });
    }

    // 2. Perform Case-Law Search using keywords
    const COURT_NAME_MAP = {
      supreme_court: "Supreme Court of Pakistan",
      lahore_hc: "Lahore High Court",
      islamabad_hc: "Islamabad High Court"
    };
    const courtName = COURT_NAME_MAP[courtId] || "Supreme Court of Pakistan";
    console.log(`Searching cases for Court: ${courtName} using keywords: ${keywords.join(", ")}`);

    // Use top 3 keywords to search on Google Scholar
    const customQueries = {
      [courtName]: keywords.slice(0, 3).map(kw => `"${courtName}" "${kw}"`)
    };

    const options = {
      pagesPerQuery: 1, // keep it fast to avoid timeouts
      minDelayMs: 1500,
      maxDelayMs: 3000,
      headless: true,
      replaceDefaults: true,
      maxRetries: 0 // fail fast if blocked to avoid sleeping for minutes
    };

    let results = [];
    try {
      results = await scrapeCourtCases(customQueries, options);
    } catch (scrapeErr) {
      console.warn("Google Scholar scraper failed/blocked:", scrapeErr.message);
    }
    
    // Deduplicate results by link/url or title to avoid duplicate references
    const seen = new Set();
    let uniqueResults = results.filter(item => {
      const identifier = item.link || item.title;
      if (!identifier || seen.has(identifier)) return false;
      seen.add(identifier);
      return true;
    });
    console.log(`Scraped ${results.length} results from Google Scholar, deduplicated to ${uniqueResults.length}.`);

    // Fallback: If scraper returned nothing or failed, generate realistic precedents via LLM
    if (uniqueResults.length === 0) {
      console.log("No precedents found/scraped. Invoking Groq fallback precedent generator...");
      const fallbackPrecedents = await generateFallbackPrecedents(courtName, keywords, transcript);
      uniqueResults = fallbackPrecedents;
      console.log(`Generated ${uniqueResults.length} fallback precedents via Groq Llama.`);
    }

    res.json({
      keywords,
      results: uniqueResults
    });
  } catch (err) {
    console.error("Search references error:", err);
    res.status(500).json({ error: `Failed to search references: ${err.message}` });
  }
}

export async function generateWithCitations(req, res) {
  try {
    const { transcript, metadata, selectedReferences } = req.body;
    if (!transcript || !transcript.trim()) {
      return res.status(400).json({ error: "Transcription text is required to generate document." });
    }

    // 1. Fetch excerpts for each selected reference in the backend
    console.log(`Fetching excerpts for ${selectedReferences ? selectedReferences.length : 0} selected references...`);
    const referencesWithExcerpts = [];
    if (selectedReferences && Array.isArray(selectedReferences)) {
      for (const ref of selectedReferences) {
        let excerpt = ref.snippet || ""; // default fallback to snippet
        if (ref.link) {
          try {
            const fetched = await fetchExcerptFromUrl(ref.link, transcript);
            if (fetched && fetched.trim()) {
              excerpt = fetched;
            }
          } catch (fetchErr) {
            console.warn(`Failed to scrape link ${ref.link}:`, fetchErr.message);
          }
        }
        referencesWithExcerpts.push({
          title: ref.title,
          link: ref.link,
          excerpt
        });
      }
    }

    // 2. Draft content with citations
    const draftData = await draftLegalContentWithCitations(metadata, transcript, referencesWithExcerpts);

    // 3. Compile template
    const htmlContent = await compileTemplate(metadata, draftData);

    res.json({
      success: true,
      htmlContent
    });
  } catch (err) {
    console.error("Generate with citations error:", err);
    res.status(500).json({ error: `Failed to generate document: ${err.message}` });
  }
}


function handleError(err, res) {
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message });
  }
  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: err.message });
  }
  console.error("Document controller error:", err);
  return res.status(500).json({ error: "Something went wrong." });
}

export async function getCaseDocuments(req, res) {
  try {
    const caseId = Number(req.params.caseId);
    const documents = await listDocuments(caseId, req.user.id);
    res.json({ documents });
  } catch (err) {
    handleError(err, res);
  }
}

export async function uploadCaseDocument(req, res) {
  try {
    const caseId = Number(req.params.caseId);
    const document = await addDocument(caseId, req.user.id, req.file);
    res.status(201).json({ document });
  } catch (err) {
    handleError(err, res);
  }
}

export async function downloadCaseDocument(req, res) {
  try {
    const id = Number(req.params.id);
    const doc = await getDocumentForDownload(id, req.user.id);

    res.setHeader("Content-Type", doc.mime_type);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(doc.filename)}"`
    );
    res.send(doc.file_data);
  } catch (err) {
    handleError(err, res);
  }
}

export async function deleteCaseDocument(req, res) {
  try {
    const id = Number(req.params.id);
    await removeDocument(id, req.user.id);
    res.status(204).send();
  } catch (err) {
    handleError(err, res);
  }
}

