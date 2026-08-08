
import scrapeCourtCases from "./scrape.js";

// ---------------------------------------------------------------------------
// Example 1: bare defaults — no custom queries, no options.
// Runs the built-in writ/civil/criminal-petition and suo-motu/jurisdiction
// searches for all three courts, 5 pages each.
// ---------------------------------------------------------------------------
async function example1() {
  const results = await scrapeCourtCases();
  console.log(`Example 1: ${results.length} results`);
  return results;
}

// ---------------------------------------------------------------------------
// Example 2: custom queries ADDED on top of the defaults.
// customQueries is an object keyed by court name — each array of phrases
// gets merged onto that court's existing default searches.
// ---------------------------------------------------------------------------
async function example2() {
  const customQueries = {
    'Supreme Court of Pakistan': [
      '"Supreme Court of Pakistan" "constitution petition"',
      '"Supreme Court of Pakistan" "human rights case"',
    ],
    'Lahore High Court': [
      '"Lahore High Court" "contempt of court"',
    ],
    'Islamabad High Court': [
      '"Islamabad High Court" "bail petition"',
    ],
    // A court name that isn't in the defaults is simply added as new:
    'Sindh High Court': [
      '"Sindh High Court" "writ petition"',
    ],
  };

  const results = await scrapeCourtCases(customQueries);
  console.log(`Example 2: ${results.length} results`);
  return results;
}

// ---------------------------------------------------------------------------
// Example 3: custom queries + options together.
// Increases pages per query, slices the search across two year ranges
// (multiplying reachable results per query), and slows down delays a bit
// for a more cautious run.
// ---------------------------------------------------------------------------
async function example3() {
  const customQueries = {
    'Lahore High Court': [
      '"Lahore High Court" "constitutional petition"',
    ],
  };

  const options = {
    pagesPerQuery: 3,                     // up to 80 results per query/range
    yearRanges: [[2015, 2020], [2021, 2026]], // splits each query into 2 date windows
    minDelayMs: 8000,
    maxDelayMs: 16000,
    maxRetries: 1,
    headless: true,
    replaceDefaults:true,
  };

  const results = await scrapeCourtCases(customQueries, options);
  console.log(`Example 3: ${results.length} results`);
  return results;
}

// ---------------------------------------------------------------------------
// Example 4: replaceDefaults — run ONLY your own queries, ignoring the
// built-in ones entirely. Useful when you want a narrow, specific run.
// ---------------------------------------------------------------------------
async function example4() {
  const customQueries = {
    'Supreme Court of Pakistan': [
      '"Supreme Court of Pakistan" "environmental case"',
    ],
  };

  const options = {
    replaceDefaults: true, // only the query above runs — no writ/suo-motu defaults
    pagesPerQuery: 3,
  };

  const results = await scrapeCourtCases(customQueries, options);
  console.log(`Example 4: ${results.length} results`);
  return results;
}

// ---------------------------------------------------------------------------
// Example 5: headless: false — watch the browser (handy for debugging or
// manually solving a CAPTCHA if one comes up).
// ---------------------------------------------------------------------------
async function example5() {
  const results = await scrapeCourtCases(
    { 'Islamabad High Court': ['"Islamabad High Court" "suo motu"'] },
    { headless: false, pagesPerQuery: 2 }
  );
  console.log(`Example 5: ${results.length} results`);
  return results;
}

// Running Example 3 
const results = await example3();

// Each result object looks like:
// {
//   court: 'Lahore High Court',
//   query: '"Lahore High Court" "writ petition"',
//   yearRange: null,               // or "2015-2020" if yearRanges was used
//   title: '...',
//   link: '...',
//   snippet: '...',
//   publicationInfo: '...',
//   citedBy: '3',
//   scrapedAt: '2026-08-07T12:34:56.789Z'
// }
console.log(JSON.stringify(results.slice(0, 2), null, 2));