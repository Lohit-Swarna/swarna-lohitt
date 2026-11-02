import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { generateCoverLetter } from './coverLetter.ts';

const keywords = (skills: string[]) => ({ skills, responsibilities: [], qualifications: [], keywords: [] });

describe('generateCoverLetter', () => {
  it('names the company, role and top skills', () => {
    const letter = generateCoverLetter('Acme', 'Data Analyst', 'Jane Doe\nAnalyst', keywords(['sql', 'python', 'aws']));
    assert.match(letter, /Data Analyst position at Acme/);
    assert.match(letter, /sql and python/);
  });

  it('signs with the name found at the top of the CV', () => {
    const letter = generateCoverLetter('Acme', 'Analyst', 'Jane Doe\nAnalyst', keywords(['sql']));
    assert.ok(letter.trimEnd().endsWith('Jane Doe'));
  });

  it('reads correctly when no skills or name were found', () => {
    const letter = generateCoverLetter('Acme', 'Analyst', 'no capitalised name here', keywords([]));
    assert.doesNotMatch(letter, /background in\s+and/);
    assert.ok(!letter.trimEnd().endsWith('Hiring Manager'), 'letter must not be signed by the hiring manager');
  });
});
