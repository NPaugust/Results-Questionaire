import React from 'react';
import { Period } from '@/lib/utils/dateUtils';

interface PeriodSelectorProps { periods: Period[]; active: number | null; onClick: (p: Period) => void; }
const PeriodSelector: React.FC<PeriodSelectorProps> = ({ periods, active, onClick }) => (
  <div className="flex items-center gap-2">
    {periods.map(p => (
      <button
        key={p.id}
        onClick={() => onClick(p)}
        className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-sm ${active === p.id ? 'bg-indigo-900 text-white' : 'bg-white text-gray-700 hover:bg-blue-50 border-b-2 border-indigo-100'}`}
      >{p.label}</button>
    ))}
  </div>
);
export default PeriodSelector;