/*
 * Usage:
 *   npm install selenium-webdriver
 *   # Requires a matching chromedriver on PATH
 *
 *   import { scrapeCourtCases } from './scrape.js';
 * 
 * */

import { Builder, By } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ---- Default configuration ------------------------------------------------

// Default per-court query phrases, aimed at actual case documents rather
// than general mentions of the court. Each entry ANDs two exact phrases.
const DEFAULT_COURTS = {
  'Supreme Court of Pakistan': [
    '"Supreme Court of Pakistan" "suo motu"',
    '"Supreme Court of Pakistan" "suo moto"', // common alternate spelling in PK usage
    '"Supreme Court of Pakistan" "original jurisdiction"',
    '"Supreme Court of Pakistan" "appellate jurisdiction"',
  ],
  'Lahore High Court': [
    '"Lahore High Court" "writ petition"',
    '"Lahore High Court" "civil petition"',
    '"Lahore High Court" "criminal petition"',
  ],
  'Islamabad High Court': [
    '"Islamabad High Court" "writ petition"',
    '"Islamabad High Court" "civil petition"',
    '"Islamabad High Court" "criminal petition"',
  ],
};

const DEFAULT_PAGES_PER_QUERY = 5;   // 10 results/page -> up to 50 per query/range by default
const DEFAULT_MIN_DELAY_MS = 6000;
const DEFAULT_MAX_DELAY_MS = 13000;
const DEFAULT_PAGE_LOAD_TIMEOUT_MS = 30000;
const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_BLOCK_BACKOFF_BASE_MS = 45000;

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// ---- Helpers ----------------------------------------------------------------

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay(minMs, maxMs) {
  const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return sleep(ms);
}

function buildScholarUrl(query, start = 0, yearRange = null) {
  const params = new URLSearchParams({ q: query, hl: 'en', start: String(start) });
  if (yearRange) {
    const [yearLow, yearHigh] = yearRange;
    if (yearLow) params.set('as_ylo', String(yearLow));
    if (yearHigh) params.set('as_yhi', String(yearHigh));
  }
  return `https://scholar.google.com/scholar?${params.toString()}`;
}

/**
 * Merges caller-supplied query phrases onto the default per-court lists
 * (or, with replaceDefaults, uses only what the caller passed in).
 */
function buildCourtsConfig(customQueries, replaceDefaults) {
  const merged = {};

  if (!replaceDefaults) {
    for (const [name, terms] of Object.entries(DEFAULT_COURTS)) {
      merged[name] = [...terms];
    }
  }

  for (const [name, terms] of Object.entries(customQueries)) {
    if (!terms || terms.length === 0) continue;
    merged[name] = merged[name] ? [...merged[name], ...terms] : [...terms];
  }

  return Object.entries(merged).map(([name, searchTerms]) => ({ name, searchTerms }));
}

/**
 * Visits the Scholar homepage before any searches, so the session has
 * cookies/history rather than looking like a cold bot hit.
 */
async function warmUp(driver) {
  console.log('Warming up session on scholar.google.com ...');
  try {
    await driver.get('https://scholar.google.com/');
    await sleep(3000 + Math.random() * 3000);
  } catch (err) {
    console.warn(`  warm-up navigation failed: ${err.message}`);
  }
}

/**
 * Checks whether the current page is a Google CAPTCHA / "unusual traffic"
 * interstitial rather than real results.
 */
async function isBlocked(driver) {
  const html = await driver.getPageSource();
  const url = await driver.getCurrentUrl();
  return (
    html.includes('Our systems have detected unusual traffic') ||
    html.includes('id="recaptcha"') ||
    url.includes('/sorry/')
  );
}

/**
 * Scrapes one Google Scholar results page and returns an array of entries.
 */
