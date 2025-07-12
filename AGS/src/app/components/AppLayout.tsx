'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import Navbar from './Navbar';

interface AppLayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
}

export default function AppLayout({ children, showNavbar = true }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!showNavbar) {
    return (
      <div className="h-screen w-screen bg-gray-50">
        {children}
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <Navbar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      
      {/* Main Content - Takes remaining space */}
      <main className="flex-1 w-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}