'use client';

import React from 'react';
import { motion } from 'framer-motion';

// Base skeleton component with animation
const SkeletonBase: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

// Document card skeleton
export const DocumentCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
      <div className="w-8 h-8 bg-gray-200 rounded"></div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
    <div className="flex justify-between items-center mb-4">
      <div className="flex space-x-2">
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-4 mb-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="text-center">
          <div className="h-6 bg-gray-200 rounded w-8 mx-auto mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
        </div>
      ))}
    </div>
    <div className="flex space-x-2">
      <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
      <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
    </div>
  </div>
);

// Report card skeleton
export const ReportCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
      <div className="flex items-center space-x-2">
        <div className="w-5 h-5 bg-gray-200 rounded"></div>
        <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
      </div>
    </div>
    <div className="mb-4">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded mb-3"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
    <div className="flex flex-wrap gap-2 mb-4">
      <div className="h-6 bg-gray-200 rounded-full w-20"></div>
      <div className="h-6 bg-gray-200 rounded-full w-16"></div>
      <div className="h-6 bg-gray-200 rounded-full w-24"></div>
    </div>
    <div className="grid grid-cols-2 gap-4 mb-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i}>
          <div className="h-6 bg-gray-200 rounded w-8 mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
      ))}
    </div>
    <div className="flex space-x-2">
      <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
      <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
    </div>
  </div>
);

// History timeline skeleton
export const HistoryTimelineSkeleton: React.FC = () => (
  <div className="relative">
    <div className="flex items-start space-x-6">
      <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
      <div className="flex-1 bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <div className="h-5 bg-gray-200 rounded w-2/3"></div>
              <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            </div>
            <div className="flex items-center space-x-4 mb-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-20"></div>
              ))}
            </div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-200 rounded w-4/5"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-6 bg-gray-200 rounded-full w-16"></div>
              ))}
            </div>
          </div>
          <div className="flex flex-col space-y-2 ml-4">
            <div className="w-24 h-10 bg-gray-200 rounded-lg"></div>
            <div className="w-24 h-10 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="text-center">
              <div className="h-6 bg-gray-200 rounded w-8 mx-auto mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// FAQ skeleton
export const FAQSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="flex items-center space-x-4">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-6 bg-gray-200 rounded-full w-24"></div>
        </div>
      </div>
      <div className="w-5 h-5 bg-gray-200 rounded"></div>
    </div>
  </div>
);

// Help section card skeleton
export const HelpSectionSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
      <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
    </div>
    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
    <div className="flex items-center justify-between">
      <div className="h-4 bg-gray-200 rounded w-20"></div>
      <div className="w-4 h-4 bg-gray-200 rounded"></div>
    </div>
  </div>
);

// Grid layout skeleton wrapper
export const GridSkeleton: React.FC<{
  children: React.ReactNode;
  columns?: number;
  gap?: number;
}> = ({ children, columns = 3, gap = 6 }) => (
  <div 
    className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-${gap}`}
    style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
  >
    {children}
  </div>
);

// Loading spinner with text
export const LoadingSpinner: React.FC<{ 
  text?: string; 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ 
  text = 'Loading...', 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center py-8 ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]} mb-4`}></div>
      <p className="text-gray-600 text-sm">{text}</p>
    </div>
  );
};

// Page loading skeleton
export const PageLoadingSkeleton: React.FC<{
  title?: string;
  showStats?: boolean;
  showFilters?: boolean;
  cardType?: 'document' | 'report' | 'history' | 'help';
  cardCount?: number;
}> = ({
  title = 'Loading...',
  showStats = false,
  showFilters = false,
  cardType = 'document',
  cardCount = 6
}) => {
  const getCardSkeleton = () => {
    switch (cardType) {
      case 'document': return <DocumentCardSkeleton />;
      case 'report': return <ReportCardSkeleton />;
      case 'history': return <HistoryTimelineSkeleton />;
      case 'help': return <HelpSectionSkeleton />;
      default: return <DocumentCardSkeleton />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header skeleton */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-96"></div>
            
            {showStats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white/70 rounded-lg p-3 border border-gray-200">
                    <div className="h-6 bg-gray-200 rounded w-8 mx-auto mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
                  </div>
                ))}
              </div>
            )}
            
            {showFilters && (
              <div className="flex flex-col lg:flex-row gap-4 mt-6">
                <div className="flex-1 h-12 bg-gray-200 rounded-xl"></div>
                <div className="flex gap-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="w-32 h-12 bg-gray-200 rounded-xl"></div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {cardType === 'history' ? (
          <div className="space-y-8">
            {Array.from({ length: cardCount }).map((_, index) => (
              <div key={index}>
                {getCardSkeleton()}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: cardCount }).map((_, index) => (
              <div key={index}>
                {getCardSkeleton()}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Shimmer effect for enhanced loading
export const ShimmerEffect: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`relative overflow-hidden ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
  </div>
);

// Add the shimmer animation to global CSS or use style tag
const shimmerStyles = `
  @keyframes shimmer {
    100% {
      transform: translateX(100%);
    }
  }
`;

// Inject styles if needed
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = shimmerStyles;
  document.head.appendChild(style);
}

export default {
  DocumentCardSkeleton,
  ReportCardSkeleton,
  HistoryTimelineSkeleton,
  FAQSkeleton,
  HelpSectionSkeleton,
  GridSkeleton,
  LoadingSpinner,
  PageLoadingSkeleton,
  ShimmerEffect
}; 