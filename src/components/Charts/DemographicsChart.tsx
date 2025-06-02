import React from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ChartOptions, ChartData } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useLanguage } from '@/context/LanguageContext';

interface DemographicsChartProps {
  genderData: ChartData<'pie'>;
  ageGenderData: ChartData<'bar'>;
  ageData: ChartData<'bar'> | null;
  demographicsView: string;
  setDemographicsView: (view: string) => void;
  windowWidth: number;
}

export default function DemographicsChart({
  genderData,
  ageGenderData,
  ageData,
  demographicsView,
  setDemographicsView,
  windowWidth,
}: DemographicsChartProps) {
  const { language, getTranslation } = useLanguage();

  const pieOptions: ChartOptions<'pie'> = {
    plugins: {
      legend: {
        position: 'bottom',
        align: 'center',
        labels: {
          padding: 20,
          boxWidth: 15,
          font: { size: 12 },
          usePointStyle: true,
        },
      },
      datalabels: {
        color: '#FFFFFF',
        font: { size: 16, weight: 'bold' },
        formatter: (value: number) => {
          if (value === 0) return ''; 
          return value + '%';
        },
      },
    },
    layout: {
      padding: {
        bottom: 20,
      },
    },
    maintainAspectRatio: false,
  };

  const ageGenderOptions: ChartOptions<'bar'> = {
    indexAxis: 'y' as const,
    scales: {
      x: {
        type: 'linear' as const,
        stacked: true,
        ticks: {
          callback: function (value: string | number) {
            return `${Math.abs(Number(value))}`;
          },
          display: true,
        },
        grid: {
          display: false,
        },
      },
      y: {
        stacked: true,
        grid: {
          display: false,
          drawOnChartArea: false,
        },
      },
    },
    animation: {
      duration: 1000,
    },
    plugins: {
      legend: {
        position: 'bottom',
      },
      datalabels: {
        display: true,
        color: '#FFFFFF',
        font: {
          weight: 'bold',
        },
        formatter: (value: number) => {
          if (value === 0) return ''; 
          return `${Math.abs(Math.round(value))}%`;
        },
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem: any) {
            const value = Math.abs(Math.round(tooltipItem.raw));
            return `${tooltipItem.dataset.label}: ${value}`;
          },
        },
      },
    },
    maintainAspectRatio: false,
  };

  const ageOptions: ChartOptions<'bar'> = {
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: { display: false },
      datalabels: {
        display: true,
        color: '#FFFFFF',
        font: {
          weight: 'bold',
        },
        formatter: (value: number) => {
          if (value === 0) return ''; 
          return value;
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200">
      <div className="px-6 py-4 border-b">
        <h2 className="text-xl font-medium text-start DiagrammFourName">
          {getTranslation('DiagrammFour', language)}
        </h2>
      </div>
      <div className="p-6 flex flex-col items-center">
        <div className="flex justify-center gap-4 mb-6 w-full">
          {['Пол', 'Пол и возраст', 'Возраст'].map((tab) => (
            <button
              key={tab}
              className={`px-6 py-2 rounded-lg transition-colors AgeGenderButtons ${
                demographicsView === tab.toLowerCase()
                  ? 'bg-blue-600 text-white AgeGenderButtons'
                  : 'bg-gray-100'
              }`}
              onClick={() => setDemographicsView(tab.toLowerCase())}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="h-[300px] w-full flex justify-center items-center">
          {demographicsView === 'пол' && (
            <Pie data={genderData} options={pieOptions} />
          )}
          {demographicsView === 'пол и возраст' && (
            <Bar
              data={ageGenderData}
              options={ageGenderOptions}
              plugins={[ChartDataLabels]}
            />
          )}
          {demographicsView === 'возраст' && ageData && (
            <Bar data={ageData} options={ageOptions} />
          )}
        </div>
      </div>
    </div>
  );
}