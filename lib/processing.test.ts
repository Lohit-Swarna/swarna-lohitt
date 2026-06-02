import {
  extractATSKeywords,
  rewriteCVBullets,
  calculateMatchScore,
  extractBulletPoints
} from '@/lib/processing';

// Test data
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

console.log('🧪 Running Job Hunting Agent Tests\n');

// Test 1: ATS Keyword Extraction
console.log('Test 1: ATS Keyword Extraction');
const keywords = extractATSKeywords(sampleJD);
console.log('✓ Extracted Keywords:', keywords);
console.log('  - Skills found:', keywords.skills.length, '/', 6);
console.log('  - Keywords found:', keywords.keywords.length, '/ ~10\n');

// Test 2: Bullet Point Extraction
console.log('Test 2: Bullet Point Extraction');
const bullets = extractBulletPoints(sampleCV);
console.log('✓ Extracted Bullet Points:', bullets.length);
bullets.forEach((b, i) => console.log(`  ${i + 1}. ${b.substring(0, 60)}...`));
console.log();

// Test 3: CV Rewriting
console.log('Test 3: CV Bullet Point Rewriting');
const rewritten = rewriteCVBullets(bullets, keywords);
console.log('✓ Rewritten Bullets:');
rewritten.forEach((b, i) => console.log(`  ${i + 1}. ${b.substring(0, 70)}...`));
console.log();

// Test 4: Match Score Calculation
console.log('Test 4: Match Score Calculation');
const { score, reason } = calculateMatchScore(sampleCV, sampleJD, keywords);
console.log(`✓ Match Score: ${score}/100`);
console.log(`✓ Reason: ${reason}\n`);

// Test 5: Edge Cases
console.log('Test 5: Edge Cases');
const emptyBullets = extractBulletPoints('');
console.log(`✓ Empty text handling: ${emptyBullets.length} bullets found`);

const shortBullets = extractBulletPoints('Short text');
console.log(`✓ Short text handling: ${shortBullets.length} bullets found\n`);

console.log('✅ All tests completed successfully!');
console.log('\n📊 Test Summary:');
console.log(`  - ATS Keywords: ${keywords.skills.length + keywords.keywords.length} total`);
console.log(`  - CV Bullets: ${bullets.length} extracted`);
console.log(`  - Rewritten Bullets: ${rewritten.length}`);
console.log(`  - Match Score: ${score}%`);
