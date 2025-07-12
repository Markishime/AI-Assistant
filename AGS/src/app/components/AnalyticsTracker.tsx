'use client';

import React, { createContext, useContext, useCallback, useEffect } from 'react';

// Analytics event types
interface AnalyticsEvent {
  eventName: string;
  eventCategory: string;
  eventAction: string;
  eventLabel?: string;
  eventValue?: number;
  customDimensions?: { [key: string]: any };
  userId?: string;
  sessionId: string;
  timestamp: number;
  page: string;
  userAgent: string;
}

interface UserSession {
  sessionId: string;
  userId?: string;
  startTime: number;
  lastActivity: number;
  pageViews: number;
  events: number;
  referrer: string;
  userAgent: string;
}

interface AnalyticsContextType {
  trackEvent: (event: Omit<AnalyticsEvent, 'sessionId' | 'timestamp' | 'page' | 'userAgent'>) => void;
  trackPageView: (page: string, title?: string) => void;
  trackUserAction: (action: string, element: string, additionalData?: any) => void;
  trackPerformance: (metric: string, value: number, unit?: string) => void;
  trackError: (error: Error, context?: string) => void;
  setUserId: (userId: string) => void;
  getSessionData: () => UserSession | null;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

interface AnalyticsProviderProps {
  children: React.ReactNode;
  enabled?: boolean;
  endpoint?: string;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({
  children,
  enabled = true,
  endpoint = '/api/analytics/track',
}) => {
  const [session, setSession] = React.useState<UserSession | null>(null);

  // Initialize session
  useEffect(() => {
    if (!enabled) return;

    const sessionId = generateSessionId();
    const newSession: UserSession = {
      sessionId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: 0,
      events: 0,
      referrer: document.referrer || 'direct',
      userAgent: navigator.userAgent,
    };

    setSession(newSession);

    // Track initial page view
    trackPageView(window.location.pathname, document.title);

    // Track session end on beforeunload
    const handleBeforeUnload = () => {
      if (newSession) {
        sendAnalytics({
          eventName: 'session_end',
          eventCategory: 'engagement',
          eventAction: 'session_end',
          eventValue: Date.now() - newSession.startTime,
          customDimensions: {
            duration: Date.now() - newSession.startTime,
            pageViews: newSession.pageViews,
            events: newSession.events,
          },
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled]);

  // Track user activity
  useEffect(() => {
    if (!enabled || !session) return;

    const activityEvents = ['click', 'scroll', 'keydown', 'mousemove'];
    let lastActivity = Date.now();

    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivity > 30000) { // 30 seconds threshold
        setSession(prev => prev ? { ...prev, lastActivity: now } : null);
        lastActivity = now;
      }
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [enabled, session]);

  const sendAnalytics = useCallback(async (eventData: Partial<AnalyticsEvent>) => {
    if (!enabled || !session) return;

    const event: AnalyticsEvent = {
      sessionId: session.sessionId,
      timestamp: Date.now(),
      page: window.location.pathname,
      userAgent: navigator.userAgent,
      userId: session.userId,
      eventName: eventData.eventName || 'unknown',
      eventCategory: eventData.eventCategory || 'general',
      eventAction: eventData.eventAction || 'unknown',
      eventLabel: eventData.eventLabel,
      eventValue: eventData.eventValue,
      customDimensions: eventData.customDimensions,
    };

    try {
      // Send to analytics endpoint
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      // Update session event count
      setSession(prev => prev ? { ...prev, events: prev.events + 1 } : null);

    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }, [enabled, session, endpoint]);

  const trackEvent = useCallback((event: Omit<AnalyticsEvent, 'sessionId' | 'timestamp' | 'page' | 'userAgent'>) => {
    sendAnalytics(event);
  }, [sendAnalytics]);

  const trackPageView = useCallback((page: string, title?: string) => {
    sendAnalytics({
      eventName: 'page_view',
      eventCategory: 'navigation',
      eventAction: 'page_view',
      eventLabel: page,
      customDimensions: {
        title: title || document.title,
        referrer: document.referrer,
      },
    });

    // Update session page view count
    setSession(prev => prev ? { ...prev, pageViews: prev.pageViews + 1 } : null);
  }, [sendAnalytics]);

  const trackUserAction = useCallback((action: string, element: string, additionalData?: any) => {
    sendAnalytics({
      eventName: 'user_action',
      eventCategory: 'interaction',
      eventAction: action,
      eventLabel: element,
      customDimensions: additionalData,
    });
  }, [sendAnalytics]);

  const trackPerformance = useCallback((metric: string, value: number, unit?: string) => {
    sendAnalytics({
      eventName: 'performance_metric',
      eventCategory: 'performance',
      eventAction: metric,
      eventValue: value,
      customDimensions: {
        unit: unit || 'ms',
        page: window.location.pathname,
      },
    });
  }, [sendAnalytics]);

  const trackError = useCallback((error: Error, context?: string) => {
    sendAnalytics({
      eventName: 'error',
      eventCategory: 'error',
      eventAction: error.name,
      eventLabel: error.message,
      customDimensions: {
        stack: error.stack,
        context,
        page: window.location.pathname,
      },
    });
  }, [sendAnalytics]);

  const setUserId = useCallback((userId: string) => {
    setSession(prev => prev ? { ...prev, userId } : null);
  }, []);

  const getSessionData = useCallback(() => session, [session]);

  const value: AnalyticsContextType = {
    trackEvent,
    trackPageView,
    trackUserAction,
    trackPerformance,
    trackError,
    setUserId,
    getSessionData,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

// HOC for automatic event tracking
export function withAnalytics<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  options: {
    trackMount?: boolean;
    trackUnmount?: boolean;
    trackProps?: (keyof T)[];
  } = {}
) {
  return function AnalyticsWrappedComponent(props: T) {
    const { trackEvent } = useAnalytics();
    const componentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

    useEffect(() => {
      if (options.trackMount) {
        trackEvent({
          eventName: 'component_mount',
          eventCategory: 'component',
          eventAction: 'mount',
          eventLabel: componentName,
        });
      }

      return () => {
        if (options.trackUnmount) {
          trackEvent({
            eventName: 'component_unmount',
            eventCategory: 'component',
            eventAction: 'unmount',
            eventLabel: componentName,
          });
        }
      };
    }, []);

    // Track prop changes
    useEffect(() => {
      if (options.trackProps && options.trackProps.length > 0) {
        const trackedProps = options.trackProps.reduce((acc, key) => {
          acc[key as string] = props[key];
          return acc;
        }, {} as any);

        trackEvent({
          eventName: 'component_props_change',
          eventCategory: 'component',
          eventAction: 'props_change',
          eventLabel: componentName,
          customDimensions: trackedProps,
        });
      }
    }, options.trackProps?.map(key => props[key]));

    return <WrappedComponent {...props} />;
  };
}

// Hook for tracking specific interactions
export const useTrackingEvents = () => {
  const { trackUserAction, trackEvent } = useAnalytics();

  const trackClick = useCallback((elementId: string, additionalData?: any) => {
    trackUserAction('click', elementId, additionalData);
  }, [trackUserAction]);

  const trackFormSubmit = useCallback((formId: string, formData?: any) => {
    trackUserAction('form_submit', formId, formData);
  }, [trackUserAction]);

  const trackDownload = useCallback((fileName: string, fileType?: string) => {
    trackEvent({
      eventName: 'file_download',
      eventCategory: 'download',
      eventAction: 'download',
      eventLabel: fileName,
      customDimensions: { fileType },
    });
  }, [trackEvent]);

  const trackSearch = useCallback((query: string, resultsCount?: number) => {
    trackEvent({
      eventName: 'search',
      eventCategory: 'search',
      eventAction: 'search_query',
      eventLabel: query,
      eventValue: resultsCount,
      customDimensions: { query, resultsCount },
    });
  }, [trackEvent]);

  const trackFeatureUsage = useCallback((featureName: string, action: string, value?: number) => {
    trackEvent({
      eventName: 'feature_usage',
      eventCategory: 'feature',
      eventAction: action,
      eventLabel: featureName,
      eventValue: value,
    });
  }, [trackEvent]);

  return {
    trackClick,
    trackFormSubmit,
    trackDownload,
    trackSearch,
    trackFeatureUsage,
  };
};

// Analytics button wrapper
export const AnalyticsButton: React.FC<{
  children: React.ReactNode;
  trackingId: string;
  trackingData?: any;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}> = ({ children, trackingId, trackingData, onClick, className = '', disabled = false }) => {
  const { trackClick } = useTrackingEvents();

  const handleClick = () => {
    if (!disabled) {
      trackClick(trackingId, trackingData);
      onClick?.();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={className}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// Analytics link wrapper
export const AnalyticsLink: React.FC<{
  children: React.ReactNode;
  href: string;
  trackingId: string;
  trackingData?: any;
  className?: string;
}> = ({ children, href, trackingId, trackingData, className = '' }) => {
  const { trackClick } = useTrackingEvents();

  const handleClick = () => {
    trackClick(trackingId, { ...trackingData, href });
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  );
};

// Utility functions
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Custom hook for page view tracking
export const usePageTracking = (pageName?: string) => {
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    const page = pageName || window.location.pathname;
    trackPageView(page);
  }, [pageName, trackPageView]);
}; 