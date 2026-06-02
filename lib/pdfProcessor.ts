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

export function extractFromURL(url: string): Promise<string> {
  // For web scraping, we'll use a simple approach
  // In production, use a proper scraping library like cheerio or puppeteer
  return fetch(url)
    .then(res => res.text())
    .then(html => {
      // Extract main content using basic parsing
      const textContent = html
        .replace(/<script[^>]*>.*?<\/script>/gs, '')
        .replace(/<style[^>]*>.*?<\/style>/gs, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      return textContent;
    });
}
