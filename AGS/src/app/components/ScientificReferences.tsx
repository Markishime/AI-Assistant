import React, { useEffect } from 'react';
import { ScientificReference } from '@/types';

interface ScientificReferencesProps {
  analysisType: string;
  detectedIssues: string[];
  nutrientLevels: Record<string, number>;
  onReferencesLoaded: (refs: ScientificReference[]) => void;
}

const ScientificReferences: React.FC<ScientificReferencesProps> = ({
  analysisType,
  detectedIssues,
  nutrientLevels,
  onReferencesLoaded,
}) => {
  useEffect(() => {
    // Fetch scientific references from the API
    const fetchReferences = async () => {
      try {
        const response = await fetch('/api/scientific-references', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            searchTerms: [analysisType, ...detectedIssues, ...Object.keys(nutrientLevels)],
            analysisType,
            limit: 5,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          onReferencesLoaded(data.references || []);
        }
      } catch (error) {
        onReferencesLoaded([]);
      }
    };
    fetchReferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysisType, JSON.stringify(detectedIssues), JSON.stringify(nutrientLevels)]);

  return (
    <div className="text-center text-slate-500 dark:text-slate-400 py-8">
      <p>Loading scientific references...</p>
    </div>
  );
};

export default ScientificReferences;
