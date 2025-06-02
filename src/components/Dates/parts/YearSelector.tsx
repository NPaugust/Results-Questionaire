import React from 'react';

interface YearSelectorProps {
  years: string[];
  selected: string;
  show: boolean;
  toggle: () => void;
  onSelect: (year: string) => void;
}

const YearSelector: React.FC<YearSelectorProps> = ({ years, selected, show, toggle, onSelect }) => (
  <div className="relative">
    <button onClick={toggle} className="px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm bg-white text-gray-700 hover:bg-blue-50 border-b-2 border-indigo-100">
      {selected}
      <svg className={`w-4 h-4 transition-transform ${show ? 'rotate-180' : ''}`} viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
    </button>
    {show && (
      <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg w-full border border-indigo-50 z-30">
        {years.map((year, idx) => (
          <button key={year} onClick={() => onSelect(year)} className={`w-full px-4 py-2 text-center hover:bg-blue-50 transition-colors ${selected === year ? 'bg-blue-100 font-medium' : ''}`}>{year}</button>
        ))}
      </div>
    )}
  </div>
);
export default YearSelector;