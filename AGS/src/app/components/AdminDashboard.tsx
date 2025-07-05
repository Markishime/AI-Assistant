'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AnalysisData } from '@/types';

export default function AdminDashboard() {
  const [analyses, setAnalyses] = useState<AnalysisData[]>([]);

  useEffect(() => {
    const fetchAnalyses = async () => {
      const querySnapshot = await getDocs(collection(db, 'analyses'));
      const data = querySnapshot.docs.map(doc => doc.data() as AnalysisData);
      setAnalyses(data);
    };
    fetchAnalyses();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sample Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Values</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {analyses.map((analysis, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">{analysis.sampleType}</td>
                <td className="px-6 py-4 whitespace-nowrap">{analysis.timestamp}</td>
                <td className="px-6 py-4">{JSON.stringify(analysis.values)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}