'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Activity, Clock, Database, Wifi, AlertTriangle, TrendingUp } from 'lucide-react';

// Performance metrics types
interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  networkLatency: number;
  apiResponseTimes: { [endpoint: string]: number[] };
  errorRate: number;
  userInteractions: number;
  timestamp: number;
}

interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: number;
}

// Performance monitoring hook
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  const metricsRef = useRef<PerformanceMetrics[]>([]);

  // Thresholds for performance alerts
  const thresholds = {
    loadTime: 3000, // 3 seconds
    renderTime: 100, // 100ms
    memoryUsage: 100, // 100MB
    networkLatency: 1000, // 1 second
    apiResponseTime: 2000, // 2 seconds
    errorRate: 0.05, // 5%
  };

  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;

    setIsMonitoring(true);
    
    // Collect initial metrics
    collectMetrics();

    // Set up interval to collect metrics every 30 seconds
    intervalRef.current = setInterval(collectMetrics, 30000);

    // Monitor navigation performance
    if ('navigation' in performance) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            updateMetric('loadTime', navEntry.loadEventEnd - navEntry.fetchStart); // Use fetchStart instead of navigationStart
          }
        });
      });
      observer.observe({ entryTypes: ['navigation'] });
    }

    // Monitor resource loading
    if ('performance' in window && 'PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            if (resourceEntry.name.includes('/api/')) {
              const endpoint = extractEndpoint(resourceEntry.name);
              const responseTime = resourceEntry.responseEnd - resourceEntry.requestStart;
              updateApiResponseTime(endpoint, responseTime);
            }
          }
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
    }

  }, [isMonitoring]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  const collectMetrics = useCallback(() => {
    const now = Date.now();
    
    // Memory usage (if available)
    let memoryUsage = 0;
    if ('memory' in performance) {
      const perfMemory = (performance as any).memory;
      memoryUsage = perfMemory.usedJSHeapSize / (1024 * 1024); // Convert to MB
    }

    // Network latency estimation
    const networkLatency = estimateNetworkLatency();

    const newMetrics: PerformanceMetrics = {
      loadTime: 0, // Will be updated by navigation observer
      renderTime: measureRenderTime(),
      memoryUsage,
      networkLatency,
      apiResponseTimes: {},
      errorRate: calculateErrorRate(),
      userInteractions: 0, // Can be tracked separately
      timestamp: now,
    };

    setMetrics(prev => {
      const updated = [...prev, newMetrics].slice(-100); // Keep last 100 entries
      metricsRef.current = updated;
      return updated;
    });

    // Check for performance issues and create alerts
    checkPerformanceThresholds(newMetrics);

  }, []);

  const updateMetric = useCallback((metric: keyof PerformanceMetrics, value: number) => {
    setMetrics(prev => {
      const latest = prev[prev.length - 1];
      if (latest) {
        const updated = [...prev];
        updated[updated.length - 1] = { ...latest, [metric]: value };
        metricsRef.current = updated;
        return updated;
      }
      return prev;
    });
  }, []);

  const updateApiResponseTime = useCallback((endpoint: string, responseTime: number) => {
    setMetrics(prev => {
      const latest = prev[prev.length - 1];
      if (latest) {
        const updated = [...prev];
        const lastMetrics = { ...latest };
        if (!lastMetrics.apiResponseTimes[endpoint]) {
          lastMetrics.apiResponseTimes[endpoint] = [];
        }
        lastMetrics.apiResponseTimes[endpoint].push(responseTime);
        updated[updated.length - 1] = lastMetrics;
        metricsRef.current = updated;
        return updated;
      }
      return prev;
    });

    // Check API response time threshold
    if (responseTime > thresholds.apiResponseTime) {
      addAlert({
        type: 'warning',
        message: `Slow API response detected for ${endpoint}`,
        metric: 'apiResponseTime',
        value: responseTime,
        threshold: thresholds.apiResponseTime,
      });
    }
  }, [thresholds.apiResponseTime]);

  const checkPerformanceThresholds = useCallback((metrics: PerformanceMetrics) => {
    if (metrics.loadTime > thresholds.loadTime) {
      addAlert({
        type: 'warning',
        message: 'Page load time is slower than expected',
        metric: 'loadTime',
        value: metrics.loadTime,
        threshold: thresholds.loadTime,
      });
    }

    if (metrics.memoryUsage > thresholds.memoryUsage) {
      addAlert({
        type: 'error',
        message: 'High memory usage detected',
        metric: 'memoryUsage',
        value: metrics.memoryUsage,
        threshold: thresholds.memoryUsage,
      });
    }

    if (metrics.networkLatency > thresholds.networkLatency) {
      addAlert({
        type: 'warning',
        message: 'High network latency detected',
        metric: 'networkLatency',
        value: metrics.networkLatency,
        threshold: thresholds.networkLatency,
      });
    }
  }, [thresholds]);

  const addAlert = useCallback((alert: Omit<PerformanceAlert, 'id' | 'timestamp'>) => {
    const newAlert: PerformanceAlert = {
      ...alert,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    };

    setAlerts(prev => [newAlert, ...prev].slice(0, 50)); // Keep last 50 alerts

    // Auto-remove alerts after 30 seconds
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== newAlert.id));
    }, 30000);
  }, []);

  useEffect(() => {
    startMonitoring();
    return () => stopMonitoring();
  }, [startMonitoring, stopMonitoring]);

  return {
    metrics: metricsRef.current,
    alerts,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    getAverageMetric: (metric: keyof PerformanceMetrics) => {
      const values = metricsRef.current
        .map(m => m[metric])
        .filter(v => typeof v === 'number' && v > 0) as number[];
      return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    },
    getLatestMetric: (metric: keyof PerformanceMetrics) => {
      const latest = metricsRef.current[metricsRef.current.length - 1];
      return latest ? latest[metric] : 0;
    },
  };
};

