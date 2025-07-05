'use client';

import { ReactNode } from 'react';
import { HeroUIProvider } from '@heroui/react';
import { AuthProvider } from './AuthProvider';
import { NotificationProvider } from './NotificationProvider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <HeroUIProvider>
      <AuthProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </AuthProvider>
    </HeroUIProvider>
  );
}
