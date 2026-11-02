'use client';

import React, { useState } from 'react';

interface JDInputProps {
  onJDChange: (text: string, link: string, company: string, role: string) => void;
}

export default function JDInput({ onJDChange }: JDInputProps) {
  const [jdText, setJdText] = useState('');
  const [jdLink, setJdLink] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [inputMode, setInputMode] = useState<'text' | 'url'>('text');

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setJdText(text);
    onJDChange(text, jdLink, companyName, role);
  };

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const link = e.target.value;
    setJdLink(link);
    // In production, fetch the JD from the URL
    onJDChange(jdText, link, companyName, role);
  };

  return (
    <div className="w-full max-w-2xl space-y-4">
      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="text"
            checked={inputMode === 'text'}
            onChange={(e) => setInputMode(e.target.value as 'text' | 'url')}
          />
          <span className="text-sm font-medium">Paste JD Text</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="url"
            checked={inputMode === 'url'}
            onChange={(e) => setInputMode(e.target.value as 'text' | 'url')}
          />
          <span className="text-sm font-medium">JD Link</span>
        </label>
      </div>

      {inputMode === 'text' ? (
        <textarea
          value={jdText}
          onChange={handleTextChange}
          placeholder="Paste the job description here..."
          className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <input
          type="url"
          value={jdLink}
          onChange={handleLinkChange}
          placeholder="Enter the job posting URL..."
          className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="text"
          value={companyName}
          onChange={(e) => {
            setCompanyName(e.target.value);
            onJDChange(jdText, jdLink, e.target.value, role);
          }}
          placeholder="Company name"
          className="p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            onJDChange(jdText, jdLink, companyName, e.target.value);
          }}
          placeholder="Job role/title"
          className="p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
