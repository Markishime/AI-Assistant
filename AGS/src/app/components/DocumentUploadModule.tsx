import { useState } from 'react';
import { Upload, FileText } from 'lucide-react';

export default function DocumentUploadModule() {
  const [files, setFiles] = useState<any[]>([
    { name: 'Fertilizer_Management.pdf', uploaded: '2024-06-01' },
    { name: 'Soil_Analysis_Guide.docx', uploaded: '2024-05-28' }
  ]);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<File | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setSelected(e.target.files[0]);
    }
  }
  function upload() {
    if (!selected) return;
    setUploading(true);
    setTimeout(() => {
      setFiles(f => [{ name: selected.name, uploaded: new Date().toISOString().split('T')[0] }, ...f]);
      setSelected(null);
      setUploading(false);
    }, 1200);
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <Upload className="w-5 h-5 text-purple-600" />
        <span className="font-semibold text-purple-800">Document Upload</span>
      </div>
      <div className="flex gap-2 mb-4">
        <input type="file" onChange={handleFile} className="border rounded p-1" />
        <button onClick={upload} disabled={!selected || uploading} className="bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50">
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
      <div>
        <b>Uploaded Documents:</b>
        <ul className="mt-2 space-y-1">
          {files.map((file, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-purple-400" />
              <span>{file.name}</span>
              <span className="text-xs text-gray-400 ml-2">({file.uploaded})</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 