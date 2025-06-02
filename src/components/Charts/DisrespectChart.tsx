import React from 'react';
import { Bar } from 'react-chartjs-2';
import { ChartOptions, ChartData } from 'chart.js';
import { useLanguage } from '@/context/LanguageContext';

interface DisrespectChartProps {
  disrespectData: ChartData<'bar'>;
  windowWidth: number;
  percentages: (string | null)[];
}

export default function DisrespectChart({
  disrespectData,
  windowWidth,
  percentages,
}: DisrespectChartProps) {
  const { language, getTranslation } = useLanguage();

  const getMaxValue = (data: (number | [number, number] | null)[]): number => {
    const numericData = data
      .filter((item): item is number | [number, number] => item !== null)
      .map((item) => (Array.isArray(item) ? item[0] : item));
    return numericData.length > 0 ? Math.max(...numericData) + 1 : 1;
  };

  const disrespectOptions: ChartOptions<'bar'> = {
    indexAxis: 'y',
    scales: {
      x: {
        beginAtZero: true,
        grid: { display: true },
        suggestedMax: getMaxValue(disrespectData.datasets[0]?.data || [0]),
        ticks: { stepSize: 1 },
      },
      y: {
        grid: { display: false },
        ticks: {
          padding: 1,
          align: 'center',
          font: {
            size: windowWidth < 470 ? 11 : 12,
          },
        },
      },
    },
    plugins: {
      legend: { display: false },
      datalabels: {
        anchor: 'end',
        align: 'end',
        color: '#000000',
        font: {
          size: windowWidth < 470 ? 10 : 12,
        },
        formatter: (value: number, context: any) => {
          const index = context.dataIndex;
          const percentage = percentages?.[index];
          if (value === 0 || value === null) {
            return '0';
          }
          return percentage ? `${value} (${percentage})` : `${value}`;
        },
      },
      tooltip: {
        enabled: true, 
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            const index = context.dataIndex;
            const percentage = percentages?.[index];
            if (value === null || value === 0) {
              return '0';
            }
            return percentage ? `${value} (${percentage})` : `${value}`;
          },
        },
      },
    },
    maintainAspectRatio: false,
    layout: { padding: { left: 1, right: 50 } }, 
  };

  return (
    <div className="bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200">
      <div className="px-6 py-4 border-b">
        <h2 className="text-xl font-medium DiagrammEightName">
          {getTranslation('DiagrammEight', language)}
        </h2>
      </div>
      <div className="p-6">
        <div className="h-[300px] w-full">
          <Bar data={disrespectData} options={disrespectOptions} />
        </div>
      </div>
    </div>
  );
}