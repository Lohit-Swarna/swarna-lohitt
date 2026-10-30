import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPDF } from '@/lib/pdfProcessor';
import {
  extractATSKeywords,
  rewriteCVBullets,
  calculateMatchScore,
  extractBulletPoints
} from '@/lib/processing';
import { generateCoverLetter } from '@/lib/coverLetter';
import { formatForSheets } from '@/lib/googleSheets';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const cvFile = formData.get('cv') as File;
    const jdText = formData.get('jdText') as string;
    const jdLink = formData.get('jdLink') as string || '';
    const companyName = formData.get('companyName') as string || 'Company';
    const role = formData.get('role') as string || 'Position';

    if (!cvFile) {
      return NextResponse.json(
        { error: 'CV file is required' },
        { status: 400 }
      );
    }

    if (!jdText) {
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

    // Rewrite CV bullets to include ATS keywords
    const rewrittenBullets = rewriteCVBullets(bulletPoints, atsKeywords);

    // Generate cover letter
    const coverLetter = generateCoverLetter(companyName, role, cvText, atsKeywords);

    // Calculate match score
    const { score, reason } = calculateMatchScore(cvText, jdText, atsKeywords);

    // Format data for Google Sheets logging
    const sheetsData = formatForSheets(companyName, role, jdLink, score);

    return NextResponse.json({
      success: true,
      originalBullets: bulletPoints,
      rewrittenBullets,
      coverLetter,
      matchScore: score,
      matchReason: reason,
      atsKeywords,
      sheetsData
    });
  } catch (error) {
    console.error('Processing error:', error);
    return NextResponse.json(
      { error: `Processing failed: ${error}` },
      { status: 500 }
    );
  }
}
