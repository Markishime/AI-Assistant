'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

// Dynamically import the Providers to prevent SSR issues
const Providers = dynamic(
  () => import('./Providers').then((mod) => ({ default: mod.Providers })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    ),
  }
);

export function RootProviders({ children }: { children: ReactNode }) {
  return <Providers>{children}</Providers>;
}
