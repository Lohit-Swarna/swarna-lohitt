/**
 * Generate a professional cover letter
 */
export function generateCoverLetter(
  companyName: string,
  role: string,
  cvText: string,
  atsKeywords: {
    skills: string[];
    responsibilities: string[];
    qualifications: string[];
    keywords: string[];
  }
): string {
  // Extract name from CV
  const nameMatch = cvText.match(/^([A-Z][a-z]+\s+[A-Z][a-z]+)/m);
  const name = nameMatch ? nameMatch[1] : 'Hiring Manager';
  
  // Select relevant skills for cover letter
  const topSkills = atsKeywords.skills.slice(0, 2).join(' and ');
  
  // Generate 150-word cover letter with confident-but-warm tone
  const coverLetter = `Dear Hiring Manager,

I am excited to express my interest in the ${role} position at ${companyName}. With a strong background in ${topSkills} and a proven track record of delivering impactful solutions, I am confident that my skills and experience make me an excellent fit for your team.

Throughout my career, I have developed expertise in the key areas that your role requires. I have successfully contributed to projects that directly align with the responsibilities outlined in your job description, consistently demonstrating my ability to deliver results while collaborating effectively with cross-functional teams.

What excites me most about this opportunity is the chance to bring my passion for problem-solving and technical excellence to ${companyName}. I am impressed by your company's vision and values, and I am eager to contribute to your continued success.

I would welcome the opportunity to discuss how my experience and skills can add value to your team. Thank you for considering my application. I look forward to speaking with you soon.

Best regards,
${name}`;

  return coverLetter;
}

/**
 * Sanitize text for PDF generation
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/[^\w\s\.\,\-\:\;\'\"\(\)]/g, '')
    .trim();
}
