import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RAS Saathi: RPSC RAS Exam Preparation",
  description: "Syllabus tracker, PYQ bank, mock tests, study analytics and mains answer practice for RPSC RAS.",
};

export const viewport: Viewport = { themeColor: "#f97316" };

const themeScript = `try{var t=localStorage.getItem('ras-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>{children}</body>
    </html>
  );
}
