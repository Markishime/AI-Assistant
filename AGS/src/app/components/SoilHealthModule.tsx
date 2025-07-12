import { BarChart3, Leaf } from 'lucide-react';

export default function SoilHealthModule() {
  // In production, fetch real soil health data from API or DB
  const mock = {
    ph: 5.8,
    organicMatter: 2.1,
    cec: 18.5,
    trend: 'improving',
    recommendations: [
      'Maintain pH between 5.5 and 6.5 for optimal nutrient uptake.',
      'Increase organic matter with compost or cover crops.',
      'Monitor CEC and apply lime if needed.'
    ]
  };
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <Leaf className="w-5 h-5 text-green-600" />
        <span className="font-semibold text-green-800">Soil Health</span>
      </div>
      <div className="flex flex-wrap gap-6 mb-2 text-sm">
        <span>pH: <b>{mock.ph}</b></span>
        <span>Organic Matter: <b>{mock.organicMatter}%</b></span>
        <span>CEC: <b>{mock.cec} cmol/kg</b></span>
        <span>Trend: <b className={mock.trend === 'improving' ? 'text-green-600' : 'text-red-600'}>{mock.trend}</b></span>
      </div>
      <div className="mt-2">
        <b>Recommendations:</b>
        <ul className="list-disc ml-6 text-sm">
          {mock.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
        </ul>
      </div>
    </div>
  );
} 