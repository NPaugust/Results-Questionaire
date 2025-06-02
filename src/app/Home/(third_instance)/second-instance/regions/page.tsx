"use client";

import Map from "../../../../../lib/utils/Maps/Map_oblast";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAssessmentData, getCookie } from "@/lib/api/login";
import { useLanguage } from "@/context/LanguageContext";
import { useCourt } from "@/context/CourtContext";
import RegionDetails from "./RegionDetails/page";
import Breadcrumb from "@/lib/utils/breadcrumb/BreadCrumb";
import { ArrowDown, ArrowDownUp, ArrowUp } from "lucide-react";

type SortDirection = "asc" | "desc" | null;
type SortField =
  | "overall"
  | "judge"
  | "process"
  | "staff"
  | "office"
  | "accessibility"
  | "count"
  | null;

interface OblastData {
  id: number;
  name: string;
  ratings: number[];
  coordinates: [number, number];
  overall: number;
  totalAssessments: number;
  courtId: number;
}

interface Region {
  region_id: number;
  region_name: string;
  average_scores: { [key: string]: number };
  overall_region_assessment: number;
  total_assessments: number;
}

export default function RegionalCourts() {
  const [regions, setRegions] = useState<OblastData[]>([]);

  const { selectedRegion, setSelectedRegion, regionName, setRegionName } = useCourt();
  const { getTranslation } = useLanguage();
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"courts" | "regions">("regions");

  const handleTabClick = (tab: "courts" | "regions") => {
    setActiveTab(tab);
    if (tab === "courts") {
      router.push("/Home/second-instance/");
    } else if (tab === "regions") {
      router.push("/Home/second-instance/regions");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getCookie("access_token");
        if (!token) throw new Error("Token is null");
        const data = await getAssessmentData();
        const processedRegions = data.regions.map((region: Region) => ({
          id: region.region_id,
          name: region.region_name,
          overall: region.overall_region_assessment,
          totalAssessments: region.total_assessments,
          coordinates: [0, 0],
          courtId: region.region_id,
          ratings: [
            region.average_scores["Судья"] || 0,
            region.average_scores["Сотрудники"] || 0,
            region.average_scores["Процесс"] || 0,
            region.average_scores["Канцелярия"] || 0,
            region.average_scores["Здание"] || 0,
          ],
        }));
        setRegions(processedRegions);
      } catch (error) {
        console.error("Ошибка при получении данных:", error);
      }
    };

    fetchData();
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(
        sortDirection === "asc"
          ? "desc"
          : sortDirection === "desc"
            ? null
            : "asc"
      );
      if (sortDirection === "desc") {
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowDownUp className="ml-1 inline-block w-4 h-4" />;
    if (sortDirection === "asc")
      return <ArrowDown className="ml-1 inline-block text-blue-600 w-4 h-4" />;
    return <ArrowUp className="ml-1 inline-block text-blue-600 w-4 h-4" />;
  };

  const sortedData = [...regions].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;
    let aValue: number, bValue: number;
    switch (sortField) {
      case "judge":
        aValue = a.ratings[0]; // Судья
        bValue = b.ratings[0];
        break;
      case "staff":
        aValue = a.ratings[1]; // Сотрудники
        bValue = b.ratings[1];
        break;
      case "process":
        aValue = a.ratings[2]; // Процесс
        bValue = b.ratings[2];
        break;
      case "office":
        aValue = a.ratings[3]; // Канцелярия
        bValue = b.ratings[3];
        break;
      case "accessibility":
        aValue = a.ratings[4]; // Здание
        bValue = b.ratings[4];
        break;
      case "count":
        aValue = a.totalAssessments;
        bValue = b.totalAssessments;
        break;
      case "overall":
        aValue = a.overall;
        bValue = b.overall;
        break;
      default:
        return 0;
    }
    return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
  });

  const getRatingColor = (rating: number) => {
    if (rating === 0) return "bg-gray-100";
    if (rating <= 2) return "bg-red-100";
    if (rating <= 3.5) return "bg-yellow-100";
    return "bg-green-100";
  };

  const handleCourtClick = async (court: OblastData) => {
    try {
      const token = getCookie("access_token");
      if (!token) throw new Error("Token is null");

      const response = await fetch(
        `https://opros.sot.kg/api/v1/assessment/region/${court.id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        console.warn("Токен устарел, выполняем выход...");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        router.push("/login");
        throw new Error(`Ошибка TP: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Данные по региону отсутствуют или неверного формата.");
      }

      const updatedRegions = data.map((courtData: any) => ({
        id: courtData.court_id,
        name: courtData.court,
        overall: courtData.overall_assessment,
        ratings: courtData.assessment.map((item: any) => item.court_avg),
        totalAssessments: courtData.total_survey_responses,
        coordinates: [courtData.latitude, courtData.longitude],
        instantiation: courtData.instantiation,
      }));

      setSelectedRegion(updatedRegions);
      setRegionName(court.name);
    } catch (error) {
      console.error("Ошибка при получении данных для региона:", error);
    }
  };

  const handleRegionBackClick = () => {
    setSelectedRegion(null);
  };

  return (
    <div className="max-w-[1250px] mx-auto w-full min-h-screen bg-transparent from-gray-50 to-gray-100 my-4 Oblast">
      {!selectedRegion ? (
        <>
          <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div className="text-xs sm:text-base">
              <Breadcrumb
                regionName={null}
                onRegionBackClick={handleRegionBackClick}
                showHome={true}
                headerKey="BreadCrumb_RegionName"
              />
            </div>
            <div className="flex gap-2 sm:gap-4 mt-2">
              <button
                className={`py-1 px-2 sm:py-2 sm:px-4 text-xs sm:text-base rounded-lg font-medium transition-all duration-200 ${activeTab === "courts"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                onClick={() => handleTabClick("courts")}
              >
                {getTranslation("Regional_Courts_Button_Courts")}
              </button>
              <button
                className={`py-1 px-2 sm:py-2 sm:px-4 text-xs sm:text-base rounded-lg font-medium transition-all duration-200 ${activeTab === "regions"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                onClick={() => handleTabClick("regions")}
              >
                {getTranslation("Regional_Courts_Button_Regions")}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm mb-8 overflow-hidden border border-gray-300">
            <Map oblastData={regions} />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {/* Таблица для десктопа (≥ 640px) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase bg-gray-50 border-r border-gray-200">
                      №
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase bg-gray-50 border-r border-gray-200">
                      {getTranslation("Regional_Courts_Table_NameRegion")}
                    </th>
                    <th
                      className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase bg-gray-50 border-r border-gray-200 cursor-pointer"
                      onClick={() => handleSort("overall")}
                    >
                      <div className="flex items-center justify-between px-2">
                        <span className="whitespace-nowrap flex-grow">{getTranslation("Regional_Courts_Table_Overall")}</span>
                        <div className="flex-shrink-0">
                          {getSortIcon("overall")}
                        </div>
                      </div>
                    </th>

                    <th
                      className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase bg-gray-50 border-r border-gray-200 cursor-pointer"
                      onClick={() => handleSort("judge")}
                    >
                      <div className="flex items-center justify-between px-2">
                        <span>{getTranslation("Regional_Courts_Table_Build")}</span>
                        {getSortIcon("judge")}
                      </div>
                    </th>
                    <th
                      className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase bg-gray-50 border-r border-gray-200 cursor-pointer"
                      onClick={() => handleSort("process")}
                    >
                      <div className="flex items-center justify-between px-2">
                        <span>{getTranslation("Regional_Courts_Table_Chancellery")}</span>
                        {getSortIcon("process")}
                      </div>
                    </th>
                    <th
                      className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase bg-gray-50 border-r border-gray-200 cursor-pointer"
                      onClick={() => handleSort("staff")}
                    >
                      <div className="flex items-center justify-between px-2">
                        <span>{getTranslation("Regional_Courts_Table_Procces")}</span>
                        {getSortIcon("staff")}
                      </div>
                    </th>
                    <th
                      className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase bg-gray-50 border-r border-gray-200 cursor-pointer"
                      onClick={() => handleSort("office")}
                    >
                      <div className="flex items-center justify-between px-2">
                        <span>{getTranslation("Regional_Courts_Table_Staff")}</span>
                        {getSortIcon("office")}
                      </div>
                    </th>
                    <th
                      className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase bg-gray-50 border-r border-gray-200 cursor-pointer"
                      onClick={() => handleSort("accessibility")}
                    >
                      <div className="flex items-center justify-between px-2">
                        <span>{getTranslation("Regional_Courts_Table_Judge")}</span>
                        {getSortIcon("accessibility")}
                      </div>
                    </th>
                    <th className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase bg-gray-50 border-r border-gray-200">
                      {getTranslation("Regional_Courts_Table_Number of reviews")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((oblast) => (
                    <tr
                      key={oblast.id}
                      className="hover:bg-gray-50/50 border-b border-gray-200"
                    >
                      <td className="px-3 py-2.5 text-sm text-gray-900 text-center border-r border-gray-200">
                        {oblast.id}
                      </td>
                      <td
                        className="px-3 py-2.5 text-sm text-gray-900 border-r border-gray-200 cursor-pointer hover:text-blue-600"
                        onClick={() => handleCourtClick(oblast)}
                      >
                        {oblast.name}
                      </td>
                      <td
                        className={`px-3 py-2.5 text-sm text-gray-600 text-center border-r border-gray-200 ${getRatingColor(
                          oblast.overall
                        )}`}
                      >
                        {oblast.overall.toFixed(1)}
                      </td>
                      <td
                        className={`px-3 py-2.5 text-sm text-gray-600 text-center border-r border-gray-200 ${getRatingColor(
                          oblast.ratings[0]
                        )}`}
                      >
                        {oblast.ratings[0].toFixed(1)}
                      </td>
                      <td
                        className={`px-3 py-2.5 text-sm text-gray-600 text-center border-r border-gray-200 ${getRatingColor(
                          oblast.ratings[1]
                        )}`}
                      >
                        {oblast.ratings[1].toFixed(1)}
                      </td>
                      <td
                        className={`px-3 py-2.5 text-sm text-gray-600 text-center border-r border-gray-200 ${getRatingColor(
                          oblast.ratings[2]
                        )}`}
                      >
                        {oblast.ratings[2].toFixed(1)}
                      </td>
                      <td
                        className={`px-3 py-2.5 text-sm text-gray-600 text-center border-r border-gray-200 ${getRatingColor(
                          oblast.ratings[3]
                        )}`}
                      >
                        {oblast.ratings[3].toFixed(1)}
                      </td>
                      <td
                        className={`px-3 py-2.5 text-sm text-gray-600 text-center border-r border-gray-200 ${getRatingColor(
                          oblast.ratings[4]
                        )}`}
                      >
                        {oblast.ratings[4].toFixed(1)}
                      </td>
                      <td className="px-3 py-2.5 text-sm text-gray-600 text-center border-r border-gray-200">
                        {oblast.totalAssessments}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Карточки для мобильных (< 640px) */}
            <div className="block sm:hidden p-3">
              {sortedData.map((oblast) => (
                <div
                  key={oblast.id}
                  className="mb-3 p-3 border border-gray-100 rounded-lg bg-white duration-200 cursor-pointer"
                  onClick={() => handleCourtClick(oblast)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm font-semibold text-gray-800 hover:text-blue-600 truncate">
                      {oblast.id}. {oblast.name}
                    </div>
                    <div className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="ml-1 inline-block w-6 h-6 text-yellow-500" viewBox="0 0 24 24" stroke="none">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" strokeLinejoin="round" strokeLinecap="round" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">
                        {oblast.overall.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Здание:</span>
                      <span>{oblast.ratings[0].toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Канцелярия:</span>
                      <span>{oblast.ratings[1].toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Процесс:</span>
                      <span>{oblast.ratings[2].toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Сотрудники:</span>
                      <span>{oblast.ratings[3].toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Судья:</span>
                      <span>{oblast.ratings[4].toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Отзывы:</span>
                      <span>{oblast.totalAssessments}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <RegionDetails regionName={regionName} regions={regions} />
      )}
    </div>
  );
}