import React from 'react';
import { Pie } from 'react-chartjs-2';
import { ChartOptions, ChartData } from 'chart.js';

import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useLanguage } from '@/context/LanguageContext';

interface CategoryJudgeChartProps {
  caseTypesData: ChartData<'pie', (number | null)[]>;
  windowWidth: number;
}

export default function CategoryJudgeChart({
  caseTypesData,
  windowWidth,
}: CategoryJudgeChartProps) {
  const { language, getTranslation} = useLanguage();

  const caseTypesOptions: ChartOptions<'pie'> = {
    plugins: {
      legend: {
        position: 'bottom' as const,
        align: 'center' as const,
        labels: {
          padding: 20,
          boxWidth: 15,
          font: {
            size: windowWidth < 440 ? 10 : 11,
            family: 'Inter, sans-serif',
          },
          usePointStyle: true,
        },
      },
      datalabels: {
        color: '#FFFFFF',
        font: {
          size: 14,
          weight: 'bold',
        },
        display: (context: any) => {
          const value = context.dataset.data[context.dataIndex];
          return value !== null && value > 0; 
        },
        formatter: (value: number | null) => {
          if (value === null || value <= 0) return '';
          return `${value}%`;
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.raw;
            if (value === null || value <= 0) return label;
            return `${label}: ${value}%`;
          },
        },
      },
    },
    maintainAspectRatio: false,
    layout: {
      padding: {
        bottom: 20,
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200">
      <div className="px-6 py-4 border-b">
        <h2 className="text-xl font-medium DiagrammSixName">
          {getTranslation('DiagrammSix', language)}
        </h2>
      </div>
      <div className="p-6">
        <div className="h-[300px]">
          <Pie data={caseTypesData} options={caseTypesOptions} />
        </div>
      </div>
    </div>
  );
}