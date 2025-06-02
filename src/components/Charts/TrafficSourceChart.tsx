import React from "react";
import { Bar } from "react-chartjs-2";
import { ChartOptions, ChartData } from "chart.js";
import { useLanguage } from "@/context/LanguageContext";

interface TrafficSourceChartProps {
  trafficSourceData: ChartData<"bar">;
  windowWidth: number;
}

export default function TrafficSourceChart({
  trafficSourceData,
  windowWidth,
}: TrafficSourceChartProps) {
  const { getTranslation } = useLanguage();

  const getMaxValue = (data: (number | [number, number] | null)[]): number => {
    const numericData = data
      .filter((item): item is number => typeof item === "number" && item !== null)
      .map((item) => item as number);
    return numericData.length > 0 ? Math.max(...numericData) + 1 : 1;
  };

  if (!trafficSourceData?.datasets?.length || !trafficSourceData.datasets[0]?.data) {
    return null;
  }

  const trafficSourceOptions: ChartOptions<"bar"> = {
    indexAxis: "y" as const,
    scales: {
      x: {
        beginAtZero: true,
        grid: { display: true },
        suggestedMax: getMaxValue(trafficSourceData.datasets[0].data),
        ticks: { stepSize: 1 },
      },
      y: {
        grid: { display: false },
        ticks: {
          padding: 1,
          align: "center" as const,
          font: {
            size:
              windowWidth < 440 ? 7.5 :
              windowWidth < 470 ? 8 :
              windowWidth < 530 ? 9 : 11,
          },
        },
      },
    },
    plugins: { 
      legend: { display: false },
      datalabels: {
        display: true,
        color: '#FFFFFF', 
      },
    },
    maintainAspectRatio: false,
    layout: { padding: { left: 1 } },
  };

  return (
    <div className="bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200">
      <div className="px-6 py-4 border-b">
        <h2 className="text-xl font-medium DiagrammFiveName">
          {getTranslation("DiagrammFive")}
        </h2>
      </div>
      <div className="p-6">
        <div className="h-[300px]">
          <Bar data={trafficSourceData} options={trafficSourceOptions} />
        </div>
      </div>
    </div>
  );
}