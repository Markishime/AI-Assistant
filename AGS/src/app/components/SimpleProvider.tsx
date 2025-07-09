'use client';

import { ReactNode } from 'react';

// Simple provider that wraps HeroUI without Firebase dependencies
export function SimpleProvider({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
