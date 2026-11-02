// Writes fixtures/sample-cv.pdf: a minimal one-page text PDF for a fictional candidate.
// Usage: node fixtures/make-sample-cv.mjs
import { writeFileSync } from 'node:fs';

const lines = [
  'Jane Doe',
  'Data Analyst',
  'Experience:',
  '- Built SQL reporting models in PostgreSQL for weekly sales reviews',
  '- Automated data cleaning with Python and pandas',
  '- Developed dashboards used by the finance team',
  '- Managed a small analytics backlog',
];

const escape = (text) => text.replace(/[\\()]/g, (char) => `\\${char}`);
const stream = `BT /F1 11 Tf 14 TL 50 760 Td ${lines.map((line) => `(${escape(line)}) '`).join(' ')} ET`;
const objects = [
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
  `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
];

let pdf = '%PDF-1.4\n';
const offsets = objects.map((object, index) => {
  const offset = pdf.length;
  pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  return offset;
});
const xref = pdf.length;
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
pdf += offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;

writeFileSync(new URL('./sample-cv.pdf', import.meta.url), pdf, 'latin1');
