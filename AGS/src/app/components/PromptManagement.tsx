import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Save, X, Brain, FileText } from 'lucide-react';

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  category: 'soil' | 'leaf' | 'general' | 'interpretation' | 'recommendations';
  priority: 'high' | 'medium' | 'low';
  is_active: boolean;
  constraints: string[];
  examples: string[];
  created_at: string;
  updated_at: string;
}

export default function PromptManagement() {
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<PromptTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const fetchPrompts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      const response = await fetch(`/api/prompts?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch prompts');
      
      const data = await response.json();
      setPrompts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prompts');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const handleSavePrompt = async (prompt: Omit<PromptTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const method = editingPrompt ? 'PUT' : 'POST';
      const url = '/api/prompts';
      const body = editingPrompt ? { ...prompt, id: editingPrompt.id } : prompt;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error('Failed to save prompt');

      await fetchPrompts();
      setEditingPrompt(null);
      setIsCreating(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save prompt');
    }
  };

  const handleDeletePrompt = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prompt template?')) return;

    try {
      const response = await fetch(`/api/prompts/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete prompt');
      
      await fetchPrompts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete prompt');
    }
  };

  const categories = ['all', 'soil', 'leaf', 'general', 'interpretation', 'recommendations'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-slate-600">Loading prompt templates...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Prompt Management</h2>
            <p className="text-slate-600 dark:text-slate-400">Manage AI analysis prompts and templates</p>
          </div>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          New Prompt
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Prompts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {prompts.map(prompt => (
          <div key={prompt.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{prompt.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      prompt.priority === 'high' ? 'bg-red-100 text-red-700' :
                      prompt.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {prompt.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      prompt.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {prompt.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">{prompt.description}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>Category: {prompt.category}</span>
                    <span>Variables: {prompt.variables.length}</span>
                    <span>Updated: {new Date(prompt.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => setEditingPrompt(prompt)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePrompt(prompt.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Template Preview */}
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Template Preview</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-mono leading-relaxed">
                  {prompt.template.substring(0, 150)}...
                </p>
              </div>

              {/* Constraints and Examples */}
              {(prompt.constraints.length > 0 || prompt.examples.length > 0) && (
                <div className="mt-4 space-y-2">
                  {prompt.constraints.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Constraints:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {prompt.constraints.slice(0, 3).map((constraint, index) => (
                          <span key={index} className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                            {constraint.length > 30 ? constraint.substring(0, 30) + '...' : constraint}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Create Modal */}
      {(editingPrompt || isCreating) && (
        <PromptEditor
          prompt={editingPrompt}
          onSave={handleSavePrompt}
          onCancel={() => {
            setEditingPrompt(null);
            setIsCreating(false);
          }}
        />
      )}
    </div>
  );
}

interface PromptEditorProps {
  prompt: PromptTemplate | null;
  onSave: (prompt: Omit<PromptTemplate, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

function PromptEditor({ prompt, onSave, onCancel }: PromptEditorProps) {
  const [formData, setFormData] = useState({
    name: prompt?.name || '',
    description: prompt?.description || '',
    template: prompt?.template || '',
    variables: prompt?.variables || [],
    category: prompt?.category || 'general' as const,
    priority: prompt?.priority || 'medium' as const,
    is_active: prompt?.is_active ?? true,
    constraints: prompt?.constraints || [],
    examples: prompt?.examples || []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
              {prompt ? 'Edit Prompt Template' : 'Create New Prompt Template'}
            </h3>
            <button
              onClick={onCancel}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as PromptTemplate['category'] })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              >
                <option value="soil">Soil</option>
                <option value="leaf">Leaf</option>
                <option value="general">General</option>
                <option value="interpretation">Interpretation</option>
                <option value="recommendations">Recommendations</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Template
            </label>
            <textarea
              value={formData.template}
              onChange={(e) => setFormData({ ...formData, template: e.target.value })}
              rows={12}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white font-mono text-sm"
              placeholder="Enter your prompt template here. Use {variableName} for dynamic content."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as PromptTemplate['priority'] })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Active</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 border border-slate-300 hover:border-slate-400 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
            >
              <Save className="w-4 h-4" />
              Save Prompt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
