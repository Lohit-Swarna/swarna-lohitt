# Job Hunting Agent 🎯

A powerful web application that helps job seekers tailor their CVs and generate customized cover letters using ATS (Applicant Tracking System) keyword optimization.

## Features

✨ **Smart CV Tailoring**
- Upload your CV in PDF format
- Paste job descriptions or provide URLs
- Automatically extract ATS keywords from job postings
- Rewrite CV bullet points to include relevant keywords without inventing experience
- Download tailored CV as text file

📝 **AI-Powered Cover Letters**
- Generate 150-word cover letters with a confident-but-warm tone
- Automatically personalized based on job requirements
- Copy to clipboard for easy sharing

📊 **Match Score Analysis**
- Get a 0-100 match score between your CV and job description
- Receive 2-line reasoning explaining the score
- Identify key skill gaps and alignment opportunities

📋 **Google Sheets Integration**
- Auto-log each application to your personal Google Sheet
- Track Date, Company, Role, JD Link, Match Score, and Application Status
- Build a comprehensive job search history

🎨 **User-Friendly Interface**
- Single-page, responsive design
- Three main sections: CV Upload, JD Input, Generate Button
- Beautiful card-based results display
- Copy and download functionality for all results

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- A PDF copy of your CV

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd swarna-lohitt
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables** (Optional - for Google Sheets logging)
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Google Sheets API credentials:
```
NEXT_PUBLIC_GOOGLE_SHEETS_ID=your_sheet_id
GOOGLE_SHEETS_API_KEY=your_api_key
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
npm start
```

## How to Use

### Step 1: Upload Your CV
- Click the drag-and-drop area or browse to select your CV (PDF format)
- Your CV text will be parsed automatically

### Step 2: Provide Job Description
- Choose between two input modes:
  - **Paste JD Text**: Directly paste the job description text
  - **JD Link**: Provide a URL to the job posting (experimental)
- Enter company name and job role
- Keywords will be extracted automatically

### Step 3: Generate Results
- Click the "Generate Results" button
- The system will:
  - Extract ATS keywords from the JD
  - Rewrite your CV bullets to include relevant keywords
  - Generate a custom cover letter
  - Calculate a match score
  - Prepare data for Google Sheets logging

### Step 4: Review and Use Results
- **Tailored CV Bullets**: Review rewritten bullet points, copy or download
- **Cover Letter**: Read the generated cover letter, copy or download
- **Match Score**: See your score and reasoning
- **ATS Keywords**: View extracted skills and keywords

## Technology Stack

### Frontend
- **Next.js 16+** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework

### Backend
- **Next.js API Routes** - Serverless backend
- **Node.js** - Runtime environment
- **pdf-parse** - PDF text extraction
- **googleapis** - Google Sheets integration

### Services
- **Google Sheets API** - Auto-logging functionality
- **Vercel** - Recommended deployment platform

## API Endpoints

### POST `/api/process`
Process a CV and job description to generate tailored results.

**Request:**
```json
{
  "cv": File,
  "jdText": "Job description text",
  "jdLink": "https://...",
  "companyName": "Company Name",
  "role": "Job Title"
}
```

**Response:**
```json
{
  "success": true,
  "originalBullets": ["bullet 1", "bullet 2"],
  "rewrittenBullets": ["rewritten 1", "rewritten 2"],
  "coverLetter": "Generated cover letter text...",
  "matchScore": 75,
  "matchReason": "Strong match with 5/6 required skills.",
  "atsKeywords": {
    "skills": ["Python", "React", "AWS"],
    "responsibilities": ["Development", "Debugging"],
    "qualifications": ["BS in CS"],
    "keywords": ["Agile", "DevOps"]
  },
  "sheetsData": {
    "date": "2024-01-15",
    "company": "Company Name",
    "role": "Job Title",
    "jdLink": "https://...",
    "matchScore": 75,
    "status": "Applied"
  }
}
```

## Project Structure

