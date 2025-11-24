import puppeteer, { Browser, Page } from 'puppeteer';
import { normalizeText } from './utils';

interface SearchResult {
  orcid: string | null;
  status: 'found' | 'multiple' | 'not_found' | 'error';
  searchUrl: string;
  errorMessage?: string;
  debugHtml?: string;
  debugInfo?: string;
}

let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
  }
  return browser;
}

export async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

async function searchOrcidOnPage(
  page: Page,
  firstName: string,
  lastName: string,
  institution?: string
): Promise<SearchResult> {
  try {
    const searchUrl = buildSearchUrl(firstName, lastName, institution);
    console.log(`[ORCID Worker] Navigating to: ${searchUrl}`);
    
    // Navigate with longer timeout
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    console.log(`[ORCID Worker] Page loaded, waiting for results...`);
    
    // Wait for results to load - wait for the results count text to appear
    try {
      // Wait for either "Showing X of Y results" or "No results found"
      await page.waitForFunction(
        () => {
          const bodyText = document.body.textContent || '';
          return bodyText.includes('Showing') || 
                 bodyText.includes('No results found') ||
                 bodyText.includes('No se encontraron resultados');
        },
        { timeout: 30000 }
      );
      console.log(`[ORCID Worker] Results loaded`);
    } catch (e) {
      console.warn(`[ORCID Worker] Timeout waiting for results indicator, proceeding anyway`);
    }
    
    // Additional wait for table to be fully rendered
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get page content
    const content = await page.content();
    console.log(`[ORCID Worker] Page content length: ${content.length} chars`);
    
    // Capture HTML snapshot for debugging (always, not just on error)
    const htmlSnapshot = content.substring(0, 5000);
    
    // Check for "No results found" message
    if (content.includes('No results found') || content.includes('No se encontraron resultados') || content.includes('Showing 0 of 0 results')) {
      console.log(`[ORCID Worker] No results found message detected`);
      return {
        orcid: null,
        status: 'not_found',
        searchUrl,
        debugHtml: htmlSnapshot,
        debugInfo: JSON.stringify({ message: 'No results found in page content' }, null, 2)
      };
    }
    
    // Try to extract ORCID IDs from the results table
    // ORCID search results show a table with ORCID ID in the first column
    const extractionResult = await page.evaluate(() => {
      const results: string[] = [];
      const debugLog: any = {
        linksFound: 0,
        cellsFound: 0,
        orcidsFromLinks: [],
        orcidsFromCells: [],
        tableHtml: '',
        bodyText: document.body.textContent?.substring(0, 500) || ''
      };
      
      // Look for ORCID IDs in links (format: 0000-0001-2345-6789)
      const links = Array.from(document.querySelectorAll('a'));
      debugLog.linksFound = links.length;
      
      for (const link of links) {
        const href = link.getAttribute('href') || '';
        const text = link.textContent || '';
        
        // Match ORCID ID pattern in href or text
        const orcidPattern = /\d{4}-\d{4}-\d{4}-\d{3}[0-9X]/;
        const hrefMatch = href.match(orcidPattern);
        const textMatch = text.match(orcidPattern);
        
        if (hrefMatch) {
          results.push(hrefMatch[0]);
          debugLog.orcidsFromLinks.push({ source: 'href', orcid: hrefMatch[0], href });
        } else if (textMatch) {
          results.push(textMatch[0]);
          debugLog.orcidsFromLinks.push({ source: 'text', orcid: textMatch[0], text });
        }
      }
      
      // Also check table cells directly
      const cells = Array.from(document.querySelectorAll('td, th'));
      debugLog.cellsFound = cells.length;
      
      for (const cell of cells) {
        const text = cell.textContent || '';
        const match = text.match(/\d{4}-\d{4}-\d{4}-\d{3}[0-9X]/);
        if (match) {
          results.push(match[0]);
          debugLog.orcidsFromCells.push({ orcid: match[0], cellText: text.substring(0, 100) });
        }
      }
      
      // Capture table HTML if exists
      const table = document.querySelector('table');
      if (table) {
        debugLog.tableHtml = table.outerHTML.substring(0, 2000);
      }
      
      return { orcidIds: results, debugLog };
    });
    
    const orcidIds = extractionResult.orcidIds;
    const debugLog = extractionResult.debugLog;
    
    // Remove duplicates
    const uniqueOrcids = [...new Set(orcidIds)];
    
    console.log(`[ORCID Search Debug] URL: ${searchUrl}`);
    console.log(`[ORCID Search Debug] Found ${uniqueOrcids.length} unique ORCID(s):`, uniqueOrcids);
    console.log(`[ORCID Search Debug] Links found: ${debugLog.linksFound}, Cells found: ${debugLog.cellsFound}`);
    console.log(`[ORCID Search Debug] ORCIDs from links:`, debugLog.orcidsFromLinks);
    console.log(`[ORCID Search Debug] ORCIDs from cells:`, debugLog.orcidsFromCells);
    
    if (uniqueOrcids.length === 0) {
      return {
        orcid: null,
        status: 'not_found',
        searchUrl,
        debugHtml: htmlSnapshot,
        debugInfo: JSON.stringify(debugLog, null, 2)
      };
    } else if (uniqueOrcids.length === 1) {
      return {
        orcid: uniqueOrcids[0],
        status: 'found',
        searchUrl,
        debugHtml: htmlSnapshot,
        debugInfo: JSON.stringify(debugLog, null, 2)
      };
    } else {
      return {
        orcid: null,
        status: 'multiple',
        searchUrl,
        debugHtml: htmlSnapshot,
        debugInfo: JSON.stringify({ ...debugLog, multipleOrcids: uniqueOrcids }, null, 2)
      };
    }
  } catch (error) {
    console.error('[ORCID Worker] Error searching ORCID:', error);
    
    // Try to capture HTML even on error
    let htmlSnapshot = null;
    try {
      const content = await page.content();
      htmlSnapshot = content.substring(0, 5000);
    } catch (e) {
      console.error('[ORCID Worker] Could not capture HTML on error');
    }
    
    return {
      orcid: null,
      status: 'error',
      searchUrl: buildSearchUrl(firstName, lastName, institution),
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      debugHtml: htmlSnapshot,
      debugInfo: JSON.stringify({ error: error instanceof Error ? error.stack : String(error) }, null, 2)
    };
  }
}

