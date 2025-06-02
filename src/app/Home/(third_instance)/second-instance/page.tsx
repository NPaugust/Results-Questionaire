"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCookie, getAssessmentData } from "@/lib/api/login";
import Map from "../../../../lib/utils/Maps/Map_oblast";
import Breadcrumb from "@/lib/utils/breadcrumb/BreadCrumb";
import RegionDetails from "./regions/RegionDetails/page";
import { useLanguage } from "@/context/LanguageContext";
import { useCourt } from "@/context/CourtContext";
import { ArrowDown, ArrowDownUp, ArrowUp } from "lucide-react";
import TableSkeleton, { MobileCardsSkeleton } from "@/lib/utils/SkeletonLoader/TableSkeleton";

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

interface CourtData {
  court_id: number;
  court: string;
  overall_assessment: number;
  total_survey_responses: number;
  assessment: { aspect: string; court_avg: number }[];
}

interface OblastData {
  id: number;
  name: string;
  ratings: number[];
  coordinates: [number, number];
  overall: number;
  totalAssessments: number;
  courtId: number;
}

export default function SecondInstanceUnifiedPage() {
  const { getTranslation } = useLanguage();
  const { selectedRegion, setSelectedRegion, regionName } = useCourt();

  const [regionCourts, setRegionCourts] = useState<CourtData[]>([]);
  const [regions, setRegions] = useState<OblastData[]>([]);
  const [oblastData, setOblastData] = useState<OblastData[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"courts" | "regions">("courts");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = getCookie("access_token");
        if (!token) throw new Error("Token is null");

        const assessmentData = await getAssessmentData();
        const processedRegions = assessmentData.regions.map((region: any) => ({
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
        setOblastData(processedRegions);
        setRegions(processedRegions);

        const response = await fetch("https://opros.sot.kg:443/api/v1/assessment/region_courts/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          if (response.status === 401) router.push("/login");
          throw new Error(`Ошибка: ${response.status}`);
        }
        const courtsData = await response.json();
        setRegionCourts(courtsData);
      } catch (error) {
        console.error("Ошибка:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const handleTabClick = (tab: "courts" | "regions") => {
    setActiveTab(tab);
    if (tab === "courts") {
      router.push("/Home/second-instance/");
    } else {
      router.push("/Home/second-instance/regions");
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : sortDirection === "desc" ? null : "asc");
      if (sortDirection === "desc") setSortField(null);
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

  const sortedRegions = [...regions].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;
    let aValue: number, bValue: number;
    switch (sortField) {
      case "judge":
        aValue = a.ratings[0];
        bValue = b.ratings[0];
        break;
      case "staff":
        aValue = a.ratings[1];
        bValue = b.ratings[1];
        break;
      case "process":
        aValue = a.ratings[2];
        bValue = b.ratings[2];
        break;
      case "office":
        aValue = a.ratings[3];
        bValue = b.ratings[3];
        break;
      case "accessibility":
        aValue = a.ratings[4];
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

  const sortedRegionCourts = [...regionCourts].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;
    let aValue: number, bValue: number;
    const aRatings = Object.fromEntries(a.assessment.map((item) => [item.aspect, item.court_avg]));
    const bRatings = Object.fromEntries(b.assessment.map((item) => [item.aspect, item.court_avg]));
    switch (sortField) {
      case "judge":
        aValue = aRatings["Судья"] || 0;
        bValue = bRatings["Судья"] || 0;
        break;
      case "staff":
        aValue = aRatings["Сотрудники"] || 0;
        bValue = bRatings["Сотрудники"] || 0;
        break;
      case "process":
        aValue = aRatings["Процесс"] || 0;
        bValue = bRatings["Процесс"] || 0;
        break;
      case "office":
        aValue = aRatings["Канцелярия"] || 0;
        bValue = bRatings["Канцелярия"] || 0;
        break;
      case "accessibility":
        aValue = aRatings["Здание"] || 0;
        bValue = bRatings["Здание"] || 0;
        break;
      case "count":
        aValue = a.total_survey_responses;
        bValue = b.total_survey_responses;
        break;
      case "overall":
        aValue = a.overall_assessment;
        bValue = b.overall_assessment;
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

  const handleCourtClick = (item: OblastData | CourtData) => {
    const isCourt = "court" in item;
    const courtId = isCourt ? item.court_id : item.courtId;
    const name = isCourt ? item.court : item.name;

    if (typeof window !== 'undefined') {
      localStorage.setItem("selectedCourtId", courtId.toString());
      localStorage.setItem("selectedCourtName", name);
      localStorage.setItem("breadcrumbSource", activeTab);

      if (!isCourt) {
        localStorage.setItem("regionName", name);
      } else {
        localStorage.removeItem("regionName");
      }
    }

    router.push(`/Home/second-instance/${courtId}/ratings`);
  };

  const handleRegionBackClick = () => {
    setSelectedRegion(null);
  };

  if (selectedRegion) {
    return <RegionDetails regionName={regionName} regions={regions} />;
  }

  const displayedData = activeTab === "courts" ? sortedRegionCourts : sortedRegions;

  return (
    <div className="max-w-[1250px] mx-auto w-full min-h-screen bg-transparent my-4">
      <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div className="text-xs sm:text-base">
          <Breadcrumb
            regionName={null}
            onRegionBackClick={handleRegionBackClick}
            showHome={true}
            headerKey="BreadCrumb_CourtName"
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

      <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden border border-gray-300">
        <Map oblastData={regions} />
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-8">
        <div className="hidden sm:block overflow-x-auto">
          {isLoading ? (
            <>
              <div className="hidden sm:block">
                <TableSkeleton rowCount={10} columnCount={9} hasHeader={true} hasFilter={true} />
              </div>
              <div className="sm:hidden">
                <MobileCardsSkeleton cardCount={5} />
              </div>
            </>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase bg-gray-50 border-r border-gray-200">
                    №
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase bg-gray-50 border-r border-gray-200">
                    {activeTab === "courts"
                      ? getTranslation("Regional_Courts_Table_NameCourt")
                      : getTranslation("Regional_Courts_Table_NameRegion")}
                  </th>
                  <th
                    className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase bg-gray-50 border-r border-gray-200 cursor-pointer"
                    onClick={() => handleSort("overall")}
                  >
                    <div className="flex items-center justify-between px-2">
                      <span className="whitespace-nowrap">{getTranslation("Regional_Courts_Table_Overall")}</span>
                      <div className="flex items-center justify-center">
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
                  <th
                    className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase bg-gray-50 border-r border-gray-200 cursor-pointer"
                    onClick={() => handleSort("count")}
                  >
                    <div className="flex items-center justify-between px-2">
                    <span className="whitespace-nowrap">{getTranslation("Regional_Courts_Table_Number of reviews")}</span>
                      <div className="flex items-center justify-center">
                    {getSortIcon("count")}
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-4">
                      {getTranslation("Loading")}
                    </td>
                  </tr>
                ) : displayedData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-4">
                      {getTranslation("No_Data")}
                    </td>
                  </tr>
                ) : (
                  displayedData.map((item, index) => {
                    const isCourt = "court" in item;
                    const ratings = isCourt
                      ? Object.fromEntries(item.assessment.map((a) => [a.aspect, a.court_avg]))
                      : {
                        Судья: item.ratings[0],
                        Сотрудники: item.ratings[1],
                        Процесс: item.ratings[2],
                        Канцелярия: item.ratings[3],
                        Здание: item.ratings[4],
                      };
                    return (
                      <tr
                        key={isCourt ? item.court_id : item.id}
                        className="hover:bg-gray-50/50 border-b border-gray-200"
                      >
                        <td className="px-3 py-2.5 text-sm text-gray-900 text-center border-r border-gray-200">
                          {index + 1}
                        </td>
                        <td
                          className="px-3 py-2.5 text-sm text-gray-900 border-r border-gray-200 cursor-pointer hover:text-blue-600"
                          onClick={() => handleCourtClick(item)}
                        >
                          {isCourt ? item.court : item.name}
                        </td>
                        <td
                          className={`px-3 py-2.5 text-sm text-gray-600 text-center border-r border-gray-200 ${getRatingColor(
                            isCourt ? item.overall_assessment : item.overall
                          )}`}
                        >
                          {(isCourt ? item.overall_assessment : item.overall).toFixed(1)}
                        </td>
                        <td
                          className={`px-3 py-2.5 text-sm text-gray-600 text-center border-r border-gray-200 ${getRatingColor(
                            ratings["Здание"] || 0
                          )}`}
                        >
                          {(ratings["Здание"] || 0).toFixed(1)}
                        </td>
                        <td
                          className={`px-3 py-2.5 text-sm text-gray-600 text-center border-r border-gray-200 ${getRatingColor(
                            ratings["Канцелярия"] || 0
                          )}`}
                        >
                          {(ratings["Канцелярия"] || 0).toFixed(1)}
                        </td>
                        <td
                          className={`px-3 py-2.5 text-sm text-gray-600 text-center border-r border-gray-200 ${getRatingColor(
                            ratings["Процесс"] || 0
                          )}`}
                        >
                          {(ratings["Процесс"] || 0).toFixed(1)}
                        </td>
                        <td
                          className={`px-3 py-2.5 text-sm text-gray-600 text-center border-r border-gray-200 ${getRatingColor(
                            ratings["Сотрудники"] || 0
                          )}`}
                        >
                          {(ratings["Сотрудники"] || 0).toFixed(1)}
                        </td>
                        <td
                          className={`px-3 py-2.5 text-sm text-gray-600 text-center border-r border-gray-200 ${getRatingColor(
                            ratings["Судья"] || 0
                          )}`}
                        >
                          {(ratings["Судья"] || 0).toFixed(1)}
                        </td>
                        <td className="px-3 py-2.5 text-sm text-gray-600 text-center border-r border-gray-200">
                          {isCourt ? item.total_survey_responses : item.totalAssessments}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="block sm:hidden p-3">
          {isLoading ? (
            <div className="text-center py-4">Загрузка...</div>
          ) : displayedData.length === 0 ? (
            <div className="text-center py-4">Данные отсутствуют</div>
          ) : (
            displayedData.map((item) => {
              const isCourt = "court" in item;
              const ratings = isCourt
                ? Object.fromEntries(item.assessment.map((a) => [a.aspect, a.court_avg]))
                : {
                  Судья: item.ratings[0],
                  Сотрудники: item.ratings[1],
                  Процесс: item.ratings[2],
                  Канцелярия: item.ratings[3],
                  Здание: item.ratings[4],
                };
              return (
                <div
                  key={isCourt ? item.court_id : item.id}
                  className="mb-3 p-3 border border-gray-100 rounded-lg bg-white duration-200 cursor-pointer"
                  onClick={() => handleCourtClick(item)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm font-semibold text-gray-800 hover:text-blue-600 truncate">
                      {(isCourt ? item.court_id : item.id)}. {isCourt ? item.court : item.name}
                    </div>
                    <div className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="ml-1 inline-block w-6 h-6 text-yellow-500" viewBox="0 0 24 24" stroke="none">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" stroke-linejoin="round" stroke-linecap="round" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">
                        {(isCourt ? item.overall_assessment : item.overall).toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Здание:</span>
                      <span>{(ratings["Здание"] || 0).toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Канцелярия:</span>
                      <span>{(ratings["Канцелярия"] || 0).toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Процесс:</span>
                      <span>{(ratings["Процесс"] || 0).toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Сотрудники:</span>
                      <span>{(ratings["Сотрудники"] || 0).toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Судья:</span>
                      <span>{(ratings["Судья"] || 0).toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Отзывы:</span>
                      <span>{isCourt ? item.total_survey_responses : item.totalAssessments}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}