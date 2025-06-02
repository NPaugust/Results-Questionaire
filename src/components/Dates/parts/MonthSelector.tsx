"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";

interface MonthSelectorProps {
  months: string[];
  selected: string | null;
  show: boolean;
  onToggle: () => void;
  onSelect: (idx: number) => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({
  months,
  selected,
  show,
  onToggle,
  onSelect,
}) => {
  const { language, getTranslation } = useLanguage();
  const placeholder = getTranslation("Month_Label", language);

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-sm ${
          selected
            ? "bg-indigo-900 text-white"
            : "bg-white text-gray-700 hover:bg-blue-50 border-b-2 border-indigo-100"
        }`}
      >
        {selected || placeholder}
        <svg
          className={`w-4 h-4 transition-transform ${show ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {show && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg w-36 border border-indigo-50 z-30">
          {months.map((m, i) => (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className={`w-full px-4 py-2 text-center hover:bg-blue-50 transition-colors ${
                selected === m ? "bg-blue-100 font-medium" : ""
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MonthSelector;
