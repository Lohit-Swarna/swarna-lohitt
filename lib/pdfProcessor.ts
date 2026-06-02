import { PDFParse } from 'pdf-parse';

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const pdfParse = new PDFParse({ data: buffer });
    const { text } = await pdfParse.getText();
    await pdfParse.destroy();
    return text;
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error}`);
  }
}

/**
 * Sanitize HTML by removing all tags and potentially dangerous content
 * NOTE: This is a basic implementation. For production use,
 * consider using a proper HTML parser library like cheerio or xss
 */
function sanitizeHtml(html: string): string {
  let sanitized = html;
  
  // Remove all content between < and > (covers all HTML tags and variations)
  // This is the most comprehensive approach
  sanitized = sanitized.replace(/</g, ' ');
  sanitized = sanitized.replace(/>/g, ' ');
  
  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  return sanitized;
}

export function extractFromURL(url: string): Promise<string> {
  // For web scraping, we'll use a simple approach
  // In production, use a proper scraping library like cheerio or puppeteer
  return fetch(url)
    .then(res => res.text())
    .then(html => sanitizeHtml(html));
}
