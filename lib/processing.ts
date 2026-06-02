/**
 * Extract ATS keywords from job description
 */
export function extractATSKeywords(jd: string): {
  skills: string[];
  responsibilities: string[];
  qualifications: string[];
  keywords: string[];
} {
  const lines = jd.split('\n').filter(line => line.trim().length > 0);
  
  // Common keywords to look for
  const skillPatterns = /(?:skills?|technical|expertise|proficient|required skills?|experience with)/gi;
  const respPatterns = /(?:responsible for|responsibilities?|must|will|should|manage|develop|design|implement)/gi;
  const qualPatterns = /(?:qualifications?|requirements?|education|years of experience|background)/gi;
  
  // Extract skills
  const skills = new Set<string>();
  const commonTechSkills = [
    'python', 'javascript', 'typescript', 'java', 'c\\+\\+', 'c#', 'rust',
    'react', 'angular', 'vue', 'nodejs', 'django', 'fastapi', 'flask',
    'sql', 'mongodb', 'postgresql', 'mysql', 'aws', 'azure', 'gcp',
    'docker', 'kubernetes', 'git', 'ci/cd', 'machine learning', 'ai',
    'rest', 'graphql', 'microservices', 'agile', 'scrum', 'devops'
  ];
  
  const jdLower = jd.toLowerCase();
  commonTechSkills.forEach(skill => {
    if (jdLower.includes(skill)) {
      skills.add(skill);
    }
  });
  
  // Extract lines containing responsibilities
  const responsibilities: string[] = [];
  const qualifications: string[] = [];
  
  lines.forEach(line => {
    if (respPatterns.test(line) && line.length < 200) {
      responsibilities.push(line.trim());
    }
    if (qualPatterns.test(line) && line.length < 200) {
      qualifications.push(line.trim());
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
    skills: Array.from(skills),
    responsibilities: responsibilities.slice(0, 5),
    qualifications: qualifications.slice(0, 5),
    keywords: Array.from(keywords).slice(0, 10)
  };
}

/**
 * Rewrite CV bullet points to include ATS keywords
 */
export function rewriteCVBullets(
  bulletPoints: string[],
  atsKeywords: {
    skills: string[];
    responsibilities: string[];
    qualifications: string[];
    keywords: string[];
  }
): string[] {
  return bulletPoints.map(bullet => {
    let rewritten = bullet;
    
    // Add relevant skills where appropriate
    atsKeywords.skills.forEach(skill => {
      // Only add if not already present (case-insensitive)
      if (!rewritten.toLowerCase().includes(skill.toLowerCase())) {
        // Find relevant responsibility keywords and inject skill near them
        if (rewritten.toLowerCase().includes('develop') || rewritten.toLowerCase().includes('design')) {
          rewritten = rewritten.replace('Develop', `Develop ${skill}`);
        }
      }
    });
    
    // Ensure professional tone and metrics where applicable
    if (!rewritten.match(/\d+%|\d+x|\d+\$|increased|improved/i)) {
      // If no metrics, try to add context keywords
      atsKeywords.keywords.forEach((keyword, idx) => {
        if (idx < 2 && !rewritten.toLowerCase().includes(keyword.toLowerCase())) {
          rewritten = `${rewritten} (${keyword})`;
        }
      });
    }
    
    return rewritten;
  });
}

/**
 * Calculate match score between CV and JD
 */
export function calculateMatchScore(
  cvText: string,
  jdText: string,
  atsKeywords: {
    skills: string[];
    responsibilities: string[];
    qualifications: string[];
    keywords: string[];
  }
): { score: number; reason: string } {
  const cvLower = cvText.toLowerCase();
  const jdLower = jdText.toLowerCase();
  
  let matchedSkills = 0;
  atsKeywords.skills.forEach(skill => {
    if (cvLower.includes(skill.toLowerCase())) {
      matchedSkills++;
    }
  });
  
  let matchedKeywords = 0;
  atsKeywords.keywords.forEach(keyword => {
    if (cvLower.includes(keyword.toLowerCase())) {
      matchedKeywords++;
    }
  });
  
  let matchedResponsibilities = 0;
  atsKeywords.responsibilities.forEach(resp => {
    const keywords = resp.split(/\s+/).slice(0, 3);
    const matched = keywords.filter(k => cvLower.includes(k.toLowerCase())).length;
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
    if (/^[-•*]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
      bullets.push(trimmed.replace(/^[-•*]\s+|^\d+\.\s+/, ''));
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
