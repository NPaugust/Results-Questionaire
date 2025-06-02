import React from 'react';
import { Radar } from 'react-chartjs-2';
import "@/types/chartSetup";
import { ChartOptions } from 'chart.js';
import { useLanguage } from '@/context/LanguageContext';

interface RadarChartProps {
  radarData: any;
  windowWidth: number;
  totalResponses: number;
}

export default function RadarChart({ radarData, windowWidth, totalResponses }: RadarChartProps) {
  const { language, getTranslation } = useLanguage();

  const radarOptions: ChartOptions<'radar'> = {
    plugins: {
      legend: {
        position: 'bottom' as const,
        align: 'start' as const,
        labels: {
          padding: 20,
          boxWidth: 15,
          font: {
            size: windowWidth < 530 ? 10 : 12,
          },
        },
      },
      datalabels: {
        color: '#000000', 
        font: {
          size: windowWidth < 385 ? 8 : windowWidth < 470 ? 10 : 12, 
        },
        formatter: (value: number) => {
          return value.toFixed(1);
        },
        anchor: 'center', 
        align: 'top', 
        offset: 5, 
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            return `${label}: ${value.toFixed(1)}`;
          },
        },
      },
    },
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          display: true,
          color: 'rgba(0, 0, 0, 0.2)',
        },
        suggestedMin: 0,
        suggestedMax: 5,
        ticks: {
          display: false,
          stepSize: 1,
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        pointLabels: {
          font: {
            size: windowWidth < 385 ? 6.5 : windowWidth < 470 ? 7.5 : 12,
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200">
      <div className="px-6 py-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium DiagrammOne">
            {getTranslation("DiagrammOne", language)}
          </h2>
          <span className="text-gray-600 DiagrammOneTotal">
            {getTranslation("DiagrammOneTotal", language)}{totalResponses}
          </span>
        </div>
      </div>
      <div className="p-6">
        <div className="h-[400px] RadarHeight">
          <Radar data={radarData} options={radarOptions} />
        </div>
      </div>
    </div>
  );
}