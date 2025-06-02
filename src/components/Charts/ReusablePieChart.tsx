import React from 'react';
import { Pie } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';
import { useLanguage } from '@/context/LanguageContext';

type TranslationKey = "DiagrammEleven" | "DiagrammTwelve" ;

interface ReusablePieChartProps {
  data: any;
  translationKey: TranslationKey;
  windowWidth: number;
  className?: string;
}

export default function ReusablePieChart({
  data,
  translationKey,
  windowWidth,
  className = '',
}: ReusablePieChartProps) {
  const { language, getTranslation } = useLanguage();

  const pieOptions: ChartOptions<"pie"> = {
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        color: "#FFFFFF",
        font: {
          size: 16,
          weight: "bold",
        },
        formatter: (value: number) => value + "%",
      },
      legend: {
        position: (windowWidth < 530 ? "bottom" : "right") as "bottom" | "right",
        align: translationKey === "DiagrammEleven"
          ? (windowWidth < 440 ? "start" : "center") as "start" | "center"
          : "center" as "center", 
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: windowWidth < 440 ? 11 : 14 },
        },
      },
    },
  };

  return (
    <div className={`bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200`}>
      <div className="px-6 py-4 border-b min-h-[90px]">
        <h2 className="text-xl font-medium">
          {getTranslation(translationKey, language)}
        </h2>
      </div>
      <div className="p-6">
        <div className={`h-[300px] w-[350px] mx-auto ${className}`}>
          <Pie data={data} options={pieOptions} />
        </div>
      </div>
    </div>
  );
}