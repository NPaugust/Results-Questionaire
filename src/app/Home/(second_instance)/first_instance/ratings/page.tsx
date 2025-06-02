"use client";

import React, { useEffect, useState } from "react";
import { getAssessmentData, getCurrentUser } from "@/lib/api/login";
import { ArrowDown, ArrowDownUp, ArrowUp } from "lucide-react";
import { useRouter } from "next/navigation";
import RegionMap, { RegionData } from "@/components/Maps/RegionMap";
import { useLanguage } from "@/context/LanguageContext";
import { useCourt } from "@/context/CourtContext";
import TableSkeleton from "@/lib/utils/SkeletonLoader/TableSkeleton";


interface Assessment {
  aspect: string;
  court_avg: number;
  assessment_count: string;
}

interface CourtData {
  court_id: number;
  court: string;
  instantiation: string;
  overall_assessment: number;
  assessment: Assessment[];
  assessment_count: string;
  total_survey_responses: number;
}

const FirstInstance = () => {
  const [assessmentData, setAssessmentData] = useState<CourtData[]>([]);
  const { setCourtName } = useCourt();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRegion, setUserRegion] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const { language, getTranslation } = useLanguage();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessmentData = async () => {
      try {
        const data = await getAssessmentData();
        setAssessmentData(data.courts);
      } catch (error) {
        console.error("Ошибка при получении данных оценки:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentData();
  }, []);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const data = await getCurrentUser();
        setCurrentUser(data);

        if (data.role === "Председатель 2 инстанции") {
          const regionName = getRegionFromCourt(data.court);
          setUserRegion(regionName);
        }
      } catch (error) {
        console.error("Ошибка при получении данных пользователя:", error);
        router.push('/login')
      }
    };

    fetchCurrentUser();
  }, []);

  const handleSort = (field: string) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortField("");
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowDownUp className="ml-1 inline-block w-4 h-4" />;
    if (sortDirection === "asc")
      return <ArrowDown className="ml-1 inline-block text-blue-600 w-4 h-4" />;
    return <ArrowUp className="ml-1 inline-block text-blue-600 w-4 h-4" />;
  };

  const getRegionFromCourt = (userCourt: string): string => {
    const regionMap: { [key: string]: string } = {
      "Таласский областной суд": "Таласская область",
      "Иссык-кульский областной суд": "Иссык-Кульская область",
      "Нарынский областной суд": "Нарынская область",
      "Баткенский областной суд": "Баткенская область",
      "Чуйский областной суд": "Чуйская область",
      "Ошский областной суд": "Ошская область",
      "Жалал-Абадский областной суд": "Жалал-Абадская область",
      "Бишкекский городской суд": "Город Бишкек",
    };
    return regionMap[userCourt] || "";
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsSearchOpen(false);
    }
  };

  const filteredCourts = Array.isArray(assessmentData)
    ? assessmentData.filter((court) =>
      searchQuery === "" ||
      court.court.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : [];

  const sortedCourts = [...filteredCourts].sort((a, b) => {
    if (!sortField) return 0;

    let valueA, valueB;

    if (sortField === "overall") {
      valueA = a.overall_assessment;
      valueB = b.overall_assessment;
    } else {
      const aspectA = a.assessment.find((assess) => assess.aspect === sortField);
      const aspectB = b.assessment.find((assess) => assess.aspect === sortField);
      valueA = aspectA ? aspectA.court_avg : 0;
      valueB = aspectB ? aspectB.court_avg : 0;
    }

    if (sortDirection === "asc") {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });

  const getRatingColorClass = (rating: number) => {
    if (rating === 0) return "bg-gray-100";
    if (rating < 2) return "bg-red-100";
    if (rating < 2.5) return "bg-red-100";
    if (rating < 3) return "bg-orange-100";
    if (rating < 3.5) return "bg-yellow-100";
    if (rating < 4) return "bg-emerald-100";
    return "bg-green-100";
  };

  const transformCourtData = (courts: CourtData[]): RegionData[] => {
    const transformedData: RegionData[] = [];
    courts.forEach((court) => {
      if (court.court_id) {
        transformedData.push({
          id: court.court_id,
          name: court.court,
          ratings: [
            court.assessment.find((a) => a.aspect === "Судья")?.court_avg || 0,
            court.assessment.find((a) => a.aspect === "Сотрудники")?.court_avg || 0,
            court.assessment.find((a) => a.aspect === "Процесс")?.court_avg || 0,
            court.assessment.find((a) => a.aspect === "Канцелярия")?.court_avg || 0,
            court.assessment.find((a) => a.aspect === "Здание")?.court_avg || 0,
          ],
          overall: court.overall_assessment,
          totalAssessments: Number(court.assessment_count) || 0,
        });
      }
    });
    return transformedData;
  };

  const handleCourtClick = (court: CourtData) => {
    const courtId = court.court_id.toString();
    const courtName = court.court;

    if (typeof window !== 'undefined') {
      localStorage.setItem("courtName2", court.court);
    }
    setCourtName(courtName);
    router.push(`/Home/first_instance/court/${courtId}`);
  };

  if (loading) {
    return (
      <div className="max-w-[1250px] mx-auto px-4 py-4">
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-[1250px] mx-auto container px-4 py-8">
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold leading-none py-2">{userRegion}</h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden border border-gray-300">
          <RegionMap
            regionName={userRegion || ""}
            selectedRegion={transformCourtData(filteredCourts)}
            onCourtClick={(courtId) => {
              const court = filteredCourts.find((c) => c.court_id === courtId);
              if (court) handleCourtClick(court);
            }}
          />
        </div>

        <div className="mt-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="overflow-x-auto">
              {loading ? (
                <TableSkeleton 
                  rowCount={10} 
                  columnCount={9} 
                  hasHeader={true} 
                  hasFilter={true} 
                />
              ) : (
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase bg-gray-50 border-r border-gray-200">
                        №
                      </th>
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase bg-gray-50 border-r border-gray-200 w-56 min-w-[14rem]">
                        <div className="flex items-center justify-between">
                          <span className="truncate mr-2">
                            {getTranslation("Regional_Courts_Table_NameRegion", language)}
                          </span>
                          <div className="relative">
                            <div
                              className={`flex items-center overflow-hidden transition-all duration-500 ease-in-out ${isSearchOpen ? "w-36" : "w-8"
                                }`}
                            >
                              <div
                                className={`flex-grow transition-all duration-500 ease-in-out ${isSearchOpen ? "opacity-100 w-full" : "opacity-0 w-0"
                                  }`}
                              >
                                <input
                                  type="text"
                                  value={searchQuery}
                                  onChange={handleSearchChange}
                                  onKeyDown={handleKeyDown}
                                  placeholder="Поиск суда"
                                  className="w-full px-2 py-1.5 text-xs text-gray-900 bg-white border border-gray-300 rounded-lg outline-none"
                                  autoFocus={isSearchOpen}
                                />
                              </div>
                              <div
                                className="cursor-pointer p-1.5 hover:bg-gray-100 rounded-full flex-shrink-0"
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                              >
                                <svg
                                  className="w-4 h-4 text-gray-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                  />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </th>
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase bg-gray-50 border-r border-gray-200">
                        Инстанция
                      </th>
                      <th
                        className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase bg-gray-50 border-r border-gray-200 cursor-pointer"
                        onClick={() => handleSort("overall")}
                      >
                        <div className="flex items-center justify-between px-2">
                          <span className="whitespace-nowrap">{getTranslation("Regional_Courts_Table_Overall")}</span>
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
                          {getTranslation("Regional_Courts_Table_Judge", language)}
                          {getSortIcon("judge")}
                        </div>
                      </th>
                      <th
                        className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase bg-gray-50 border-r border-gray-200 cursor-pointer"
                        onClick={() => handleSort("process")}
                      >
                        <div className="flex items-center justify-between px-2">
                          {getTranslation("Regional_Courts_Table_Procces", language)}
                          {getSortIcon("process")}
                        </div>
                      </th>
                      <th
                        className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase bg-gray-50 border-r border-gray-200 cursor-pointer"
                        onClick={() => handleSort("staff")}
                      >
                        <div className="flex items-center justify-between px-2">
                          {getTranslation("Regional_Courts_Table_Staff", language)}
                          {getSortIcon("staff")}
                        </div>
                      </th>
                      <th
                        className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase bg-gray-50 border-r border-gray-200 cursor-pointer"
                        onClick={() => handleSort("office")}
                      >
                        <div className="flex items-center justify-between px-2">
                          {getTranslation("Regional_Courts_Table_Building", language)}
                          {getSortIcon("office")}
                        </div>
                      </th>
                      <th className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase bg-gray-50">
                        {getTranslation("Regional_Courts_Table_NumberResponses", language)}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedCourts.map((court, index) => {
                      const judgeRating =
                        court.assessment.find((item) => item.aspect === "Судья")?.court_avg || 0;
                      const processRating =
                        court.assessment.find((item) => item.aspect === "Процесс")?.court_avg || 0;
                      const staffRating =
                        court.assessment.find((item) => item.aspect === "Сотрудники")?.court_avg || 0;
                      const officeRating =
                        court.assessment.find((item) => item.aspect === "Канцелярия")?.court_avg || 0;
                      const buildingRating =
                        court.assessment.find((item) => item.aspect === "Здание")?.court_avg || 0;

                      return (
                        <tr
                          key={court.court_id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-500 border-r border-gray-200">
                            {index + 1}
                          </td>
                          <td
                            className="px-3 py-2.5 text-left text-xs text-gray-600 cursor-pointer hover:text-blue-500"
                            onClick={() => handleCourtClick(court)}
                          >
                            {court.court}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200">
                            {court.instantiation}
                          </td>
                          <td
                            className={`px-3 py-2 whitespace-nowrap text-sm text-center text-gray-900 border-r border-gray-200 ${getRatingColorClass(
                              court.overall_assessment
                            )}`}
                          >
                            {court.overall_assessment.toFixed(1)}
                          </td>
                          <td
                            className={`px-3 py-2 whitespace-nowrap text-sm text-center text-gray-900 border-r border-gray-200 ${getRatingColorClass(
                              judgeRating
                            )}`}
                          >
                            {judgeRating.toFixed(1)}
                          </td>
                          <td
                            className={`px-3 py-2 whitespace-nowrap text-sm text-center text-gray-900 border-r border-gray-200 ${getRatingColorClass(
                              processRating
                            )}`}
                          >
                            {processRating.toFixed(1)}
                          </td>
                          <td
                            className={`px-3 py-2 whitespace-nowrap text-sm text-center text-gray-900 border-r border-gray-200 ${getRatingColorClass(
                              staffRating
                            )}`}
                          >
                            {staffRating.toFixed(1)}
                          </td>
                          <td
                            className={`px-3 py-2 whitespace-nowrap text-sm text-center text-gray-900 border-r border-gray-200 ${getRatingColorClass(
                              buildingRating
                            )}`}
                          >
                            {buildingRating.toFixed(1)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                            {court.total_survey_responses}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstInstance;