'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronLeft, MoreVertical, Search } from 'lucide-react';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  navigation?: React.ReactNode;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
  title?: string;
  actions?: React.ReactNode;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  navigation,
  header,
  sidebar,
  showBackButton = false,
  onBack,
  title,
  actions,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      {isMobile && (
        <header className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center space-x-3">
              {showBackButton && onBack && (
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              
              {sidebar && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}
              
              {title && (
                <h1 className="text-lg font-semibold text-gray-900 truncate">
                  {title}
                </h1>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {actions && (
                <div className="flex items-center space-x-1">
                  {actions}
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Desktop Header */}
      {!isMobile && header && (
        <header className="bg-white shadow-sm border-b sticky top-0 z-40">
          {header}
        </header>
      )}

      <div className="flex">
        {/* Sidebar */}
        {sidebar && (
          <>
            {/* Mobile Sidebar Overlay */}
            {isMobile && sidebarOpen && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-50"
                onClick={closeSidebar}
              />
            )}

            {/* Sidebar Content */}
            <aside className={`
              ${isMobile 
                ? `fixed left-0 top-0 h-full w-80 bg-white z-50 transform transition-transform duration-300 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                  }`
                : 'w-64 bg-white border-r border-gray-200 sticky top-16 h-screen overflow-y-auto'
              }
            `}>
              {isMobile && (
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-lg font-semibold">Menu</h2>
                  <button
                    onClick={closeSidebar}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
              
              <div className={isMobile ? 'p-4' : ''}>
                {sidebar}
              </div>
            </aside>
          </>
        )}

        {/* Main Content */}
        <main className={`
          flex-1 min-h-screen
          ${isMobile ? 'p-4' : 'p-6'}
          ${sidebar && !isMobile ? 'ml-0' : ''}
        `}>
          {/* Desktop Title Bar */}
          {!isMobile && title && (
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                {showBackButton && onBack && (
                  <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              </div>
              {actions && (
                <div className="flex items-center space-x-3">
                  {actions}
                </div>
              )}
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
};

// Mobile-optimized card component
export const MobileCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}> = ({ children, className = '', padding = 'md', onClick }) => {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div 
      className={`
        bg-white rounded-lg border border-gray-200 shadow-sm
        ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow active:scale-95' : ''}
        ${paddingClasses[padding]}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// Mobile-optimized button component
export const MobileButton: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  disabled = false,
  onClick,
  className = ''
}) => {
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 flex items-center justify-center active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-3 text-base min-h-[44px]',
    lg: 'px-6 py-4 text-lg min-h-[52px]',
  };

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// Mobile-optimized form input
export const MobileInput: React.FC<{
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}> = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  error,
  required = false,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-4 py-3 border border-gray-300 rounded-lg text-base
          focus:ring-2 focus:ring-green-500 focus:border-green-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
        `}
      />
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

// Mobile-optimized grid
export const MobileGrid: React.FC<{
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ children, cols = 2, gap = 'md', className = '' }) => {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  return (
    <div className={`
      grid grid-cols-1 
      sm:grid-cols-${Math.min(cols, 2)} 
      lg:grid-cols-${cols}
      ${gapClasses[gap]}
      ${className}
    `}>
      {children}
    </div>
  );
};

// Touch-friendly action sheet
export const ActionSheet: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  actions: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'destructive';
  }>;
}> = ({ isOpen, onClose, title, actions }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="bg-white rounded-t-2xl w-full max-h-[80vh] overflow-hidden">
        {title && (
          <div className="p-4 border-b border-gray-200 text-center">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        )}
        
        <div className="p-4 space-y-2">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.onClick();
                onClose();
              }}
              className={`
                w-full p-4 rounded-lg text-left flex items-center space-x-3
                transition-colors
                ${action.variant === 'destructive' 
                  ? 'text-red-600 hover:bg-red-50' 
                  : 'text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              {action.icon && (
                <span className="flex-shrink-0">{action.icon}</span>
              )}
              <span className="font-medium">{action.label}</span>
            </button>
          ))}
          
          <button
            onClick={onClose}
            className="w-full p-4 rounded-lg text-center font-medium text-gray-600 hover:bg-gray-50 border-t border-gray-200 mt-4"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}; 