```
swarna-lohitt/
├── app/
│   ├── api/
│   │   └── process/
│   │       └── route.ts          # Main API endpoint
│   ├── page.tsx                  # Home page with form
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/
│   ├── CVUpload.tsx              # CV upload component
│   ├── JDInput.tsx               # JD input component
│   └── Results.tsx               # Results display component
├── lib/
│   ├── pdfProcessor.ts           # PDF text extraction
│   ├── processing.ts             # Core processing logic
│   ├── coverLetter.ts            # Cover letter generation
│   └── googleSheets.ts           # Google Sheets integration
├── package.json
├── tsconfig.json
└── next.config.ts
```

## Features & Algorithms

### ATS Keyword Extraction
- Identifies common tech skills and frameworks
- Extracts responsibility keywords from JD
- Filters and deduplicates keywords
- Returns top 10 most relevant keywords

### CV Bullet Point Rewriting
- Preserves original experience (no fabrication)
- Injects relevant skills where appropriate
- Maintains professional tone
- Adds missing keywords naturally

### Match Score Calculation
- **Skill Matching (40%)**: CV skills vs JD requirements
- **Keyword Matching (30%)**: General keyword overlap
- **Responsibility Matching (30%)**: Experience alignment
- Score: 0-100 scale with reasoning

### Cover Letter Generation
- **Tone**: Confident but warm and approachable
- **Length**: ~150 words
- **Personalization**: Uses company name, role, and CV info
- **Structure**: Professional greeting, compelling body, strong closing

## Google Sheets Setup (Optional)

To enable automatic logging to Google Sheets:

1. Create a Google Sheet with these columns:
   - Date
   - Company
   - Role
   - JD Link
   - Match Score
   - Status

2. Share the sheet with your service account email

3. Set environment variables in `.env.local`

4. The app will auto-log each application

## Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
```bash
git push origin main
```

2. **Connect to Vercel**
- Visit https://vercel.com
- Import your GitHub repository
- Set environment variables
- Deploy!

### Deploy to Other Platforms

The application can be deployed to:
- **Railway**: `railway up`
- **Netlify**: Connect GitHub repo
- **Docker**: Build with `docker build .`
- **Traditional Server**: `npm start` after `npm run build`

## Configuration

### Environment Variables
```env
# Optional: Google Sheets Integration
NEXT_PUBLIC_GOOGLE_SHEETS_ID=your_sheet_id
GOOGLE_SHEETS_API_KEY=your_api_key

# Optional: Custom API endpoint
NEXT_PUBLIC_API_URL=https://your-api.com
```

### Performance Optimization
- PDF files up to 50MB supported
- Async processing for large documents
- Caching of extracted keywords
- CDN-friendly build output

## Limitations & Future Enhancements

### Current Limitations
- URL-based JD extraction is basic (text/html only)
- Google Sheets logging requires manual setup
- No authentication/user accounts yet
- No PDF generation (text download only)

### Planned Features
- 🔐 User authentication and saved profiles
- 📊 Enhanced analytics dashboard
- 🎨 PDF generation for tailored CVs
- 🌐 Multi-language support
- 🔗 LinkedIn integration
- 📧 Direct email submission
- 🤖 Advanced NLP for better keyword extraction
- 💾 Database storage for applications

## Troubleshooting

### PDF Upload Issues
- Ensure file is valid PDF format
- Check file size (max 50MB)
- Try opening the PDF in another app first

### Poor Match Scores
- Job descriptions may be too specific
- CV might need better keyword density
- Consider adding more relevant experience

### Google Sheets Not Logging
- Check API credentials in `.env.local`
- Verify sheet is shared with service account
- Check browser console for error messages

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing discussions
- Review the troubleshooting section above

## Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- PDF processing with [pdf-parse](https://github.com/modesty/pdf-parse)
- API integration with [Google Sheets API](https://developers.google.com/sheets)

---

**Good luck with your job search! 🚀**