async function scrapeResultsPage(driver) {
  const items = await driver.findElements(By.css('#gs_res_ccl_mid .gs_r.gs_or.gs_scl'));
  const entries = [];

  for (const item of items) {
    let title = null;
    let link = null;
    try {
      const titleEl = await item.findElement(By.css('.gs_rt a'));
      title = (await titleEl.getText()).trim();
      link = await titleEl.getAttribute('href');
    } catch {
      try {
        const titleEl = await item.findElement(By.css('.gs_rt'));
        title = (await titleEl.getText()).trim();
      } catch {
        // no title found, skip
      }
    }

    let snippet = null;
    try {
      snippet = (await (await item.findElement(By.css('.gs_rs'))).getText()).trim();
    } catch {
      // no snippet
    }

    let publicationInfo = null;
    try {
      publicationInfo = (await (await item.findElement(By.css('.gs_a'))).getText()).trim();
    } catch {
      // no publication info
    }

    let citedBy = null;
    try {
      const links = await item.findElements(By.css('.gs_fl a'));
      for (const a of links) {
        const text = await a.getText();
        if (text.toLowerCase().includes('cited by')) {
          citedBy = text.replace(/\D/g, '') || '0';
        }
      }
    } catch {
      // no cited-by info
    }

    if (title) {
      entries.push({ title, link, snippet, publicationInfo, citedBy });
    }
  }

  return entries;
}

/**
 * Runs one search term (optionally scoped to one year range) through
 * pagination, with block detection and backoff-retry, and returns the
 * tagged results it collected.
 */
async function scrapeQuery(driver, courtName, term, yearRange, config) {
  const { pagesPerQuery, minDelayMs, maxDelayMs, maxRetries, blockBackoffBaseMs } = config;
  const results = [];
  let giveUp = false;
  const rangeLabel = yearRange ? ` [${yearRange[0]}-${yearRange[1]}]` : '';

  for (let i = 0; i < pagesPerQuery; i++) {
    if (giveUp) break;

    const start = i * 10;
    const url = buildScholarUrl(term, start, yearRange);

    let pageResults = [];
    let attempt = 0;

    while (true) {
      console.log(`[${courtName}] "${term}"${rangeLabel} - page ${i + 1}, attempt ${attempt + 1}`);

      try {
        await driver.get(url);
      } catch (err) {
        console.error(`  navigation failed: ${err.message}`);
        giveUp = true;
        break;
      }

      if (await isBlocked(driver)) {
        attempt++;
        if (attempt > maxRetries) {
          console.warn(`  still blocked after ${maxRetries} retries - giving up on this query for now.`);
          giveUp = true;
          break;
        }
        const backoff = blockBackoffBaseMs * attempt + Math.random() * 8000;
        console.warn(`  blocked - backing off ${Math.round(backoff / 1000)}s (retry ${attempt}/${maxRetries})...`);
        await sleep(backoff);
        continue; // retry same URL
      }

      pageResults = await scrapeResultsPage(driver);
      break;
    }

    if (giveUp) break;

    if (pageResults.length === 0) {
      console.log('  no more results for this query');
      break;
    }

    const scrapedAt = new Date().toISOString();
    pageResults.forEach((r) =>
      results.push({
        court: courtName,
        query: term,
        yearRange: yearRange ? `${yearRange[0]}-${yearRange[1]}` : null,
        ...r,
        scrapedAt,
      })
    );

    await randomDelay(minDelayMs, maxDelayMs);
  }

  return results;
}

/**
 * Runs every search term for one court (across every configured year
 * range, if any) and returns the combined results.
 */
async function scrapeCourt(driver, court, config) {
  const ranges = config.yearRanges && config.yearRanges.length > 0 ? config.yearRanges : [null];
  const courtResults = [];

  for (const term of court.searchTerms) {
    for (const range of ranges) {
      const results = await scrapeQuery(driver, court.name, term, range, config);
      courtResults.push(...results);
    }
  }

  return courtResults;
}

async function buildDriver({ headless, pageLoadTimeoutMs }) {
  const chromeOptions = new chrome.Options();
  if (headless) chromeOptions.addArguments('--headless=new');
  chromeOptions.addArguments('--no-sandbox');
  chromeOptions.addArguments('--disable-setuid-sandbox');
  chromeOptions.addArguments('--disable-dev-shm-usage');
  chromeOptions.addArguments(`user-agent=${USER_AGENT}`);
  chromeOptions.addArguments('--window-size=1366,900');
  chromeOptions.addArguments('--disable-blink-features=AutomationControlled');
  chromeOptions.excludeSwitches('enable-automation');
  chromeOptions.setUserPreferences({ credentials_enable_service: false });

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(chromeOptions)
    .build();

  await driver.manage().setTimeouts({ pageLoad: pageLoadTimeoutMs });

  try {
    await driver.executeScript(
      "Object.defineProperty(navigator, 'webdriver', { get: () => undefined });"
    );
  } catch {
    // non-fatal if this fails
  }

  return driver;
}

