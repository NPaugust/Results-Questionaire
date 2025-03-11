"use client";
import React, { useState, useEffect } from "react";
import { Radar, Bar, Pie, Line } from "react-chartjs-2";
import { usePathname } from "next/navigation";
import { ChartOptions } from "chart.js";
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
import { getTranslation, useSurveyData } from "@/context/SurveyContext";

import {
  processSecondQuestion,
  processThirdQuestion,
  processFirstQuestion,
  processProgressRatings,
  processFifthQuestion,
  processStaffRatings,
  processAudioVideoQuestion,
  processProcessRatings,
  processAccessibilityRatings,
  processOfficeRatings,
  processStartTimeQuestion,
  processDisrespectQuestion,
  processAgeData,
  processAgeGenderData,
} from "@/lib/utils/processData";
import NoData from "@/components/NoData/NoData";
import { FaStar } from "react-icons/fa";
import Link from "next/link";
import { useRemarks } from "@/components/RemarksApi";
import { useAuth } from "@/context/AuthContext";
import SkeletonDashboard from "@/lib/utils/SkeletonLoader/SkeletonLoader";
import { getRadarRepublicData } from "@/lib/login";

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

export default function Evaluations({
  selectedCourtId,
  courtNameId,
}: {
  selectedCourtId?: number | null;
  courtNameId?: string | null;
}) {
  const { surveyData, isLoading, language, selectedCourtName, courtName } =
    useSurveyData();
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const { remarks } = useRemarks();
  const [demographicsView, setDemographicsView] = useState("пол");
  const { user } = useAuth();
  const pathname = usePathname();
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
  const categoryOptions: ChartOptions<"pie"> = {
    plugins: {
      legend: {
        position: "bottom",
        align: "start",
        labels: {
          padding: 20,
          boxWidth: 15,
          font: {
            size: windowWidth < 440 ? 8 : 11,
            family: "Inter, sans-serif",
          },
          usePointStyle: true,
        },
      },
      datalabels: {
        color: "#FFFFFF",
        font: {
          size: 14,
          weight: "bold",
        },
        formatter: (value: number) => `${value}%`,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || "";
            const value = context.raw || 0;
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
    labels: ["Да", "Нет", "Не знаю", "Другое:"],
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
    processStartTimeQuestion(surveyData?.questions || [], "ru") // Добавляем "ru" как язык по умолчанию
  );

  const [radarData, setRadarData] = useState({
    labels: ["Судья", "Сотрудники", "Канцелярия", "Процесс", "Здание"],
    datasets: [
      {
        label: user ? user.court : "Загрузка...",
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
        data: [0, 0, 0, 0, 0],
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
  const radarOptions = {
    plugins: {
      legend: {
        position: "bottom" as const,
        align: "start" as const,
        labels: {
          padding: 20,
          boxWidth: 15,
          font: {
            size: windowWidth < 530 ? 10 : 12, // Адаптивный шрифт для легенды
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || "";
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
          color: "rgba(0, 0, 0, 0.2)", // Более мягкий цвет линий
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
            size: windowWidth < 470 ? 9 : 12,
          },
        },
      },
    },
  };

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
          color: "white",
          align: "end" as const,
          anchor: "end" as const,
          offset: 4,
          formatter: (value: number, context: DataLabelsContext): string => {
            const dataset = context.dataset;
            const data = dataset.data as number[];
            const sum = data.reduce((a, b) => a + b, 0);
            const percentage = ((value / sum) * 100).toFixed(1);
            return `${value} (${percentage}%)`;
          },
          font: {
            size: windowWidth < 470 ? 10 : 16,
          },
        },
      },
    ],
  });

  const [ageData, setAgeData] = useState<any>(null);
  const [ageGenderData, setAgeGenderData] = useState({
    labels: ["18-29", "30-44", "45-59", "60 +"],
    datasets: [
      {
        label: "Мужской",
        data: [0, 0, 0, 0],
        backgroundColor: "rgb(51, 153, 255)",
      },
      {
        label: "Женский",
        data: [0, 0, 0, 0],
        backgroundColor: "rgb(255, 99, 132)",
      },
    ],
  });

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (surveyData && surveyData.questions && surveyData.questions[1]) {
          const processedData = processSecondQuestion(
            surveyData.questions[1].question_responses,
            language
          );
          setCategoryData(processedData);
        }
        if (surveyData && surveyData.questions && surveyData.questions[2]) {
          const processedData = processThirdQuestion(
            surveyData.questions[2].question_responses,
            language
          );
          setGenderData(processedData);
        }
        if (surveyData?.questions[2] && surveyData?.questions[3]) {
          setAgeGenderData(
            processAgeGenderData(
              surveyData.questions[2].question_responses, // ответы по полу
              surveyData.questions[3].question_responses // ответы по возрасту
            )
          );
        }

        if (surveyData && surveyData.questions && surveyData.questions[0]) {
          const processedData = processFirstQuestion(
            surveyData.questions[0].question_responses,
            language // Передаем текущий язык ("ru" или "ky")
          );
          setTrafficSourceData(processedData as unknown as BarChartData);
        }
        if (surveyData && surveyData.questions && surveyData.questions[4]) {
          const processedData = processFifthQuestion(
            surveyData.questions[4].question_responses,
            language
          );
          setCaseTypesData(processedData);
        }
        if (surveyData?.questions) {
          const getAverageFromData = (data: number[]) => {
            const sum = data.reduce((a: number, b: number) => a + b, 0);
            if (sum === null || sum === undefined) return 0;
            return Number((sum / data.length).toFixed(1));
          };

          const judgeData = processProgressRatings(
            surveyData.questions,
            language
          );
          const staffData = processStaffRatings(surveyData.questions, language);
          const processData = processProcessRatings(
            surveyData.questions,
            language
          );
          const officeData = processOfficeRatings(
            surveyData.questions,
            language
          );
          const accessibilityData = processAccessibilityRatings(
            surveyData.questions,
            language
          );

          const republicData: { aspect: string; all_courts_avg: number }[] =
            await getRadarRepublicData();

          const allCourtsAvgMap: Record<string, number> = republicData.reduce(
            (acc, item) => {
              acc[item.aspect] = item.all_courts_avg || 0;
              return acc;
            },
            {} as Record<string, number>
          );

          const currentCourtAverageSS = {
            judge: getAverageFromData(Object.values(judgeData)),
            secretary: getAverageFromData(Object.values(staffData)),
            office: getAverageFromData(Object.values(officeData)),
            process: getAverageFromData(Object.values(processData)),
            building: getAverageFromData(Object.values(accessibilityData)),
          };

          setRadarData({
            labels: ["Судья", "Сотрудники", "Канцелярия", "Процесс", "Здание"],
            datasets:
              user?.role === "Председатель 3 инстанции" &&
              pathname === "/"
                ? [
                    // Только республиканские данные
                    {
                      label: "Средние оценки по республике",
                      data: [
                        allCourtsAvgMap["Судья"] || 0,
                        allCourtsAvgMap["Сотрудники"] || 0,
                        allCourtsAvgMap["Канцелярия"] || 0,
                        allCourtsAvgMap["Процесс"] || 0,
                        allCourtsAvgMap["Здание"] || 0,
                      ],
                      fill: true,
                      backgroundColor: "rgba(54, 162, 235, 0.2)",
                      borderColor: "rgba(54, 162, 235, 1)",
                      borderWidth: 2,
                      pointRadius: 5,
                      pointHoverRadius: 7,
                      datalabels: { display: false },
                    },
                  ]
                : user?.role === "Председатель 3 инстанции" &&
                  pathname === "/maps/oblast/Regional-Courts"
                ? [
                    // Данные для выбранного суда из useSurveyData (региональные суды)
                    {
                      label: selectedCourtName || "Загрузка...",
                      data: [
                        currentCourtAverageSS.judge || 0,
                        currentCourtAverageSS.secretary || 0,
                        currentCourtAverageSS.office || 0,
                        currentCourtAverageSS.process || 0,
                        currentCourtAverageSS.building || 0,
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
                      data: [
                        allCourtsAvgMap["Судья"] || 0,
                        allCourtsAvgMap["Сотрудники"] || 0,
                        allCourtsAvgMap["Канцелярия"] || 0,
                        allCourtsAvgMap["Процесс"] || 0,
                        allCourtsAvgMap["Здание"] || 0,
                      ],
                      fill: true,
                      backgroundColor: "rgba(54, 162, 235, 0.2)",
                      borderColor: "rgba(54, 162, 235, 1)",
                      borderWidth: 2,
                      pointRadius: 5,
                      pointHoverRadius: 7,
                      datalabels: { display: false },
                    },
                  ]
                : user?.role === "Председатель 3 инстанции" &&
                  pathname === "/maps/rayon/District-Courts"
                ? [
                    // Данные для выбранного суда из useSurveyData (районные суды)
                    {
                      label: courtName || "Загрузка...",
                      data: [
                        currentCourtAverageSS.judge || 0,
                        currentCourtAverageSS.secretary || 0,
                        currentCourtAverageSS.office || 0,
                        currentCourtAverageSS.process || 0,
                        currentCourtAverageSS.building || 0,
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
                      data: [
                        allCourtsAvgMap["Судья"] || 0,
                        allCourtsAvgMap["Сотрудники"] || 0,
                        allCourtsAvgMap["Канцелярия"] || 0,
                        allCourtsAvgMap["Процесс"] || 0,
                        allCourtsAvgMap["Здание"] || 0,
                      ],
                      fill: true,
                      backgroundColor: "rgba(54, 162, 235, 0.2)",
                      borderColor: "rgba(54, 162, 235, 1)",
                      borderWidth: 2,
                      pointRadius: 5,
                      pointHoverRadius: 7,
                      datalabels: { display: false },
                    },
                  ]
                : [
                    // Оба набора данных (дефолтный случай)
                    {
                      label: user ? user.court : "Загрузка...",
                      data: [
                        currentCourtAverageSS.judge || 0,
                        currentCourtAverageSS.secretary || 0,
                        currentCourtAverageSS.office || 0,
                        currentCourtAverageSS.process || 0,
                        currentCourtAverageSS.building || 0,
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
                      data: [
                        allCourtsAvgMap["Судья"] || 0,
                        allCourtsAvgMap["Сотрудники"] || 0,
                        allCourtsAvgMap["Канцелярия"] || 0,
                        allCourtsAvgMap["Процесс"] || 0,
                        allCourtsAvgMap["Здание"] || 0,
                      ],
                      fill: true,
                      backgroundColor: "rgba(54, 162, 235, 0.2)",
                      borderColor: "rgba(54, 162, 235, 1)",
                      borderWidth: 2,
                      pointRadius: 5,
                      pointHoverRadius: 7,
                      datalabels: { display: false },
                    },
                  ],
          });

          const ratings = processProgressRatings(
            surveyData.questions,
            language
          );
          setJudgeRatings(ratings);
          const staffRatings = processStaffRatings(
            surveyData.questions,
            language
          );
          setStaffRatings(staffRatings);
          const processRatings = processProcessRatings(
            surveyData.questions,
            language
          );
          setProcessRatings(processRatings);
          const audioVideoData = processAudioVideoQuestion(
            surveyData.questions,
            language
          );
          setAudioVideoData(audioVideoData);
          const officeRatings = processOfficeRatings(
            surveyData.questions,
            language
          );
          setOfficeRatings(officeRatings);
          const accessibilityRatings = processAccessibilityRatings(
            surveyData.questions,
            language
          );
          setAccessibilityRatings(accessibilityRatings);
          const startTimeData = processStartTimeQuestion(
            surveyData.questions,
            language
          );
          setStartTimeData(startTimeData);
          const disrespectData = processDisrespectQuestion(
            surveyData.questions,
            language
          );
          setDisrespectData(disrespectData as BarChartData);
        }
        if (surveyData?.total_responses) {
          setTotalResponses(surveyData.total_responses);
        }
        if (surveyData && surveyData.questions) {
          const ageQuestion = surveyData.questions.find((q) => q.id === 4);
          if (ageQuestion) {
            const processedAgeData = processAgeData(
              ageQuestion.question_responses
            );
            setAgeData(processedAgeData);
          }
        }
        const fetchRepublicData = async () => {
          try {
          } catch (error) {
            console.error("Ошибка загрузки данных по республике:", error);
          }
        };
        fetchRepublicData();
      } catch (error) {
        console.error("Ошибка при получении данных:", error);
      }
    };

    fetchData();
  }, [surveyData, language, user]);

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
            size:
              windowWidth < 440
                ? 7.5
                : windowWidth < 470
                ? 8
                : windowWidth < 530
                ? 9
                : 11,
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
    indexAxis: "y" as const,
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          display: true, // Включаем сетку на X, как в "Источник трафика"
        },
        suggestedMax:
          Math.max(...(disrespectData.datasets[0]?.data || [0])) + 1,
        ticks: {
          stepSize: 1,
        },
      },
      y: {
        grid: {
          display: false, // Скрываем сетку на Y
        },
        ticks: {
          padding: 1,
          align: "center" as const,
          font: {
            size: windowWidth < 470 ? 11 : 12,
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            const sum = disrespectData.datasets[0].data.reduce(
              (a, b) => a + b,
              0
            );
            const percentage = ((value / sum) * 100).toFixed(1);
            return `${value} (${percentage}%)`; // Tooltip как в данных
          },
        },
      },
    },
    maintainAspectRatio: false,
    layout: {
      padding: {
        left: 1,
      },
    },
  };

  // Компонент для прогресс-бара
  const ProgressBar = ({ value }: { value: number }) => {
    const getColor = (v: number) => {
      if (v <= 1.0) return "#8B0000"; // Тёмно-красный
      if (v <= 1.5) return "#A52A2A"; // Коричневато-красный
      if (v <= 2.0) return "#CD5C5C"; // Светло-коричневый с красным оттенком
      if (v <= 2.5) return "#E57357"; // Оранжево-красный
      if (v <= 3.0) return "#F4A460"; // Светло-оранжевый
      if (v <= 3.5) return "#FFC04D"; // Тёплый жёлто-оранжевый
      if (v <= 4.0) return "#B4D330"; // Жёлто-зелёный
      if (v <= 4.5) return "#66C266"; // Средне-зелёный
      return "#008000"; // Зелёный для 5.0
    };

    return (
      <div className="w-full bg-gray-200 rounded-full h-6 ProgressBar">
        <div
          className="h-6 rounded-full transition-all duration-300 ProgressBar"
          style={{
            width: `${(value / 5) * 100}%`,
            backgroundColor: getColor(value),
          }}
        />
      </div>
    );
  };
  let remarksPath = "/remarks";

  if (pathname.includes("/maps/General")) {
    remarksPath = "/remarks/General";
  } else if (pathname.includes("/maps/oblast/Regional-Courts")) {
    remarksPath = "/remarks/Regional-Courts";
  } else if (pathname.includes("/maps/rayon/District-Courts")) {
    remarksPath = "/remarks/District-Courts";
  }

  if (selectedCourtId) {
    remarksPath += `/${selectedCourtId}`;
  }
  if (courtNameId) {
    remarksPath += `/${courtNameId}`;
  }
  // Показываем сообщение о загрузке
  if (isLoading) {
    return <SkeletonDashboard />;
  }

  // Проверяем отсутствие данных только после загрузки
  if (!surveyData || surveyData.total_responses === 0) {
    return <NoData />;
  }

  return (
    <div className="min-h-screen mb-4">
      <div className="max-w-[1250px] mx-auto ">
        <div className="grid grid-cols-2 gap-4 EvalutionCols">
          {/* Общие показатели */}
          <div className="bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200">
            <div className="px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium DiagrammOne ">
                  {getTranslation("DiagrammOne", language)}
                </h2>
                <span className="text-gray-600 DiagrammOneTotal">
                  {getTranslation("DiagrammOneTotal", language)}{" "}
                  {totalResponses}
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="h-[400px]">
                <Radar data={radarData} options={radarOptions} />
              </div>
            </div>
          </div>

          {/* Замечания и предложения */}
          <div className="bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200 flex flex-col justify-between h-full">
            <div className="px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium DiagrammTwo">
                  {getTranslation("DiagrammTwo", language)}
                </h2>
                <span className="text-gray-600 DiagrammTwoTotal">
                  {getTranslation("DiagrammTwoTotal", language)}{" "}
                  {totalResponsesAnswer}
                </span>
              </div>
            </div>
            <div className="p-6 flex-1 DiagrammTwoComments">
              {comments.length > 0 ? (
                <div className="space-y-3 ">
                  {comments.map((comment, index) => {
                    const absoluteIndex = totalResponsesAnswer - index;
                    return (
                      <div
                        key={index}
                        className="flex gap-4 p-3 border rounded bg-gray-50"
                      >
                        <span className="text-gray-500 min-w-[24px] ">
                          {absoluteIndex}
                        </span>
                        <span>{comment.text}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6">
                  <p className="text-gray-700 text-base sm:text-sm font-medium text-center">
                    Нет доступных комментариев.
                  </p>
                  <p className="text-gray-500 text-xs sm:text-xs text-center mt-1 sm:mt-2">
                    Пока что комментарии отсутствуют.
                  </p>
                </div>
              )}
            </div>
            <div className="px-6 pb-6 ">
              <Link href={remarksPath}>
                <button className="mt-4 w-full py-3 text-white rounded-lg bg-green-600 hover:shadow-2xl transition-all duration-200 DiagrammTwoCommentsBtn">
                  {getTranslation("DiagrammTwoButton", language)}
                </button>
              </Link>
            </div>
          </div>

          {/* Категории респондентов */}
          <div className="bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-medium DiagrammThreeName">
                {getTranslation("DiagrammThree", language)}
              </h2>
            </div>
            <div className="p-6">
              <div className="w-[350px] h-[400px] EvaluationsCategoryRespond mx-auto">
                <Pie data={categoryData} options={categoryOptions} />
              </div>
            </div>
          </div>

          {/* Демографические показатели */}
          <div className="bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-medium text-start DiagrammFourName">
                {getTranslation("DiagrammFour", language)}
              </h2>
            </div>
            <div className="p-6 flex flex-col items-center">
              <div className="flex justify-center gap-4 mb-6 w-full">
                {["Пол", "Пол и возраст", "Возраст"].map((tab) => (
                  <button
                    key={tab}
                    className={`px-6 py-2 rounded-lg transition-colors AgeGenderButtons ${
                      demographicsView === tab.toLowerCase()
                        ? "bg-blue-600 text-white AgeGenderButtons"
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
                              return `${Math.abs(Number(value))}%`;
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
                        duration: 1000, // Задержка для анимации, если нужна плавность
                      },
                      plugins: {
                        legend: {
                          position: "bottom" as const,
                        },
                        datalabels: {
                          display: true, // Включаем отображение меток данных
                          color: "white", // Цвет текста метки
                          font: {
                            weight: "bold", // Шрифт метки
                          },
                          formatter: (value: number) => `${Math.abs(value)}%`, // Убираем минус в ageGenderData эту строку
                        },
                        tooltip: {
                          callbacks: {
                            label: function (tooltipItem: any) {
                              const value = Math.abs(tooltipItem.raw); // Применяем Math.abs для отображения только положительных значений
                              return `${value}%`; // Отображаем процент без минуса
                            },
                          },
                        },
                      },

                      maintainAspectRatio: false,
                    }}
                    plugins={[ChartDataLabels]} // Добавляем плагин в массив плагинов
                  />
                )}
                {demographicsView === "возраст" && ageData && (
                  <Bar
                    data={ageData}
                    options={{
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
                      },
                      maintainAspectRatio: false,
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Источник трафика */}
          <div className="bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-medium DiagrammFiveName">
                {getTranslation("DiagrammFive", language)}
              </h2>
            </div>
            <div className="p-6">
              <div className="h-[300px]">
                <Bar data={trafficSourceData} options={trafficSourceOptions} />
              </div>
            </div>
          </div>

          {/* Категории судебных дел */}
          <div className="bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-medium DiagrammSixName">
                {getTranslation("DiagrammSix", language)}
              </h2>
            </div>
            <div className="p-6">
              <div className="h-[300px]">
                <Pie data={caseTypesData} options={commonOptions} />
              </div>
            </div>
          </div>

          {/* Оценки судьи */}
          <div className="bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-medium DiagrammSevenName">
                {getTranslation("DiagrammSeven", language)}
              </h2>
            </div>
            <div className="p-6 space-y-6 DiagrammSevenProgress">
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
          </div>

          {/* Проявления неуважения */}
          <div className="bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200">
            <div className="px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium DiagrammEightName">
                  {getTranslation("DiagrammEight", language)}
                </h2>
              </div>
            </div>
            <div className="p-6">
              <div className="h-[300px] w-full">
                <Bar data={disrespectData} options={disrespectOptions} />
              </div>
            </div>
          </div>

          {/* Оценки сотрудников */}
          <div className="bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-medium DiagrammNineName">
                {getTranslation("DiagrammNine", language)}
              </h2>
            </div>
            <div className="p-6 space-y-6 mb-8 DiagrammNineProgress">
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
          </div>

          {/* Оценки процесса */}
          <div className="bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-medium">
                {getTranslation("DiagrammTen", language)}
              </h2>
            </div>
            <div className="p-6 space-y-6 DiagrammTenProgress">
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
          </div>

          {/* Использование средств аудио и видеофиксации */}
          <div className="bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-medium DiagrammElevenName">
                {getTranslation("DiagrammEleven", language)}
              </h2>
            </div>
            <div className="p-6">
              <div className="h-[300px] w-[350px] mx-auto EvaluationsAudio">
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
                        position: windowWidth < 530 ? "bottom" : "right",
                        align: windowWidth < 530 ? "start" : "center",
                        labels: {
                          usePointStyle: true,
                          padding: 20,
                          font: { size: windowWidth < 440 ? 11 : 14 },
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Начало заседания в назначенное время */}
          <div className="bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200">
            <div className="px-6 py-4 border-b min-h-[90px]">
              <h2 className="text-xl font-medium">
                {getTranslation("DiagrammTwelve", language)}
              </h2>
            </div>
            <div className="p-6">
              <div className="h-[300px] w-[350px] mx-auto EvaluationsTime">
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
                        position: windowWidth < 530 ? "bottom" : "right",
                        align: "center",
                        labels: {
                          usePointStyle: true,
                          padding: 20,
                          font: { size: windowWidth < 440 ? 11 : 14 },
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Оценки канцелярии */}
          <div className="bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-medium">
                {getTranslation("DiagrammThirteen", language)}
              </h2>
            </div>
            <div className="p-6 space-y-6 DiagrammThirteenProgress">
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
          </div>

          {/* Оценки доступности */}
          <div className="bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-medium">
                {getTranslation("DiagrammFourteen", language)}
              </h2>
            </div>
            <div className="p-6 space-y-6 DiagrammFourteenProgress">
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
          </div>
        </div>
      </div>
    </div>
  );
}
