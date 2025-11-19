import puppeteer, { Browser, Page } from 'puppeteer';
import { normalizeText } from './utils';

interface SearchResult {
  orcid: string | null;
  status: 'found' | 'multiple' | 'not_found' | 'error';
  searchUrl: string;
  errorMessage?: string;
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
    
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for results to load
    await page.waitForSelector('body', { timeout: 5000 });
    
    // Get page content
    const content = await page.content();
    
    // Check for "No results found" message
    if (content.includes('No results found') || content.includes('No se encontraron resultados')) {
      return {
        orcid: null,
        status: 'not_found',
        searchUrl
      };
    }
    
    // Try to find ORCID IDs in the page
    const orcidLinks = await page.$$eval('a[href*="orcid.org/"]', (links) => {
      return links
        .map(link => {
          const href = link.getAttribute('href') || '';
          const match = href.match(/orcid\.org\/(\d{4}-\d{4}-\d{4}-\d{3}[0-9X])/);
          return match ? match[1] : null;
        })
        .filter(Boolean) as string[];
    });
    
    // Remove duplicates
    const uniqueOrcids = [...new Set(orcidLinks)];
    
    if (uniqueOrcids.length === 0) {
      return {
        orcid: null,
        status: 'not_found',
        searchUrl
      };
    } else if (uniqueOrcids.length === 1) {
      return {
        orcid: uniqueOrcids[0],
        status: 'found',
        searchUrl
      };
    } else {
      return {
        orcid: null,
        status: 'multiple',
        searchUrl
      };
    }
  } catch (error) {
    console.error('Error searching ORCID:', error);
    return {
      orcid: null,
      status: 'error',
      searchUrl: buildSearchUrl(firstName, lastName, institution),
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
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
