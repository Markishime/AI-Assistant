import React from 'react';
import './globals.css';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './components/AuthProvider';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Oil Palm AI Assistant',
  description: 'Advanced soil and leaf analysis for optimal crop management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}