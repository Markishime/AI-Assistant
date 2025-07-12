import { useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, ToggleLeft, ToggleRight, Star, BarChart3 } from 'lucide-react';

interface Prompt {
  id: string;
  title: string;
  description?: string;
  template: string;
  sample_type: string;
  language: string;
  user_focus?: string;
  is_active: boolean;
  updated_at: string;
}

interface Analytics {
  promptId: string;
  title: string;
  avgRating: number | null;
  feedbackCount: number;
  usageCount: number;
}

export default function AdminPromptManagement() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPrompt, setEditPrompt] = useState<Prompt | null>(null);
  const [form, setForm] = useState<Partial<Prompt>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPrompts();
    fetchAnalytics();
  }, []);

  async function fetchPrompts() {
    setLoading(true);
    const res = await fetch('/api/admin/prompts');
    const data = await res.json();
    setPrompts(data.prompts || []);
    setLoading(false);
  }
  async function fetchAnalytics() {
    const res = await fetch('/api/admin/prompts/analytics');
    const data = await res.json();
    setAnalytics(data.analytics || []);
  }

  function openModal(prompt?: Prompt) {
    setEditPrompt(prompt || null);
    setForm(prompt ? { ...prompt } : { is_active: true, language: 'en' });
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
    setEditPrompt(null);
    setForm({});
  }

  async function savePrompt() {
    setSaving(true);
    const method = editPrompt ? 'PUT' : 'POST';
    const res = await fetch('/api/admin/prompts', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    await fetchPrompts();
    closeModal();
    setSaving(false);
  }
  async function deletePrompt(id: string) {
    if (!window.confirm('Delete this prompt?')) return;
    await fetch('/api/admin/prompts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    await fetchPrompts();
  }
  async function toggleActive(prompt: Prompt) {
    await fetch('/api/admin/prompts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...prompt, is_active: !prompt.is_active })
    });
    await fetchPrompts();
  }

  function getAnalytics(promptId: string) {
    return analytics.find(a => a.promptId === promptId) || { avgRating: null, feedbackCount: 0, usageCount: 0 };
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Prompt Management</h2>
        <button onClick={() => openModal()} className="bg-emerald-600 text-white px-4 py-2 rounded flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Prompt
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow border">
          <thead>
            <tr className="bg-slate-100">
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Last Updated</th>
              <th className="p-3 text-left">Analytics</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-6 text-center">Loading...</td></tr>
            ) : prompts.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center">No prompts found.</td></tr>
            ) : prompts.map(prompt => {
              const a = getAnalytics(prompt.id);
              return (
                <tr key={prompt.id} className="border-b hover:bg-slate-50">
                  <td className="p-3 font-medium">{prompt.title}</td>
                  <td className="p-3">{prompt.sample_type}</td>
                  <td className="p-3">
                    <button onClick={() => toggleActive(prompt)} className="flex items-center gap-1">
                      {prompt.is_active ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                      {prompt.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="p-3 text-xs text-gray-500">{new Date(prompt.updated_at).toLocaleString()}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400" /> {a.avgRating ? a.avgRating.toFixed(2) : '-'}
                      <BarChart3 className="w-4 h-4 text-blue-500 ml-2" /> {a.usageCount}
                    </div>
                    <div className="text-xs text-gray-500">{a.feedbackCount} feedback</div>
                  </td>
                  <td className="p-3 flex gap-2">
                    <button onClick={() => openModal(prompt)} className="text-blue-600 hover:underline"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => deletePrompt(prompt.id)} className="text-red-600 hover:underline"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">{editPrompt ? 'Edit Prompt' : 'Add Prompt'}</h3>
            <div className="space-y-3">
              <input
                className="w-full border p-2 rounded"
                placeholder="Title"
                value={form.title || ''}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
              <textarea
                className="w-full border p-2 rounded"
                placeholder="Description"
                value={form.description || ''}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
              <textarea
                className="w-full border p-2 rounded"
                placeholder="Prompt Template"
                value={form.template || ''}
                onChange={e => setForm(f => ({ ...f, template: e.target.value }))}
                rows={4}
              />
              <input
                className="w-full border p-2 rounded"
                placeholder="Sample Type (soil, leaf, etc.)"
                value={form.sample_type || ''}
                onChange={e => setForm(f => ({ ...f, sample_type: e.target.value }))}
              />
              <input
                className="w-full border p-2 rounded"
                placeholder="Language (en, ms)"
                value={form.language || ''}
                onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
              />
              <input
                className="w-full border p-2 rounded"
                placeholder="User Focus (optional)"
                value={form.user_focus || ''}
                onChange={e => setForm(f => ({ ...f, user_focus: e.target.value }))}
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_active ?? true}
                  onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                />
                Active
              </label>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={savePrompt} disabled={saving} className="bg-emerald-600 text-white px-4 py-2 rounded disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
              <button onClick={closeModal} className="bg-gray-200 px-4 py-2 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 