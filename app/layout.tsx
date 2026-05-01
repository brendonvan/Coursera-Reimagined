import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Coursera Reimagined',
  description: 'AI-powered e-learning platform with RAG-based course assistant',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`html,body{background-color:#091A2F;color:#E5E7EB}`}</style>
      </head>
      <body className="antialiased bg-[#091a2f] text-[#E5E7EB]">{children}</body>
    </html>
  );
}
