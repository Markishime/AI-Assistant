'use client';

import { AnalysisReport } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ReportDisplayProps {
  report: AnalysisReport | null;
}

export default function ReportDisplay({ report }: ReportDisplayProps) {
  if (!report) return null;

  return (
    <div className="prose prose-sm max-w-none">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold mt-0">Analysis Results</h2>
        <span className="text-xs text-gray-500">Generated: {new Date(report.timestamp).toLocaleString()}</span>
      </div>
      
      {/* Risk Level and Confidence Score */}
      <div className="flex gap-4 mb-6 no-prose">
        {report.riskLevel && (
          <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
            report.riskLevel === 'Low' ? 'bg-green-100 text-green-800' :
            report.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
            report.riskLevel === 'High' ? 'bg-orange-100 text-orange-800' :
            'bg-red-100 text-red-800'
          }`}>
            Risk Level: {report.riskLevel}
          </div>
        )}
        {report.confidenceScore && (
          <div className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
            Confidence: {report.confidenceScore}%
          </div>
        )}
      </div>
      
      <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
        <h3 className="text-lg font-medium text-green-800 mt-0 mb-2">Interpretation</h3>
        <div className="text-green-700">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{report.interpretation}</ReactMarkdown>
        </div>
      </div>
      
      {/* Issues section */}
      {report.issues && report.issues.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
          <h3 className="text-lg font-medium text-yellow-800 mt-0 mb-2">Identified Issues</h3>
          <ul className="text-yellow-700 list-disc list-inside">
            {report.issues.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
        </div>
      )}
      
      <h3 className="text-lg font-medium mb-3">Improvement Plan</h3>
      <div className="space-y-4">
        {report.improvementPlan.map((plan, index) => (
          <div key={index} className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-md font-semibold text-blue-800 flex items-center justify-between mt-0 mb-2">
              <div className="flex items-center">
                <span className="bg-blue-200 text-blue-800 rounded-full h-6 w-6 flex items-center justify-center mr-2">
                  {index + 1}
                </span>
                {plan.recommendation}
              </div>
              {plan.priority && (
                <span className={`px-2 py-1 text-xs rounded ${
                  plan.priority === 'High' ? 'bg-red-100 text-red-700' :
                  plan.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {plan.priority} Priority
                </span>
              )}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded border border-blue-100">
                <p className="text-sm font-medium text-blue-700 mb-1">Reasoning</p>
                <p className="text-sm text-gray-700 mb-0">{plan.reasoning}</p>
              </div>
              <div className="bg-white p-3 rounded border border-blue-100">
                <p className="text-sm font-medium text-blue-700 mb-1">Estimated Impact</p>
                <p className="text-sm text-gray-700 mb-0">{plan.estimatedImpact}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 flex justify-end">
        <button 
          onClick={() => window.print()} 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Report
        </button>
      </div>
    </div>
  );
}