// ---- Public API -------------------------------------------------------------

/**
 * Scrapes Google Scholar for Pakistani court case documents and returns
 * the results as an array of plain objects (nothing is written to disk).
 *
 * @param {Object} [customQueries] - Extra query phrases keyed by court
 *   name, merged onto that court's defaults, e.g.
 *   { 'Lahore High Court': ['"Lahore High Court" "contempt of court"'] }.
 *   A court name not already in the defaults is added as a new court.
 * @param {Object} [options]
 * @param {number} [options.pagesPerQuery=5] - result pages (10/page) per
 *   query per year range.
 * @param {number} [options.minDelayMs=6000] - min delay between requests.
 * @param {number} [options.maxDelayMs=13000] - max delay between requests.
 * @param {number} [options.maxRetries=2] - retries after a block, per page.
 * @param {number} [options.blockBackoffBaseMs=45000] - base cool-down after
 *   a block; grows with each retry.
 * @param {number} [options.pageLoadTimeoutMs=30000]
 * @param {boolean} [options.headless=true] - set false to watch the
 *   browser (useful for debugging or manually solving a CAPTCHA).
 * @param {boolean} [options.replaceDefaults=false] - if true, customQueries
 *   fully replaces the defaults instead of extending them.
 * @param {Array<[number, number]>} [options.yearRanges=null] - e.g.
 *   [[2015, 2019], [2020, 2026]]. When set, each query is run once per
 *   range (via Scholar's as_ylo/as_yhi filters) instead of once
 *   unfiltered - see "Increasing the number of documents scraped" above.
 * @returns {Promise<Array<Object>>}
 */
export async function scrapeCourtCases(customQueries = {}, options = {}) {
  const {
    pagesPerQuery = DEFAULT_PAGES_PER_QUERY,
    minDelayMs = DEFAULT_MIN_DELAY_MS,
    maxDelayMs = DEFAULT_MAX_DELAY_MS,
    maxRetries = DEFAULT_MAX_RETRIES,
    blockBackoffBaseMs = DEFAULT_BLOCK_BACKOFF_BASE_MS,
    pageLoadTimeoutMs = DEFAULT_PAGE_LOAD_TIMEOUT_MS,
    headless = true,
    replaceDefaults = false,
    yearRanges = null,
  } = options;

  if (pagesPerQuery > 20) {
    console.warn(
      `pagesPerQuery is set to ${pagesPerQuery}. In practice Google Scholar ` +
        'tends to run out of fresh results and get stricter about blocking ' +
        'well before page 20-30 of a single query - see "Increasing the ' +
        'number of documents scraped" in the file header for better levers.'
    );
  }

  const courts = buildCourtsConfig(customQueries, replaceDefaults);
  const config = { pagesPerQuery, minDelayMs, maxDelayMs, maxRetries, blockBackoffBaseMs, yearRanges };

  const driver = await buildDriver({ headless, pageLoadTimeoutMs });
  const allResults = [];

  try {
    await warmUp(driver);

    for (const court of courts) {
      const results = await scrapeCourt(driver, court, config);
      allResults.push(...results);
      await randomDelay(minDelayMs, maxDelayMs);
    }
  } finally {
    await driver.quit();
  }

  return allResults;
}

export default scrapeCourtCases;

// ---- Optional: run directly with `node scrape.js` -------
// This block is only a convenience for manual testing from the command
// line. It is NOT part of scrapeCourtCases' behavior - the exported
// function always just returns the array, per the spec above.

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  scrapeCourtCases()
    .then((results) => {
      fs.writeFileSync('results.json', JSON.stringify(results, null, 2), 'utf-8');
      console.log(`\nDone. Scraped ${results.length} results - saved to results.json for convenience.`);
    })
    .catch((err) => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}