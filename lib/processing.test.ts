import assert from 'node:assert/strict';
import test from 'node:test';
import {
  extractATSKeywords, rewriteCVBullets, calculateMatchScore, extractBulletPoints,
} from './processing.ts';

test('recognizes a literal C++ skill without regex escape characters', () => {
  assert.ok(extractATSKeywords('Required skills: C++ and Python').skills.includes('c++'));
});

test('does not skip adjacent responsibility lines because of RegExp.lastIndex', () => {
  const lines = ['Develop web applications', 'Develop APIs', 'Develop internal tools'];
  assert.deepEqual(extractATSKeywords(lines.join('\n')).responsibilities, lines);
});

test('does not skip adjacent qualification lines because of RegExp.lastIndex', () => {
  const lines = ['Requirements: Python', 'Requirements: SQL', 'Requirements: Docker'];
  assert.deepEqual(extractATSKeywords(lines.join('\n')).qualifications, lines);
});

test('extracts both named skills from a short job description', () => {
  const skills = extractATSKeywords('Use React and Python to develop applications').skills;
  assert.ok(skills.includes('react'));
  assert.ok(skills.includes('python'));
});

test('extracts numbered and marked CV bullet points', () => {
  assert.deepEqual(extractBulletPoints('Experience\n- Built APIs\n1. Reduced latency\n* Maintained tests'),
    ['Built APIs', 'Reduced latency', 'Maintained tests']);
});

test('empty or short input produces no bullet points', () => {
  assert.deepEqual(extractBulletPoints(''), []);
  assert.deepEqual(extractBulletPoints('Short text'), []);
});

test('rewriting preserves the number of submitted bullet points', () => {
  const bullets = ['Developed a service', 'Maintained a release process'];
  assert.equal(rewriteCVBullets(bullets, extractATSKeywords('Python developer')).length, bullets.length);
});

test('match score is finite and bounded for empty and populated inputs', () => {
  for (const [cv, jd] of [['', ''], ['Python Docker', 'Python Docker developer']]) {
    const {score, reason} = calculateMatchScore(cv, jd, extractATSKeywords(jd));
    assert.ok(Number.isFinite(score));
    assert.ok(score >= 0 && score <= 100);
    assert.equal(typeof reason, 'string');
  }
});
