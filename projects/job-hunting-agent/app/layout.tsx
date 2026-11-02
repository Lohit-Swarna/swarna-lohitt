import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Job Hunting Agent - CV Tailoring & Cover Letter Generator",
  description: "Tailor your CV to job descriptions with ATS optimization. Generate custom cover letters and get match scores instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
