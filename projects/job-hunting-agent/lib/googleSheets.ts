export interface SheetRow {
  date: string;
  company: string;
  role: string;
  jdLink: string;
  matchScore: number;
  status: string;
}

/**
 * Format an application as a row for a job-tracking spreadsheet.
 * Writing to Google Sheets is not implemented; the API returns this row for the user to copy.
 */
export function formatForSheets(
  company: string,
  role: string,
  jdLink: string,
  matchScore: number
): SheetRow {
  return {
    date: new Date().toISOString().split('T')[0],
    company,
    role,
    jdLink,
    matchScore,
    status: 'Applied'
  };
}
