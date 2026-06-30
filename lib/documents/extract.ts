/**
 * Placeholder document text extraction.
 *
 * For the MVP we capture file metadata only. Real extraction (PDF parsing, OCR,
 * spec-sheet structuring) plugs in here later — the structure and call sites are
 * already in place so swapping in a real extractor is a localized change.
 */
export interface ExtractedDocument {
  fileName: string;
  fileType: string;
  extractedText: string | null;
  isPlaceholder: boolean;
}

export async function extractDocumentText(
  file: { name: string; type: string },
): Promise<ExtractedDocument> {
  // TODO: integrate a real PDF/text extractor (e.g. pdf-parse, unstructured).
  return {
    fileName: file.name,
    fileType: file.type || "application/octet-stream",
    extractedText: null,
    isPlaceholder: true,
  };
}
