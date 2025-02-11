"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Radar, Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  ChartData,
  ChartDataset,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import type { Context as DataLabelsContext } from "chartjs-plugin-datalabels";
import { useSurveyData } from "@/lib/context/SurveyContext";
import type { Question, QuestionResponse } from "@/lib/utils/Dates";

import {
  processSecondQuestion,
  processThirdQuestion,
  processFirstQuestion,
  processJudgeRatings,
  processFifthQuestion,
  processStaffRatings,
  processAudioVideoQuestion,
  processProcessRatings,
  processAccessibilityRatings,
  processOfficeRatings,
  processStartTimeQuestion,
  processDisrespectQuestion,
} from "@/lib/utils/processData";
import NoData from "@/lib/utils/NoData";
import { FaStar } from "react-icons/fa";
import Link from "next/link";
import { useRemarks } from "@/components/RemarksApi";
import { useAuth } from "@/lib/utils/AuthContext";
import { AnimatedDiv } from '@/app/anim/DiagrammAnimation';
import { EvaluationsSkeleton } from '@/components/ui/Skeleton';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  ChartDataLabels
);

// Определяем отдельные интерфейсы для каждого типа графика
interface PieChartData extends ChartData<"pie", number[], string> {
  datasets: (ChartDataset<"pie", number[]> & {
    datalabels?: {
      color: string;
      display?: boolean;
      formatter: (value: number, context: DataLabelsContext) => string;
      font?: {
        size?: number;
        weight?: string | number;
      };
    };
  })[];
}

interface BarChartData extends ChartData<"bar", number[], string> {
  datasets: (ChartDataset<"bar", number[]> & {
    datalabels?: {
      color: string;
      display?: boolean;
      formatter: (value: number, context: DataLabelsContext) => string;
      align?: "end";
      anchor?: "end";
      offset?: number;
      font?: {
        size?: number;
        weight?: string | number;
      };
    };
  })[];
}

