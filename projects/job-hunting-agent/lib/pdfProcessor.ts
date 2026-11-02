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
