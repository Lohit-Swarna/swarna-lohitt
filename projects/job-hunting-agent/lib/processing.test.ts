import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  calculateMatchScore,
  containsTerm,
  extractATSKeywords,
  extractBulletPoints,
  findMissingSkills,
  tailorCVBullets
} from './processing.ts';

const sampleJD = `
Senior Software Engineer

Required Skills:
- Python
- JavaScript
- React
- AWS
- Docker
- MongoDB

Responsibilities:
- Develop scalable web applications
- Design system architecture
- Lead development team
- Manage CI/CD pipelines
- Debug complex issues

Qualifications:
- BS in Computer Science
- 5+ years of experience
- Strong problem-solving skills
`;

const sampleCV = `
John Smith
Software Engineer
john@example.com

Experience:
- Developed web applications using JavaScript and React
- Implemented microservices architecture with Docker
- Optimized database queries in MongoDB
- Led team of 3 engineers
- Managed deployment pipelines

Skills:
- JavaScript, React, Node.js
- AWS EC2, S3, Lambda
- Docker, Kubernetes
- MongoDB, PostgreSQL
`;

const noKeywords = { skills: [], responsibilities: [], qualifications: [], keywords: [] };

describe('containsTerm', () => {
  it('matches whole words and phrases case-insensitively', () => {
    assert.ok(containsTerm('Built ML pipelines with Machine Learning tools', 'machine learning'));
    assert.ok(containsTerm('AI-driven search', 'ai'));
  });

  it('does not match inside longer words', () => {
    assert.ok(!containsTerm('JavaScript developer', 'java'));
    assert.ok(!containsTerm('Wrote C code', 'c++'));
  });
});

describe('extractATSKeywords', () => {
  it('finds the listed technical skills', () => {
    const { skills } = extractATSKeywords(sampleJD);
    for (const skill of ['python', 'javascript', 'react', 'aws', 'docker', 'mongodb']) {
      assert.ok(skills.includes(skill), `expected ${skill} in ${skills.join(', ')}`);
    }
  });

  it('does not report skills that only appear inside other words', () => {
    const { skills } = extractATSKeywords('We maintain digital tools and have an interest in JavaScript.');
    for (const falsePositive of ['ai', 'git', 'rest', 'java']) {
      assert.ok(!skills.includes(falsePositive), `unexpected ${falsePositive} in ${skills.join(', ')}`);
    }
  });

  it('detects skills whose names contain symbols', () => {
    const { skills } = extractATSKeywords('Experience with C++ and C# is required.');
    assert.ok(skills.includes('c++'));
    assert.ok(skills.includes('c#'));
  });

  it('captures every responsibility line, without bullet markers or headings', () => {
    const { responsibilities } = extractATSKeywords('Responsibilities:\n- Develop APIs\n- Design schemas\n- Manage releases');
    assert.deepEqual(responsibilities, ['Develop APIs', 'Design schemas', 'Manage releases']);
  });
});

describe('extractBulletPoints', () => {
  it('extracts dash and numbered bullets without their markers', () => {
    assert.deepEqual(extractBulletPoints('Intro\n- First item\n2. Second item'), ['First item', 'Second item']);
  });

  it('returns no bullets for empty or short text', () => {
    assert.deepEqual(extractBulletPoints(''), []);
    assert.deepEqual(extractBulletPoints('Short text'), []);
  });
});

describe('tailorCVBullets', () => {
  const bullets = extractBulletPoints(sampleCV);
  const keywords = extractATSKeywords(sampleJD);
  const tailored = tailorCVBullets(bullets, keywords);

  it('keeps every bullet exactly as the candidate wrote it', () => {
    assert.deepEqual([...tailored].sort(), [...bullets].sort());
  });

  it('puts bullets that mention more job-description skills first', () => {
    assert.equal(tailored[0], 'Developed web applications using JavaScript and React');
  });

  it('keeps the original order between equally relevant bullets', () => {
    assert.deepEqual(tailorCVBullets(['First', 'Second'], noKeywords), ['First', 'Second']);
  });
});

describe('findMissingSkills', () => {
  it('lists job-description skills the CV never mentions', () => {
    assert.deepEqual(findMissingSkills(sampleCV, extractATSKeywords(sampleJD)), ['python', 'ci/cd']);
  });
});

describe('calculateMatchScore', () => {
  it('scores a relevant CV well above an unrelated one', () => {
    const keywords = extractATSKeywords(sampleJD);
    const relevant = calculateMatchScore(sampleCV, sampleJD, keywords).score;
    const unrelated = calculateMatchScore('- Baked sourdough bread\n- Served customers', sampleJD, keywords).score;
    assert.ok(relevant >= 50, `relevant CV scored ${relevant}`);
    assert.ok(unrelated <= 10, `unrelated CV scored ${unrelated}`);
  });

  it('does not credit responsibilities for shared bullet characters', () => {
    const keywords = { ...noKeywords, responsibilities: ['- Manage CI/CD pipelines'] };
    assert.equal(calculateMatchScore('- Managed a busy bakery', '', keywords).score, 0);
  });

  it('stays within 0-100', () => {
    const { score } = calculateMatchScore('', '', noKeywords);
    assert.ok(score >= 0 && score <= 100);
  });
});