function buildSearchUrl(firstName: string, lastName: string, institution?: string): string {
  const params = new URLSearchParams();
  params.set('firstName', firstName);
  params.set('lastName', lastName);
  if (institution) {
    params.set('institution', institution);
  }
  return `https://orcid.org/orcid-search/search?${params.toString()}`;
}

export async function searchOrcid(
  firstName: string,
  lastName: string,
  institution?: string,
  institutionVariants?: string[]
): Promise<SearchResult> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  
  try {
    // Try with original names first
    let result = await searchOrcidOnPage(page, firstName, lastName, institution);
    
    // If not found, try with normalized names
    if (result.status === 'not_found') {
      const normalizedFirstName = normalizeText(firstName);
      const normalizedLastName = normalizeText(lastName);
      
      result = await searchOrcidOnPage(page, normalizedFirstName, normalizedLastName, institution);
    }
    
    // If still not found and we have institution variants, try them
    if (result.status === 'not_found' && institutionVariants && institutionVariants.length > 0) {
      for (const variant of institutionVariants) {
        result = await searchOrcidOnPage(page, firstName, lastName, variant);
        if (result.status !== 'not_found') {
          break;
        }
        
        // Also try with normalized names
        const normalizedFirstName = normalizeText(firstName);
        const normalizedLastName = normalizeText(lastName);
        result = await searchOrcidOnPage(page, normalizedFirstName, normalizedLastName, variant);
        if (result.status !== 'not_found') {
          break;
        }
      }
    }
    
    return result;
  } finally {
    await page.close();
  }
}
