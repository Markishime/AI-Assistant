'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Brain, FileText, BarChart3, TrendingUp, Users, Target } from 'lucide-react';
import PromptManagement from '../../components/PromptManagement';

interface TemplateAnalytics {
  totalTemplates: number;
  activeTemplates: number;
  averageSuccessRate: number;
  mostUsedTemplate: string | null;
  categoryDistribution: Record<string, number>;
}

export default function AdminPromptsPage() {
  const [analytics, setAnalytics] = useState<TemplateAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/prompts?analytics=true');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-slate-600">Loading prompt analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
            <Brain className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Dynamic Prompt Management</h1>
            <p className="text-slate-600 dark:text-slate-400">Manage AI analysis prompts with Malaysian expertise</p>
          </div>
        </div>
      </div>

      {/* Analytics Dashboard */}
      {analytics && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Templates</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{analytics.totalTemplates}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Templates</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{analytics.activeTemplates}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900">
                <TrendingUp className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Success Rate</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">
                  {(analytics.averageSuccessRate * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Most Used</p>
                <p className="text-lg font-semibold text-slate-800 dark:text-white truncate">
                  {analytics.mostUsedTemplate || 'None'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Distribution */}
      {analytics?.categoryDistribution && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Template Distribution by Category</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(analytics.categoryDistribution).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">
                  {category.replace('_', ' ')}
                </span>
                <span className="text-lg font-bold text-slate-800 dark:text-white">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prompt Management Component */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Template Management</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Create, edit, and manage dynamic prompt templates for Malaysian oil palm analysis
          </p>
        </div>
        <div className="p-6">
          <PromptManagement />
        </div>
      </div>

      {/* System Information */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-700 p-6">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">System Features</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Dynamic Prompt Selection</h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li>• Context-aware template selection</li>
              <li>• Malaysian-specific expertise integration</li>
              <li>• Real-time prompt optimization</li>
              <li>• Usage analytics and performance tracking</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Malaysian Expertise</h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li>• MPOB guidelines integration</li>
              <li>• Regional climate considerations</li>
              <li>• Local supplier recommendations</li>
              <li>• RSPO compliance requirements</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 