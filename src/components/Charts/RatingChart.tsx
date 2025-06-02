import { useLanguage } from '@/context/LanguageContext';
import React from 'react';

interface RatingChartProps {
  ratings: { [key: string]: number }; 
  translationKey: TranslationKey;
  className?: string; 
}

const ProgressBar = ({ value }: { value: number }) => {
  const getColor = (v: number) => {
    if (v <= 1.0) return '#8B0000';
    if (v <= 1.5) return '#A52A2A';
    if (v <= 2.0) return '#CD5C5C';
    if (v <= 2.5) return '#E57357';
    if (v <= 3.0) return '#F4A460';
    if (v <= 3.5) return '#FFC04D';
    if (v <= 4.0) return '#B4D330';
    if (v <= 4.5) return '#66C266';
    return '#008000';
  };

  return (
    <div className="w-full bg-gray-200 rounded-full h-6">
      <div
        className="h-6 rounded-full transition-all duration-300"
        style={{
          width: `${(value / 5) * 100}%`,
          backgroundColor: getColor(value),
        }}
      />
    </div>
  );
};

export default function RatingChart({
  ratings,
  translationKey,
  className = '',
}: RatingChartProps) {
  const { language, getTranslation } = useLanguage();

  return (
    <div
      className={`bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200 ${className}`}
    >
      <div className="px-6 py-4 border-b">
        <h2 className="text-xl font-medium">{getTranslation(translationKey, language)}</h2>
      </div>
      <div className="p-6 space-y-6">
        {Object.entries(ratings).map(([title, rating]) => (
          <div key={title} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-md">{title}</span>
              <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="ml-1 inline-block w-6 h-6 text-yellow-500" viewBox="0 0 24 24" stroke="none">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" strokeLinejoin="round" strokeLinecap="round" />
                      </svg>
                <span className="font-bold">{rating}</span>
                <span className="font-bold text-gray-900 ml-1">/</span>
                <span className="font-bold text-gray-900 ml-1">5</span>
              </div>
            </div>
            <ProgressBar value={rating} />
          </div>
        ))}
      </div>
    </div>
  );
}