'use client';

import { useState } from 'react';
import CVUpload from '@/components/CVUpload';
import JDInput from '@/components/JDInput';
import Results from '@/components/Results';

interface ProcessResult {
  success: boolean;
  originalBullets: string[];
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
  sheetsData: {
    date: string;
    company: string;
    role: string;
    jdLink: string;
    matchScore: number;
    status: string;
  };
}

export default function Home() {
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jdData, setJdData] = useState({
    text: '',
    link: '',
    company: '',
    role: ''
  });
  const [results, setResults] = useState<ProcessResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async () => {
    if (!cvFile || !jdData.text) {
      setError('Please upload a CV and provide job description');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('cv', cvFile);
      formData.append('jdText', jdData.text);
      formData.append('jdLink', jdData.link);
      formData.append('companyName', jdData.company);
      formData.append('role', jdData.role);

      const response = await fetch('/api/process', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Processing failed');
      }

      const data: ProcessResult = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Job Hunting Agent
          </h1>
          <p className="text-xl text-gray-600">
            Tailor your CV and generate cover letters that match job descriptions
          </p>
        </div>

        {/* Main Content */}
        {!results ? (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            {/* Input Section */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Upload Your CV</h2>
                <CVUpload onFileSelect={setCvFile} />
              </div>

              <div className="border-t pt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 2: Paste Job Description</h2>
                <JDInput
                  onJDChange={(text, link, company, role) => {
                    setJdData({ text, link, company, role });
                  }}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="border-t pt-8 flex justify-center">
                <button
                  onClick={handleProcess}
                  disabled={loading}
                  className={`px-8 py-3 rounded-lg font-semibold text-white transition text-lg ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                  }`}
                >
                  {loading ? 'Processing...' : 'Generate Results'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-center mb-8">
              <button
                onClick={() => {
                  setResults(null);
                  setCvFile(null);
                  setJdData({ text: '', link: '', company: '', role: '' });
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Start New Analysis
              </button>
            </div>
            <Results
              rewrittenBullets={results.rewrittenBullets}
              coverLetter={results.coverLetter}
              matchScore={results.matchScore}
              matchReason={results.matchReason}
              atsKeywords={results.atsKeywords}
            />
          </div>
        )}
      </div>
    </div>
  );
}
