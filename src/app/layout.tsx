import type { Metadata } from 'next';
import './globals.css';

/**
 * RootLayout — Top-level layout for the Quantum Nexus application.
 * Provides HTML structure, global metadata, and font configuration.
 * @module Platform Core
 * @phase 1
 */
export const metadata: Metadata = {
  title: 'Quantum Nexus',
  description: 'AI-Powered Business Operating System',
};

/**
 * RootLayout component wrapping all pages with global HTML structure.
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child page content
 * @returns {JSX.Element} Root HTML layout
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