export default function Evaluations() {
  const { surveyData } = useSurveyData();
  const { remarks } = useRemarks();
  const [demographicsView, setDemographicsView] = useState("пол");
  const {  user } = useAuth();
  const [categoryData, setCategoryData] = useState<PieChartData>({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          "rgb(54, 162, 235)",
          "rgb(255, 99, 132)",
          "rgb(75, 192, 192)",
          "rgb(153, 102, 255)",
        ],
       
      },
      
    ],
  
  });
  const [genderData, setGenderData] = useState<PieChartData>({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          "rgb(54, 162, 235)",
          "rgb(255, 99, 132)",
          "rgb(75, 192, 192)",
          "rgb(153, 102, 255)",
        ],
      },
    ],
  });
  const [trafficSourceData, setTrafficSourceData] = useState<BarChartData>({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: "rgb(54, 162, 235)",
        barThickness: 20,
        datalabels: {
          color: "#FFFFFF",
          formatter: (value: number): string => `${value}`,
        },
        label: "",
      },
    ],
  });
  const [caseTypesData, setCaseTypesData] = useState<PieChartData>({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          "rgb(54, 162, 235)",
          "rgb(255, 99, 132)",
          "rgb(75, 192, 192)",
          "rgb(153, 102, 255)",
        ],
        datalabels: {
          color: "#FFFFFF",
          display: true,
          formatter: (value: number): string => value + "%",
        },
      },
    ],
  });

  const [audioVideoData, setAudioVideoData] = useState({
    labels: ["Да", "Нет", "Не знаю/Не уверен(а)", "Другое:"],
    datasets: [
      {
        data: [0, 0, 0, 0],
        backgroundColor: [
          "rgb(54, 162, 235)",
          "rgb(255, 99, 132)",
          "rgb(255, 159, 64)",
          "rgb(75, 192, 192)",
        ],
      },
    ],
  });
  const [judgeRatings, setJudgeRatings] = useState<{ [key: string]: number }>(
    {}
  );
  const [staffRatings, setStaffRatings] = useState<{ [key: string]: number }>(
    {}
  );
  const [processRatings, setProcessRatings] = useState<{
    [key: string]: number;
  }>({});
  const [accessibilityRatings, setAccessibilityRatings] = useState<{
    [key: string]: number;
  }>({});
  const [officeRatings, setOfficeRatings] = useState<{ [key: string]: number }>(
    {}
  );
  const [startTimeData, setStartTimeData] = useState(
    processStartTimeQuestion(surveyData?.questions || [])
  );

  const [radarData, setRadarData] = useState({
    labels: ["Судья", "Секретарь, помощник", "Канцелярия", "Процесс", "Здание"],
    datasets: [
      {
        label:  user ? user.court : "Загрузка...",
        data: [0, 0, 0, 0, 0],
        fill: true,
        backgroundColor: "rgba(255, 206, 86, 0.2)",
        borderColor: "rgba(255, 206, 86, 1)",
        borderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
      {
        label: "Средние оценки по республике",
        data: [4.5, 4.2, 4.0, 4.3, 4.1],
        fill: true,
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        datalabels: {
          display: false,
        },
      },
    ],
  });

  const [totalResponses, setTotalResponses] = useState<number>(0);
  const [totalResponsesAnswer, setTotalResponsesAnswer] = useState<number>(0);
  const [disrespectData, setDisrespectData] = useState<BarChartData>({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: "rgb(139, 69, 19)",
        barThickness: 20,
        datalabels: {
          color: "gray",
          align: "end",
          anchor: "end",
          offset: 4,
          formatter: (value: number, context: DataLabelsContext): string => {
            const dataset = context.dataset;
            const data = dataset.data as number[];
            const sum = data.reduce((a, b) => a + b, 0);
            const percentage = ((value / sum) * 100).toFixed(1);
            return `${value} (${percentage}%)`;
          },
          font: {
            size: 14,
            weight: "bold",
          },
        },
      },
    ],
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (surveyData) {
      setIsLoading(false);
    }
  }, [surveyData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (surveyData && surveyData.questions && surveyData.questions[1]) {
          const processedData = processSecondQuestion(
            surveyData.questions[1].question_responses
          );
          setCategoryData(processedData);
        }
        if (surveyData && surveyData.questions && surveyData.questions[2]) {
          const processedData = processThirdQuestion(
            surveyData.questions[2].question_responses
          );
          setGenderData(processedData);
        }
        if (surveyData && surveyData.questions && surveyData.questions[0]) {
          const processedData = processFirstQuestion(
            surveyData.questions[0].question_responses
          );
          setTrafficSourceData(processedData as unknown as BarChartData);
        }
        if (surveyData && surveyData.questions && surveyData.questions[4]) {
          const processedData = processFifthQuestion(
            surveyData.questions[4].question_responses
          );
          setCaseTypesData(processedData);
        }
        if (surveyData?.questions) {
          const getAverageFromData = (data: number[]) => {
            const sum = data.reduce((a: number, b: number) => a + b, 0);
            if (sum === null || sum === undefined) return 0;
            return Number((sum / data.length).toFixed(1));
          };

          const questions = surveyData.questions.map(q => ({
            ...q,
            question_responses: q.question_responses.map(r => ({
              ...r,
              multiple_selected_options: null
            }))
          })) as Question[];

          const judgeData = processJudgeRatings(questions);
          const staffData = processStaffRatings(questions);
          const processData = processProcessRatings(questions);
          const officeData = processOfficeRatings(questions);
          const accessibilityData = processAccessibilityRatings(
            questions
          );

          const currentCourtAverages = {
            judge: getAverageFromData(Object.values(judgeData)),
            secretary: getAverageFromData(Object.values(staffData)),
            office: getAverageFromData(Object.values(officeData)),
            process: getAverageFromData(Object.values(processData)),
            building: getAverageFromData(Object.values(accessibilityData)),
          };

          setRadarData({
            labels: [
              "Судья",
              "Секретарь, помощник",
              "Канцелярия",
              "Процесс",
              "Здание",
            ],
            datasets: [
              {
                label: user ? user.court : "Загрузка...",
                data: [
                  currentCourtAverages.judge || 0,
                  currentCourtAverages.secretary || 0,
                  currentCourtAverages.office || 0,
                  currentCourtAverages.process || 0,
                  currentCourtAverages.building || 0,
                ],
                fill: true,
                backgroundColor: "rgba(255, 206, 86, 0.2)",
                borderColor: "rgba(255, 206, 86, 1)",
                borderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
              },
              {
                label: "Средние оценки по республике",
                data: [4.5, 4.2, 4.0, 4.3, 4.1],
                fill: true,
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                datalabels: {
                  display: false,
                },
              },
            ],
          });

          const ratings = processJudgeRatings(questions);
          setJudgeRatings(ratings);
          const staffRatings = processStaffRatings(questions);
          setStaffRatings(staffRatings);
          const processRatings = processProcessRatings(questions);
          setProcessRatings(processRatings);
          const audioVideoData = processAudioVideoQuestion(
            questions
          );
          setAudioVideoData(audioVideoData);
          const officeRatings = processOfficeRatings(questions);
          setOfficeRatings(officeRatings);
          const accessibilityRatings = processAccessibilityRatings(
            questions as Question[]
          );
          setAccessibilityRatings(accessibilityRatings);
          const startTimeData = processStartTimeQuestion(questions as Question[]);
          setStartTimeData(startTimeData);
          const disrespectData = processDisrespectQuestion(
            questions
          );
          setDisrespectData(disrespectData as BarChartData);
        }
        if (surveyData?.total_responses) {
          setTotalResponses(surveyData.total_responses);
        }
      } catch (error) {
        console.error("Ошибка при получении данных:", error);
      }
    };

    fetchData();
  }, [surveyData]);

  // Подсчитываем количество custom_answer
  useEffect(() => {
    if (remarks) {
      const count = remarks.filter(
        (remark: { custom_answer: string | null }) =>
          remark.custom_answer &&
          remark.custom_answer !== "Необязательный вопрос"
      ).length;
      setTotalResponsesAnswer(count);
    }
  }, [remarks]);

  // Получаем последние 5 custom_answer
  const comments =
    remarks
      ?.slice()
      .reverse()
      .slice(0, 5)
      .map((remark) => ({
        text: remark.custom_answer || "Нет текста",
      })) || [];

  // Общие настройки для всех диаграмм
  const commonOptions = {
    plugins: {
      legend: {
        position: "bottom" as const,
        align: "start" as const,
        labels: {
          padding: 20,
          boxWidth: 15,
          font: {
            size: 12,
          },
        },
      },
    },
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          display: true,
        },
        suggestedMin: 0,
        suggestedMax: 5,
        ticks: {
          display: false,
          stepSize: 1,
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        pointLabels: {
          font: {
            size: 12,
          },
        },
      },
    },
  };

  // Обновленные данные для торнадо-диаграммы
  const ageGenderData = {
    labels: ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"],
    datasets: [
      {
        label: "Мужчины",
        data: [-35, -28, -20, -10, -5, -2],
        backgroundColor: "rgb(54, 162, 235)",
        stack: "Stack 0",
        datalabels: {
          color: "#FFFFFF",
          formatter: (value: number): string => `${Math.abs(value)}%`,
        },
      },
      {
        label: "Женщины",
        data: [30, 25, 18, 12, 8, 4],
        backgroundColor: "rgb(255, 192, 203)",
        stack: "Stack 0",
        datalabels: {
          color: "#FFFFFF",
          formatter: (value: number): string => `${value}%`,
        },
      },
    ],
  };

  // Обновленные данные для возрастной диаграммы
  const ageData = {
    labels: ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"],
    datasets: [
      {
        label: "Количество человек",
        data: [65, 53, 38, 22, 13, 6],
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // Замечания и предложения

  // Обновленные данные для источников трафика
  const trafficSourceOptions = {
    indexAxis: "y" as const,
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          display: true,
        },
        suggestedMax:
          Math.max(...(trafficSourceData.datasets[0]?.data || [0])) + 1,
        ticks: {
          stepSize: 1,
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          padding: 1,
          align: "center" as const,
          font: {
            size: 11,
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
    maintainAspectRatio: false,
    layout: {
      padding: {
        left: 1,
      },
    },
  };

  const disrespectOptions = {
    ...commonOptions,
    indexAxis: "y" as const,
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          display: false,
        },
        ticks: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
    layout: {
      padding: {
        right: 80,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  // Компонент для прогресс-бара
  const ProgressBar = ({ value }: { value: number }) => {
    const getColor = (v: number) => {
      if (v < 2) return "bg-red-500";       // До 2 - красный
      if (v < 3) return "bg-orange-500";    // 2-2.9 - оранжевый
      if (v < 4) return "bg-yellow-500";    // 3-3.9 - желтый
      if (v < 4.5) return "bg-lime-500";    // 4-4.4 - светло-зеленый
      return "bg-green-500";                // 4.5-5 - ярко-зеленый
    };

    return (
      <div className="w-full bg-gray-200 rounded-full h-6">
        <div
          className={`h-6 rounded-full ${getColor(value)}`}
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
    );
  };

  if (isLoading) {
    return <EvaluationsSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Общие показатели */}
          <AnimatedDiv className="bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200">
            <div className="px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium">Общие показатели</h2>
                <span className="text-gray-600">
                  Количество ответов: {totalResponses}
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="h-[400px]">
                <Radar data={radarData} options={commonOptions} />
              </div>
            </div>
          </AnimatedDiv>

          {/* Замечания и предложения */}
          <AnimatedDiv className="bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200">
            <div className="px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium">
                  Замечания и предложения
                </h2>
                <span className="text-gray-600">
                  Количество ответов: {totalResponsesAnswer}
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {comments.map((comment, index) => (
                  <div key={index} className="flex gap-4 p-3 border rounded  bg-gray-50">
                    <span className="text-gray-500 min-w-[24px]">
                      {index + 1} {/* Используем индекс дляпше отображения ID */}
                    </span>
                    <span>{comment.text}</span>
                  </div>
                ))}
              </div>
              <Link href="/Remarks">
                <button className="mt-6 w-full py-3  text-white rounded-lg hover:shadow-2xl duration-200 bg-green-600 transition-colors">
                  Все замечания и предложения
                </button>
              </Link>
            </div>
          </AnimatedDiv>

          {/* Категории респондентов */}
          <AnimatedDiv className="bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-medium">Категории респондентов</h2>
            </div>
            <div className="p-6">
              <div className="w-[400px] h-[400px] mx-auto">
                <Pie data={categoryData} options={commonOptions} />
              </div>
            </div>
          </AnimatedDiv>

          {/* Демографические показатели */}
          <AnimatedDiv className="bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-medium text-start">
                Демографические показатели
              </h2>
            </div>
            <div className="p-6 flex flex-col items-center">
              <div className="flex justify-center gap-4 mb-6 w-full">
                {["Пол", "Пол и возраст", "Возраст"].map((tab) => (
                  <button
                    key={tab}
                    className={`px-6 py-2 rounded-lg transition-colors ${
                      demographicsView === tab.toLowerCase()
                        ? "bg-blue-500 text-white"
                        : " bg-gray-100"
                    }`}
                    onClick={() => setDemographicsView(tab.toLowerCase())}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="h-[300px] w-full flex justify-center items-center">
                {demographicsView === "пол" && (
                  <Pie
                    data={genderData}
                    options={{
                      ...commonOptions,
                      plugins: {
                        ...commonOptions.plugins,
                        legend: {
                          position: "bottom",
                          align: "center",
                          labels: {
                            padding: 20,
                            boxWidth: 15,
                            font: { size: 12 },
                            usePointStyle: true,
                          },
                        },
                        datalabels: {
                          color: "#FFFFFF",
                          font: { size: 16, weight: "bold" },
                          formatter: (value) => value + "%",
                        },
                      },
                      layout: {
                        padding: {
                          bottom: 20,
                        },
                      },
                    }}
                  />
                )}
                {demographicsView === "пол и возраст" && (
                  <Bar
                    data={ageGenderData}
                    options={{
                      indexAxis: "y",
                      scales: {
                        x: {
                          type: "linear" as const,
                          stacked: true,
                          ticks: {
                            callback: function (value: string | number) {
                              return Number(value);
                            },
                            display: false,
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
                      plugins: {
                        legend: {
                          position: "bottom" as const,
                        },
                      },
                      maintainAspectRatio: false,
                    }}
                  />
                )}
                {demographicsView === "возраст" && (
                  <Line
                    data={ageData}
                    options={{
                      scales: {
                        y: {
                          type: "linear" as const,
                          beginAtZero: true,
                          grid: {
                            display: false,
                            drawOnChartArea: false,
                          },
                          ticks: {
                            callback: function (value: string | number) {
                              return value.toString();
                            },
                          },
                        },
                        x: {
                          grid: {
                            display: false,
                          },
                        },
                      },
                      plugins: {
                        legend: {
                          position: "bottom" as const,
                        },
                      },
                      maintainAspectRatio: false,
                    }}
                  />
                )}
              </div>
            </div>
          </AnimatedDiv>

          {/* Источники трафика */}
          <AnimatedDiv className="bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-medium">Источник трафика</h2>
            </div>
            <div className="p-6">
              <div className="h-[300px]">
                <Bar
                  data={trafficSourceData}
                  options={trafficSourceOptions}
                />
              </div>
            </div>
          </AnimatedDiv>

          {/* Категории судебных дел */}
          <AnimatedDiv className="bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-medium">Категории судебных дел</h2>
            </div>
            <div className="p-6">
              <div className="h-[300px]">
                <Pie data={caseTypesData} options={commonOptions} />
              </div>
            </div>
          </AnimatedDiv>

          {/* Оценки судьи */}
          <AnimatedDiv className="bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-medium">Оценки судьи</h2>
            </div>
            <div className="p-6 space-y-6">
              {Object.entries(judgeRatings).map(([title, rating]) => (
                <div key={title} className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-md">{title}</span>
                    <div className="flex items-center">
                      <FaStar className="text-yellow-400 w-4 h-4 mr-1" />
                      <span className="font-bold">{rating}</span>
                      <span className="font-bold text-gray-900 ml-1">/</span>
                      <span className="font-bold text-gray-900 ml-1">5</span>
                    </div>
                  </div>
                  <ProgressBar value={rating} />
                </div>
              ))}
            </div>
          </AnimatedDiv>

          {/* Проявления неуважения */}
          <AnimatedDiv className="bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200">
            <div className="px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium">Проявление неуважения</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="h-[300px]">
                <Bar data={disrespectData} options={disrespectOptions} />
              </div>
            </div>
          </AnimatedDiv>

          {/* Оценки сотрудников */}
          <AnimatedDiv className="bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-medium">Оценки сотрудников</h2>
            </div>
            <div className="p-6 space-y-6 mb-8">
              {Object.entries(staffRatings).map(([title, rating]) => (
                <div key={title} className="space-y-2 mb-12">
                  <div className="flex justify-between items-center">
                    <span className="text-md">{title}</span>
                    <div className="flex items-center">
                      <FaStar className="text-yellow-400 w-4 h-4 mr-1" />
                      <span className="font-bold">{rating}</span>
                      <span className="font-bold text-gray-900 ml-1">/</span>
                      <span className="font-bold text-gray-900 ml-1">5</span>
                    </div>
                  </div>
                  <ProgressBar value={rating} />
                </div>
              ))}
            </div>
          </AnimatedDiv>

          {/* Оценки процесса */}
          <AnimatedDiv className="bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-medium">Оценки процесса</h2>
            </div>
            <div className="p-6 space-y-6">
              {Object.entries(processRatings).map(([title, rating]) => (
                <div key={title} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-md">{title}</span>
                    <div className="flex items-center">
                      <FaStar className="text-yellow-400 w-4 h-4 mr-1" />
                      <span className="font-bold">{rating}</span>
                      <span className="font-bold text-gray-900 ml-1">/</span>
                      <span className="font-bold text-gray-900 ml-1">5</span>
                    </div>
                  </div>
                  <ProgressBar value={rating} />
                </div>
              ))}
            </div>
          </AnimatedDiv>

          {/* Использование средств аудио и видеофиксации */}
          <AnimatedDiv className="bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-medium">
                Использование средств аудио и видеофиксации судебного
                заседания по уголовным делам
              </h2>
            </div>
            <div className="p-6">
              <div className="h-[300px] w-[450px] mx-auto">
                <Pie
                  data={audioVideoData}
                  options={{
                    ...commonOptions,
                    maintainAspectRatio: false,
                    plugins: {
                      datalabels: {
                        color: "#FFFFFF",
                        font: {
                          size: 16,
                          weight: "bold",
                        },
                        formatter: (value) => value + "%",
                      },
                      legend: {
                        position: "right",
                        align: "center",
                        labels: {
                          usePointStyle: true,
                          padding: 20,
                          font: { size: 14 },
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </AnimatedDiv>

          {/* Начало заседания в назначенное время */}
          <AnimatedDiv className="bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200">
            <div className="px-6 py-4 border-b min-h-[90px]">
              <h2 className="text-xl font-medium">
                Начало заседания в назначенное время
              </h2>
            </div>
            <div className="p-6">
              <div className="h-[300px] w-[350px] mx-auto">
                <Pie
                  data={startTimeData}
                  options={{
                    ...commonOptions,
                    maintainAspectRatio: false,
                    plugins: {
                      datalabels: {
                        color: "#FFFFFF",
                        font: {
                          size: 16,
                          weight: "bold",
                        },
                        formatter: (value) => value + "%",
                      },
                      legend: {
                        position: "right",
                        align: "center",
                        labels: {
                          usePointStyle: true,
                          padding: 20,
                          font: { size: 14 },
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </AnimatedDiv>

          {/* Оценки канцелярии */}
          <AnimatedDiv className="bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-medium">Оценки канцелярии</h2>
            </div>
            <div className="p-6 space-y-6">
              {Object.entries(officeRatings).map(([title, rating]) => (
                <div key={title} className="space-y-2">
                  <div className="flex justify-between items-center mb-8">
                    <span className="text-md">{title}</span>
                    <div className="flex items-center">
                      <FaStar className="text-yellow-400 w-4 h-4 mr-1" />
                      <span className="font-bold">{rating}</span>
                      <span className="font-bold text-gray-900 ml-1">/</span>
                      <span className="font-bold text-gray-900 ml-1">5</span>
                    </div>
                  </div>
                  <ProgressBar value={rating} />
                </div>
              ))}
            </div>
          </AnimatedDiv>

          {/* Оценки доступности */}
          <AnimatedDiv className="bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-medium">
                Оценки доступности здания
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {Object.entries(accessibilityRatings).map(([title, rating]) => (
                <div key={title} className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-md">{title}</span>
                    <div className="flex items-center">
                      <FaStar className="text-yellow-400 w-4 h-4 mr-1" />
                      <span className="font-bold">{rating}</span>
                      <span className="font-bold text-gray-900 ml-1">/</span>
                      <span className="font-bold text-gray-900 ml-1">5</span>
                    </div>
                  </div>
                  <ProgressBar value={rating} />
                </div>
              ))}
            </div>
          </AnimatedDiv>
        </div>
      </div>
    </div>
  );
}