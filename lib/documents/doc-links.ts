/**
 * Maps recommended trade-document names to authoritative reference pages so
 * the user can jump straight from the checklist to "what is this document
 * and how do I get it". Matching is keyword-based because document names
 * arrive as free text from the classification engine and AI providers.
 *
 * URLs deliberately point at stable, official (or industry-body) landing
 * pages rather than deep links that rot.
 */

export interface DocLink {
  /** Human-readable source, shown as the link hint. */
  source: string;
  url: string;
}

interface DocLinkRule extends DocLink {
  match: RegExp;
}

const RULES: DocLinkRule[] = [
  {
    match: /pro\s*-?\s*forma/i,
    source: "trade.gov guide",
    url: "https://www.trade.gov/pro-forma-invoice",
  },
  {
    match: /commercial invoice/i,
    source: "trade.gov guide",
    url: "https://www.trade.gov/commercial-invoice",
  },
  {
    match: /packing list/i,
    source: "trade.gov export docs",
    url: "https://www.trade.gov/common-export-documents",
  },
  {
    match: /certificate of origin|origin certificate|\bcoo\b/i,
    source: "ICC WCF",
    url: "https://iccwbo.org/business-solutions/certificates-of-origin/",
  },
  {
    match: /eur\.?\s?1|movement certificate|a\.?tr\b/i,
    source: "EU Access2Markets",
    url: "https://trade.ec.europa.eu/access-to-markets/en/home",
  },
  {
    match: /bill of lading|\bb\/l\b/i,
    source: "trade.gov export docs",
    url: "https://www.trade.gov/common-export-documents",
  },
  {
    match: /air ?waybill|\bawb\b/i,
    source: "IATA",
    url: "https://www.iata.org/en/programs/cargo/e/eawb/",
  },
  {
    match: /\bcmr\b|road consignment/i,
    source: "UNECE road transport",
    url: "https://unece.org/transport/road-transport",
  },
  {
    match: /customs declaration|import declaration|export declaration|\bsad\b/i,
    source: "EU customs",
    url: "https://taxation-customs.ec.europa.eu/customs-4_en",
  },
  {
    match: /\beori\b/i,
    source: "EU customs",
    url: "https://taxation-customs.ec.europa.eu/customs-4/customs-procedures-import-and-export-0/customs-procedures/economic-operators-registration-and-identification-number-eori_en",
  },
  {
    match: /import licen[cs]e|export licen[cs]e|import permit|export permit/i,
    source: "trade.gov export docs",
    url: "https://www.trade.gov/common-export-documents",
  },
  {
    match: /phytosanitary/i,
    source: "IPPC ePhyto",
    url: "https://www.ippc.int/en/core-activities/ephyto/",
  },
  {
    match: /fumigation|ispm\s*-?\s*15|wood packaging/i,
    source: "IPPC standards",
    url: "https://www.ippc.int/en/core-activities/standards-setting/ispms/",
  },
  {
    match: /health certificate|veterinary|sanitary certificate/i,
    source: "WOAH standards",
    url: "https://www.woah.org/en/what-we-do/standards/",
  },
  {
    match: /safety data sheet|\bsds\b|\bmsds\b/i,
    source: "OSHA HazCom",
    url: "https://www.osha.gov/hazard-communication",
  },
  {
    match: /un\s*38\.?3|battery test summary|lithium/i,
    source: "IATA lithium batteries",
    url: "https://www.iata.org/en/cargo/dgr/lithium-batteries/",
  },
  {
    match: /dangerous goods|\bdgd\b|hazmat/i,
    source: "IATA DGR",
    url: "https://www.iata.org/en/cargo/dgr/",
  },
  {
    match: /ce mark|declaration of conformity|\bdoc\b.*conformity/i,
    source: "EU Your Europe",
    url: "https://europa.eu/youreurope/business/product-requirements/labels-markings/ce-marking/index_en.htm",
  },
  {
    match: /\breach\b/i,
    source: "ECHA",
    url: "https://echa.europa.eu/regulations/reach/understanding-reach",
  },
  {
    match: /\bfda\b|prior notice/i,
    source: "FDA import program",
    url: "https://www.fda.gov/industry/import-program",
  },
  {
    match: /insurance certificate|cargo insurance/i,
    source: "trade.gov export docs",
    url: "https://www.trade.gov/common-export-documents",
  },
  {
    match: /fcc\b/i,
    source: "FCC equipment authorization",
    url: "https://www.fcc.gov/engineering-technology/laboratory-division/general/equipment-authorization",
  },
  {
    match: /textile|fib(er|re) content/i,
    source: "EU Your Europe",
    url: "https://europa.eu/youreurope/business/product-requirements/index_en.htm",
  },
];

/** Returns the best reference link for a recommended document, or null. */
export function findDocLink(documentName: string): DocLink | null {
  for (const rule of RULES) {
    if (rule.match.test(documentName)) {
      return { source: rule.source, url: rule.url };
    }
  }
  return null;
}