// Utility functions
function measureRenderTime(): number {
  const startTime = performance.now();
  
  // Trigger a small render measurement
  const div = document.createElement('div');
  div.innerHTML = '<span>test</span>';
  document.body.appendChild(div);
  document.body.removeChild(div);
  
  return performance.now() - startTime;
}

function estimateNetworkLatency(): number {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    return connection.rtt || 0;
  }
  return 0;
}

function calculateErrorRate(): number {
  // This would typically be calculated based on actual error tracking
  // For now, return 0 as a placeholder
  return 0;
}

function extractEndpoint(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.split('/').slice(0, 4).join('/'); // Get first 3 path segments
  } catch {
    return 'unknown';
  }
}

// Performance Dashboard Component
export const PerformanceDashboard: React.FC<{
  className?: string;
  showAlerts?: boolean;
}> = ({ className = '', showAlerts = true }) => {
  const {
    metrics,
    alerts,
    isMonitoring,
    getAverageMetric,
    getLatestMetric,
  } = usePerformanceMonitor();

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 MB';
    const mb = bytes;
    return `${mb.toFixed(1)} MB`;
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getStatusColor = (value: number, threshold: number, reverse = false) => {
    const isGood = reverse ? value > threshold : value < threshold;
    if (isGood) return 'text-green-600 bg-green-100';
    if (value < threshold * 1.5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Performance Status */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Performance Monitor
        </h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="text-sm text-gray-600">
            {isMonitoring ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Load Time */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">Load Time</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatTime(getLatestMetric('loadTime') as number)}
          </div>
          <div className="text-xs text-gray-500">
            Avg: {formatTime(getAverageMetric('loadTime'))}
          </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Database className="w-4 h-4 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">Memory</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatBytes(getLatestMetric('memoryUsage') as number)}
          </div>
          <div className="text-xs text-gray-500">
            Avg: {formatBytes(getAverageMetric('memoryUsage'))}
          </div>
        </div>

        {/* Network Latency */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Wifi className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">Network</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatTime(getLatestMetric('networkLatency') as number)}
          </div>
          <div className="text-xs text-gray-500">
            Avg: {formatTime(getAverageMetric('networkLatency'))}
          </div>
        </div>

        {/* Error Rate */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">Errors</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {(getLatestMetric('errorRate') as number * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">
            Avg: {(getAverageMetric('errorRate') as number * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Performance Trends */}
      {metrics.length > 1 && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Performance Trends
          </h4>
          <div className="space-y-3">
            {['loadTime', 'memoryUsage', 'networkLatency'].map((metric) => {
              const latest = getLatestMetric(metric as keyof PerformanceMetrics);
              const average = getAverageMetric(metric as keyof PerformanceMetrics);
              const trend = (latest as number) > (average as number) ? 'up' : 'down';
              const percentage = (average as number) > 0 ? (((latest as number) - (average as number)) / (average as number) * 100) : 0;

              return (
                <div key={metric} className="flex items-center justify-between">
                  <span className="text-sm capitalize text-gray-700">
                    {metric.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-900">
                      {metric === 'memoryUsage' ? formatBytes(latest as number) : formatTime(latest as number)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      trend === 'down' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {trend === 'up' ? '↑' : '↓'} {Math.abs(percentage).toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Performance Alerts */}
      {showAlerts && alerts.length > 0 && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-md font-medium text-gray-900 mb-4">Recent Alerts</h4>
          <div className="space-y-2">
            {alerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border-l-4 ${
                  alert.type === 'error'
                    ? 'bg-red-50 border-red-400 text-red-700'
                    : alert.type === 'warning'
                    ? 'bg-yellow-50 border-yellow-400 text-yellow-700'
                    : 'bg-blue-50 border-blue-400 text-blue-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{alert.message}</span>
                  <span className="text-xs">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-xs mt-1">
                  {alert.metric}: {alert.value.toFixed(1)} (threshold: {alert.threshold})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 