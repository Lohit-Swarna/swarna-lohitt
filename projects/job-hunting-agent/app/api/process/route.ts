import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPDF } from '@/lib/pdfProcessor';
import {
  extractATSKeywords,
  tailorCVBullets,
  calculateMatchScore,
  extractBulletPoints,
  findMissingSkills
} from '@/lib/processing';
import { generateCoverLetter } from '@/lib/coverLetter';
import { formatForSheets } from '@/lib/googleSheets';

const MAX_CV_BYTES = 5 * 1024 * 1024;
const MAX_FIELD_CHARS = 50_000;

function textField(formData: FormData, name: string, fallback = ''): string {
  const value = formData.get(name);
  return typeof value === 'string' ? value.slice(0, MAX_FIELD_CHARS) : fallback;
}

export async function POST(request: NextRequest) {
  // Reject oversized uploads before buffering the multipart body.
  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (declaredLength > MAX_CV_BYTES + 2 * MAX_FIELD_CHARS) {
    return NextResponse.json({ error: 'Upload is too large (CV limit is 5 MB)' }, { status: 413 });
  }

  try {
    const formData = await request.formData();
    const cvFile = formData.get('cv');
    const jdText = textField(formData, 'jdText');
    const jdLink = textField(formData, 'jdLink');
    const companyName = textField(formData, 'companyName') || 'Company';
    const role = textField(formData, 'role') || 'Position';

    if (!(cvFile instanceof File)) {
      return NextResponse.json(
        { error: 'CV file is required' },
        { status: 400 }
      );
    }

    if (cvFile.type !== 'application/pdf') {
      return NextResponse.json({ error: 'CV must be a PDF file' }, { status: 415 });
    }

    if (cvFile.size > MAX_CV_BYTES) {
      return NextResponse.json({ error: 'CV is too large (limit is 5 MB)' }, { status: 413 });
    }

    if (!jdText.trim()) {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      );
    }

    // Extract text from CV PDF
    const cvBuffer = await cvFile.arrayBuffer();
    const cvText = await extractTextFromPDF(Buffer.from(cvBuffer));

    // Extract CV bullet points
    const bulletPoints = extractBulletPoints(cvText);

    // Extract ATS keywords from JD
    const atsKeywords = extractATSKeywords(jdText);

    // Lead with the bullets most relevant to the JD, without changing their wording
    const tailoredBullets = tailorCVBullets(bulletPoints, atsKeywords);

    // JD skills the CV does not mention, for the candidate to review
    const missingSkills = findMissingSkills(cvText, atsKeywords);

    // Generate cover letter
    const coverLetter = generateCoverLetter(companyName, role, cvText, atsKeywords);

    // Calculate match score
    const { score, reason } = calculateMatchScore(cvText, jdText, atsKeywords);

    // Format data for Google Sheets logging
    const sheetsData = formatForSheets(companyName, role, jdLink, score);

    return NextResponse.json({
      success: true,
      originalBullets: bulletPoints,
      tailoredBullets,
      missingSkills,
      coverLetter,
      matchScore: score,
      matchReason: reason,
      atsKeywords,
      sheetsData
    });
  } catch (error) {
    // Details stay in the server log; the client gets a generic message.
    console.error('Processing error:', error);
    return NextResponse.json(
      { error: 'Processing failed. Check that the CV is a readable, text-based PDF.' },
      { status: 500 }
    );
  }
}
