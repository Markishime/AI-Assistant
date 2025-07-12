'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthProvider';
import { 
  Brain, 
  Menu, 
  X, 
  User, 
  Settings,
  LogOut,
  BarChart3,
  FileText,
  Upload,
  Home,
  HelpCircle,
  Leaf,
  History,
  Shield
} from 'lucide-react';

export function Navigation() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      // Placeholder for sign out logic
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Analyze', href: '/analyze', icon: Upload },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'History', href: '/history', icon: History },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Help', href: '/help', icon: HelpCircle },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button
              onClick={() => handleNavigation('/')}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold text-lg text-gray-900">Oil Palm AI</p>
                <p className="text-xs text-gray-500">Assistant</p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    active 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.name}
                </button>
              );
            })}
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <User className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <button
                  onClick={() => handleNavigation('/settings')}
                  className="p-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleNavigation('/login')}
                  className="px-4 py-2 text-emerald-700 border border-emerald-300 rounded-md hover:bg-emerald-50 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavigation('/register')}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    className={`w-full flex items-center px-3 py-2 rounded-md text-left transition-colors ${
                      active 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </button>
                );
              })}

              {/* Mobile User Section */}
              <div className="pt-4 border-t border-gray-200">
                {user ? (
                  <>
                    <div className="px-3 py-2 text-sm text-gray-500">
                      {user.email}
                    </div>
                    <button
                      onClick={() => handleNavigation('/settings')}
                      className="w-full flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                    >
                      <Settings className="w-5 h-5 mr-3" />
                      Settings
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center px-3 py-2 rounded-md text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleNavigation('/login')}
                      className="w-full flex items-center px-3 py-2 rounded-md text-emerald-700 hover:bg-emerald-50"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => handleNavigation('/register')}
                      className="w-full flex items-center px-3 py-2 rounded-md text-white bg-emerald-600 hover:bg-emerald-700 mt-2"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
