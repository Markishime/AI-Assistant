import { useEffect, useState } from 'react';

interface Module {
  id: string;
  name: string;
  label: string;
  description: string;
  enabled: boolean;
}

export default function ModuleManagement() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchModules();
  }, []);

  async function fetchModules() {
    setLoading(true);
    const res = await fetch('/api/admin/modules');
    const data = await res.json();
    setModules(data.modules || []);
    setLoading(false);
  }

  async function toggleModule(id: string, enabled: boolean) {
    setSaving(id);
    await fetch('/api/admin/modules', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, enabled: !enabled })
    });
    await fetchModules();
    setSaving(null);
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Module Management</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow border">
          <thead>
            <tr className="bg-slate-100">
              <th className="p-3 text-left">Module</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left">Enabled</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="p-6 text-center">Loading...</td></tr>
            ) : modules.length === 0 ? (
              <tr><td colSpan={3} className="p-6 text-center">No modules found.</td></tr>
            ) : modules.map(module => (
              <tr key={module.id} className="border-b hover:bg-slate-50">
                <td className="p-3 font-medium">{module.label}</td>
                <td className="p-3 text-gray-600">{module.description}</td>
                <td className="p-3">
                  <button
                    onClick={() => toggleModule(module.id, module.enabled)}
                    disabled={saving === module.id}
                    className={`px-4 py-2 rounded ${module.enabled ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                  >
                    {module.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 