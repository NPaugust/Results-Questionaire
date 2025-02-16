"use client";
import Map from "../components/Map_oblast";
import { useState, useEffect } from "react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa"; 
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getAssessmentData, getCookie } from "@/api/login";

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

// Определяем интерфейс для данных области
interface OblastData {
  id: number;
  name: string;
  ratings: number[];
  coordinates: [number, number];
  overall: number;
  totalAssessments: number;
}

interface Region {
  region_id: number;
  region_name: string;
  average_scores: {
    [key: string]: number;
  };
  overall_region_assessment: number;
  total_assessments: number;
}

export default function RegionalCourts() {
  const [regions, setRegions] = useState<OblastData[]>([]); // Состояние для хранения данных о регионах
  const [selectedOblast, setSelectedOblast] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const pathname = usePathname();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getCookie('access_token');
        if (!token) {
          throw new Error("Token is null");
        }
        const data = await getAssessmentData();
        const processedRegions = data.regions.map((region: Region) => ({
          id: region.region_id,
          name: region.region_name,
          ratings: [
            region.average_scores["Здание"],
            region.average_scores["Канцелярия"],
            region.average_scores["Процесс"],
            region.average_scores["Сотрудники"],
            region.average_scores["Судья"],
          ],
          overall: region.overall_region_assessment,
          totalAssessments: region.total_assessments,
          coordinates: [0, 0],
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
        sortDirection === 'asc' ? 'desc' : 
        sortDirection === 'desc' ? null : 'asc'
      );
      if (sortDirection === 'desc') {
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <FaSort className="ml-1 inline-block" />;
    if (sortDirection === "asc")
      return <FaSortUp className="ml-1 inline-block text-blue-600" />;
    return <FaSortDown className="ml-1 inline-block text-blue-600" />;
  };

  const sortedData = [...regions].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;

    let aValue: number, bValue: number;

    switch (sortField) {
      case 'judge':
        aValue = a.ratings[4];
        bValue = b.ratings[4];
        break;
      case 'process':
        aValue = a.ratings[2];
        bValue = b.ratings[2];
        break;
      case 'staff':
        aValue = a.ratings[3];
        bValue = b.ratings[3];
        break;
      case 'office':
        aValue = a.ratings[1];
        bValue = b.ratings[1];
        break;
      case 'accessibility':
        aValue = a.ratings[0];
        bValue = b.ratings[0];
        break;
      case 'count':
        aValue = a.totalAssessments;
        bValue = b.totalAssessments;
        break;
      case 'overall':
        aValue = a.overall;
        bValue = b.overall;
        break;
      default:
        return 0;
    }

    // Обработка случая, когда значение равно 0 (нет данных)
    if (aValue === 0) aValue = -Infinity;
    if (bValue === 0) bValue = -Infinity;

    if (aValue === -Infinity && bValue === -Infinity) return 0;
    if (aValue === -Infinity) return sortDirection === 'asc' ? 1 : -1;
    if (bValue === -Infinity) return sortDirection === 'asc' ? -1 : 1;

    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
  });

  // Добавьте эту функцию для определения цвета ячейки на основе оценки
  const getRatingColor = (rating: number) => {
    if (rating === 0) return '';
    if (rating >= 4.5) return 'bg-green-100';
    if (rating >= 4.0) return 'bg-lime-100';
    if (rating >= 3.5) return 'bg-yellow-100';
    if (rating >= 3.0) return 'bg-orange-100';
    if (rating >= 2.5) return 'bg-yellow-100';
    if (rating >= 2.0) return 'bg-orange-200';
    if (rating >= 1.5) return 'bg-red-200';
    return 'bg-red-300';
  };

  return (
    
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-[1200px] mx-auto px-4 py-4">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-medium">Оценки по областям</h2>
          <div className="flex space-x-4">
            <Link
              href="/maps/oblast/Regional-Courts"
              className={`px-4 py-2 rounded-md font-medium transition duration-200
                  ${
                    pathname === "/maps/oblast/Regional-Courts"
                    ? "bg-blue-100/40 text-blue-600"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  }`}
            >
              Средние оценки по областям
            </Link>
            <Link href="/Remarks"  className={`px-4 py-2 rounded-md font-medium transition duration-200
                  ${
                    pathname === "/Remarks"
                    ? "bg-blue-100/40 text-blue-600"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  }`}
            >
              Замечания и предложения
            </Link>
          </div>
          {selectedOblast && (
            <button
              onClick={() => setSelectedOblast(null)}
              className="px-3 py-1 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Сбросить фильтр
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden border border-gray-100">
          <Map 
            selectedOblast={selectedOblast} 
            oblastData={regions} 
            onSelectOblast={setSelectedOblast}
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead className="bg-gray-100 select-none">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-center font-bold text-base whitespace-nowrap">
                    №
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center font-bold text-base whitespace-nowrap">
                    Наименование суда
                  </th>

                  <th 
                    className="border border-gray-300 px-4 py-2 text-center font-bold text-base whitespace-nowrap cursor-pointer"
                    onClick={() => handleSort("overall")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Общая оценка
                      {getSortIcon("overall")}
                    </div>
                  </th>
                  <th 
                    className="border border-gray-300 px-4 py-2 text-center font-bold text-base whitespace-nowrap cursor-pointer"
                    onClick={() => handleSort("judge")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Судья
                      {getSortIcon("judge")}
                    </div>
                  </th>
                  <th 
                    className="border border-gray-300 px-4 py-2 text-center font-bold text-base whitespace-nowrap cursor-pointer"
                    onClick={() => handleSort("process")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Процесс
                      {getSortIcon("process")}
                    </div>
                  </th>
                  <th 
                    className="border border-gray-300 px-4 py-2 text-center font-bold text-base whitespace-nowrap cursor-pointer"
                    onClick={() => handleSort("staff")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Сотрудники
                      {getSortIcon("staff")}
                    </div>
                  </th>
                  <th 
                    className="border border-gray-300 px-4 py-2 text-center font-bold text-base whitespace-nowrap cursor-pointer"
                    onClick={() => handleSort("office")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Канцелярия
                      {getSortIcon("office")}
                    </div>
                  </th>
                  <th 
                    className="border border-gray-300 px-4 py-2 text-center font-bold text-base whitespace-nowrap cursor-pointer"
                    onClick={() => handleSort("count")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Кол-во оценок
                      {getSortIcon("count")}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((oblast) => (
                  <tr
                    key={oblast.id}
                    className="hover:bg-gray-50/50 border-b border-gray-200"
                  >
                    <td className="border border-gray-300 px-4 py-2 text-base text-center">
                      {oblast.id}
                    </td>
                    <td 
                      className="border border-gray-300 px-4 py-2 text-base text-center text-blue-600 hover:text-blue-800 cursor-pointer"
                      onClick={() => setSelectedOblast(oblast.name)}
                    >
                      {oblast.name}
                    </td>
                    <td className={`border border-gray-300 px-4 py-2 text-base text-center ${getRatingColor(oblast.overall)}`}>
                      {oblast.overall.toFixed(1)}
                    </td>
                    <td className={`border border-gray-300 px-4 py-2 text-base text-center ${getRatingColor(oblast.ratings[4])}`}>
                      {oblast.ratings[4].toFixed(1)}
                    </td>
                    <td className={`border border-gray-300 px-4 py-2 text-base text-center ${getRatingColor(oblast.ratings[2])}`}>
                      {oblast.ratings[2].toFixed(1)}
                    </td>
                    <td className={`border border-gray-300 px-4 py-2 text-base text-center ${getRatingColor(oblast.ratings[3])}`}>
                      {oblast.ratings[3].toFixed(1)}
                    </td>
                    <td className={`border border-gray-300 px-4 py-2 text-base text-center ${getRatingColor(oblast.ratings[1])}`}>
                      {oblast.ratings[1].toFixed(1)}
                    </td>
                    <td className={`border border-gray-300 px-4 py-2 text-base text-center }`}>
                      {oblast.ratings[0].toFixed(1)}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
