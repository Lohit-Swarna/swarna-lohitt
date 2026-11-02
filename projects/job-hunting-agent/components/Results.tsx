'use client';

import React from 'react';

interface ResultsProps {
  rewrittenBullets: string[];
  coverLetter: string;
  matchScore: number;
  matchReason: string;
  atsKeywords: {
    skills: string[];
    responsibilities: string[];
    qualifications: string[];
    keywords: string[];
  };
}

export default function Results({
  rewrittenBullets,
  coverLetter,
  matchScore,
  matchReason,
  atsKeywords
}: ResultsProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const downloadAsTxt = (text: string, filename: string) => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6 w-full max-w-4xl">
      {/* Match Score Card */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-8 shadow-lg">
        <div className="text-center">
          <p className="text-sm font-medium opacity-90 mb-2">Match Score</p>
          <div className="text-6xl font-bold mb-4">{matchScore}</div>
          <div className="w-full bg-white/30 rounded-full h-2 mb-6 overflow-hidden">
            <div
              className="bg-white h-full transition-all duration-500"
              style={{ width: `${matchScore}%` }}
            />
          </div>
          <p className="text-base leading-relaxed">{matchReason}</p>
        </div>
      </div>

      {/* Tailored CV Card */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Tailored CV Bullets</h3>
        </div>
        <div className="p-6 space-y-3">
          {rewrittenBullets.map((bullet, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <span className="text-blue-500 font-bold mt-0.5">•</span>
              <p className="text-gray-700 text-sm flex-1">{bullet}</p>
            </div>
          ))}
          <div className="flex gap-3 mt-6 pt-4 border-t">
            <button
              onClick={() => downloadAsTxt(rewrittenBullets.join('\n'), 'tailored-cv.txt')}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
            >
              Download as Text
            </button>
            <button
              onClick={() => copyToClipboard(rewrittenBullets.join('\n'))}
              className="flex-1 px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition text-sm font-medium"
            >
              Copy to Clipboard
            </button>
          </div>
        </div>
      </div>

      {/* Cover Letter Card */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Cover Letter (150 words)</h3>
        </div>
        <div className="p-6">
          <div className="bg-gray-50 p-4 rounded-lg mb-4 max-h-64 overflow-y-auto">
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{coverLetter}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => downloadAsTxt(coverLetter, 'cover-letter.txt')}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-medium"
            >
              Download
            </button>
            <button
              onClick={() => copyToClipboard(coverLetter)}
              className="flex-1 px-4 py-2 border border-green-500 text-green-500 rounded-lg hover:bg-green-50 transition text-sm font-medium"
            >
              Copy
            </button>
          </div>
        </div>
      </div>

      {/* ATS Keywords Card */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Extracted ATS Keywords</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {atsKeywords.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {atsKeywords.keywords.map((keyword, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
