'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface LoadingState {
  [key: string]: boolean;
}

interface LoadingContextType {
  loading: LoadingState;
  setLoading: (key: string, isLoading: boolean) => void;
  isLoading: (key: string) => boolean;
  isAnyLoading: () => boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: React.ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [loading, setLoadingState] = useState<LoadingState>({});

  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setLoadingState(prev => ({
      ...prev,
      [key]: isLoading
    }));
  }, []);

  const isLoading = useCallback((key: string) => {
    return loading[key] || false;
  }, [loading]);

  const isAnyLoading = useCallback(() => {
    return Object.values(loading).some(Boolean);
  }, [loading]);

  return (
    <LoadingContext.Provider value={{ loading, setLoading, isLoading, isAnyLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

// Higher-order component for automatic loading management
export function withLoading<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  loadingKey: string
) {
  return function WithLoadingComponent(props: T) {
    const { isLoading } = useLoading();
    
    return (
      <WrappedComponent 
        {...props} 
        isLoading={isLoading(loadingKey)}
      />
    );
  };
}

// Hook for managing async operations with loading states
export function useAsyncOperation() {
  const { setLoading } = useLoading();

  const execute = useCallback(
    async function<T>(operation: () => Promise<T>, loadingKey: string): Promise<T> {
      try {
        setLoading(loadingKey, true);
        const result = await operation();
        return result;
      } finally {
        setLoading(loadingKey, false);
      }
    },
    [setLoading]
  );

  return { execute };
} 