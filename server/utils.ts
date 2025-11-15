/**
 * Normalize text by removing accents and special characters
 */
export function normalizeText(text: string): string {
  if (!text) return "";
  
  // Normalize Unicode (NFD = decompose characters with accents)
  const nfd = text.normalize('NFD');
  
  // Remove diacritical marks (accents)
  const withoutAccents = nfd.replace(/[\u0300-\u036f]/g, '');
  
  return withoutAccents;
}

/**
 * Get institution variants from institutions data
 */
export function getInstitutionVariants(
  institutionName: string,
  institutionsData: Array<{
    canonical: string;
    variants: string;
    orcidRegistryName: string | null;
  }>
): string[] {
  if (!institutionName) return [];
  
  const normalized = normalizeText(institutionName).toLowerCase().trim();
  
  const variants: string[] = [institutionName];
  
  for (const inst of institutionsData) {
    const parsedVariants = JSON.parse(inst.variants) as string[];
    
    if (
      normalizeText(inst.canonical).toLowerCase() === normalized ||
      parsedVariants.some(v => normalizeText(v).toLowerCase() === normalized)
    ) {
      variants.push(...parsedVariants);
      if (inst.orcidRegistryName) {
        variants.push(inst.orcidRegistryName);
      }
      variants.push(inst.canonical);
      break;
    }
  }
  
  // Remove duplicates
  return Array.from(new Set(variants.filter(v => v)));
}

/**
 * Build ORCID search URL
 */
export function buildOrcidSearchUrl(
  firstName: string,
  lastName: string,
  institution?: string
): string {
  const params = new URLSearchParams();
  params.set('firstName', firstName);
  params.set('lastName', lastName);
  if (institution) {
    params.set('institution', institution);
  }
  
  return `https://orcid.org/orcid-search/search?${params.toString()}`;
}
