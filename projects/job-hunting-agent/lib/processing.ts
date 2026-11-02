export interface ATSKeywords {
  skills: string[];
  responsibilities: string[];
  qualifications: string[];
  keywords: string[];
}

const TECH_SKILLS = [
  'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'rust',
  'react', 'angular', 'vue', 'nodejs', 'django', 'fastapi', 'flask',
  'sql', 'mongodb', 'postgresql', 'mysql', 'aws', 'azure', 'gcp',
  'docker', 'kubernetes', 'git', 'ci/cd', 'machine learning', 'ai',
  'rest', 'graphql', 'microservices', 'agile', 'scrum', 'devops'
];

// No `g` flag: a global regex keeps lastIndex between .test() calls and skips lines.
const RESPONSIBILITY_PATTERN = /\b(?:responsible for|responsibilities?|must|will|should|manage|develop|design|implement)/i;
const QUALIFICATION_PATTERN = /\b(?:qualifications?|requirements?|education|years of experience|background)/i;
const BULLET_MARKER = /^[-•*]\s+|^\d+\.\s+/;

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * True when `term` appears in `text` as a whole word or phrase (case-insensitive).
 * `\b` does not work next to symbols such as "+" and "#", so explicit lookarounds are used.
 */
export function containsTerm(text: string, term: string): boolean {
  return new RegExp(`(?<![\\w+#])${escapeRegExp(term)}(?![\\w+#])`, 'i').test(text);
}

/**
 * Extract ATS keywords from job description
 */
export function extractATSKeywords(jd: string): ATSKeywords {
  const lines = jd
    .split('\n')
    .map(line => line.trim().replace(BULLET_MARKER, ''))
    // Section headings such as "Responsibilities:" are labels, not requirements.
    .filter(line => line.length > 0 && !line.endsWith(':'));

  const skills = TECH_SKILLS.filter(skill => containsTerm(jd, skill));

  const responsibilities: string[] = [];
  const qualifications: string[] = [];

  lines.forEach(line => {
    if (RESPONSIBILITY_PATTERN.test(line) && line.length < 200) {
      responsibilities.push(line);
    }
    if (QUALIFICATION_PATTERN.test(line) && line.length < 200) {
      qualifications.push(line);
    }
  });

  // Extract important keywords (capitalized words, acronyms)
  const keywords = new Set<string>();
  const wordPattern = /\b[A-Z][A-Za-z]*\b/g;
  const matches = jd.match(wordPattern) || [];
  matches.slice(0, 20).forEach(word => {
    if (word.length > 2 && !['The', 'And', 'For', 'Are', 'Our', 'You', 'With', 'This', 'That'].includes(word)) {
      keywords.add(word);
    }
  });

  return {
    skills,
    responsibilities: responsibilities.slice(0, 5),
    qualifications: qualifications.slice(0, 5),
    keywords: Array.from(keywords).slice(0, 10)
  };
}

/**
 * Order CV bullet points so those mentioning the most job-description skills and
 * keywords come first. Bullet text is never changed: tailoring must not add
 * claims the candidate did not make.
 */
export function tailorCVBullets(bulletPoints: string[], atsKeywords: ATSKeywords): string[] {
  const terms = [...atsKeywords.skills, ...atsKeywords.keywords];
  const relevance = (bullet: string) => terms.filter(term => containsTerm(bullet, term)).length;

  return bulletPoints
    .map((bullet, index) => ({ bullet, index, relevance: relevance(bullet) }))
    .sort((a, b) => b.relevance - a.relevance || a.index - b.index)
    .map(({ bullet }) => bullet);
}

/**
 * Job-description skills that the CV never mentions.
 */
export function findMissingSkills(cvText: string, atsKeywords: ATSKeywords): string[] {
  return atsKeywords.skills.filter(skill => !containsTerm(cvText, skill));
}

/**
 * Calculate match score between CV and JD
 */
export function calculateMatchScore(
  cvText: string,
  jdText: string,
  atsKeywords: ATSKeywords
): { score: number; reason: string } {
  const cvLower = cvText.toLowerCase();

  const matchedSkills = atsKeywords.skills.filter(skill => containsTerm(cvText, skill)).length;
  const matchedKeywords = atsKeywords.keywords.filter(keyword => containsTerm(cvText, keyword)).length;

  let matchedResponsibilities = 0;
  atsKeywords.responsibilities.forEach(resp => {
    // Compare the first three meaningful words; bullet markers and short words would match any CV.
    const words = resp
      .toLowerCase()
      .split(/\s+/)
      .map(word => word.replace(/^[^a-z0-9]+|[^a-z0-9+#]+$/g, ''))
      .filter(word => word.length >= 3)
      .slice(0, 3);
    const matched = words.filter(word => cvLower.includes(word)).length;
    if (matched >= 2) matchedResponsibilities++;
  });

  const skillScore = (matchedSkills / Math.max(atsKeywords.skills.length, 1)) * 40;
  const keywordScore = (matchedKeywords / Math.max(atsKeywords.keywords.length, 1)) * 30;
  const respScore = (matchedResponsibilities / Math.max(atsKeywords.responsibilities.length, 1)) * 30;

  const score = Math.round(skillScore + keywordScore + respScore);

  let reason = '';
  if (matchedSkills > atsKeywords.skills.length * 0.7) {
    reason = `Strong skill match with ${matchedSkills}/${atsKeywords.skills.length} required skills.`;
  } else if (matchedSkills > atsKeywords.skills.length * 0.4) {
    reason = `Moderate skill alignment with ${matchedSkills}/${atsKeywords.skills.length} required skills covered.`;
  } else {
    reason = `Limited skill overlap. Consider highlighting more relevant experience.`;
  }

  return { score: Math.min(100, Math.max(0, score)), reason };
}

/**
 * Extract bullet points from CV text
 */
export function extractBulletPoints(cvText: string): string[] {
  const lines = cvText.split('\n');
  const bullets: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Look for bullet points (prefixed with •, -, *, or similar)
    if (BULLET_MARKER.test(trimmed)) {
      bullets.push(trimmed.replace(BULLET_MARKER, ''));
    }
  }

  // If no bullets found, split by common delimiters
  if (bullets.length === 0) {
    return lines
      .filter(line => line.trim().length > 20 && line.trim().length < 300)
      .slice(0, 10);
  }

  return bullets.slice(0, 10);
}
