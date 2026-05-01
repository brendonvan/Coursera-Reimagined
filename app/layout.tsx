import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Coursera Reimagined',
  description: 'AI-powered e-learning platform with RAG-based course assistant',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
