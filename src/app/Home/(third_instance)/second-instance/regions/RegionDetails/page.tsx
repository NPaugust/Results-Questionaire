"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useCourt } from "@/context/CourtContext";
import { useChartData } from "@/context/ChartDataContext";
import React, {
  useCallback,
  useState,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { ArrowDown, ArrowDownUp, ArrowUp } from "lucide-react";
import Breadcrumb from "@/lib/utils/breadcrumb/BreadCrumb";
import * as d3 from "d3";
import { GeoPermissibleObjects } from "d3-geo";
import geoData from "../../../../../../../public/gadm41_KGZ_1.json";
import districtsGeoData from "../../../../../../../public/gadm41_KGZ_2.json";
import debounce from "lodash/debounce";
import { useRouter } from "next/navigation";

const getRatingColor = (rating: number) => {
  if (rating === 0) return "bg-gray-100";
  if (rating < 2) return "bg-red-100image.png";
  if (rating < 2.5) return "bg-red-100";
  if (rating < 3) return "bg-orange-100";
  if (rating < 3.5) return "bg-yellow-100";
  if (rating < 4) return "bg-emerald-100";
  return "bg-green-100";
};

const getRatingBorderColor = (rating: number) => {
  if (rating === 0) return "#9CA3AF"; // gray-400
  if (rating <= 2) return "#EF4444"; // red-500
  if (rating <= 3.5) return "#F59E0B"; // yellow-500
  return "#22C55E"; // green-500
};

interface RegionData {
  id: number;
  name: string;
  ratings: number[];
  overall: number;
  totalAssessments: number;
  coordinates?: [number, number];
  instance?: string;
  assessment?: {
    judge: number;
    process: number;
    staff: number;
    office: number;
    building: number;
  };
}

interface GeoFeature {
  type: string;
  properties: {
    GID_1: string;
    GID_0: string;
    COUNTRY: string;
    NAME_1: string;
    VARNAME_1: string;
    NL_NAME_1: string;
    TYPE_1: string;
    ENGTYPE_1: string;
    CC_1: string;
    HASC_1: string;
    ISO_1: string;
  };
  geometry: {
    type: string;
    coordinates: number[][][][] | number[][][];
  };
}

interface GeoJsonData {
  type: string;
  name: string;
  crs: {
    type: string;
    properties: {
      name: string;
    };
  };
  features: GeoFeature[];
}

const courtPositionsMap: {
  [key: string]: { [key: string]: [number, number] };
} = {
  "Баткенская область": {
    "Баткенский областной суд": [69.8785, 40.0553],
    "Сулюктинский городской суд": [69.5672, 39.9373],
    "Кызыл-Кийский городской суд": [72.1279, 40.2573],
    "Лейлекский районный суд": [69.7922, 39.7445],
    "Баткенский районный суд": [70.8199, 40.0553],
    "Кадамжайский районный суд": [71.7499, 40.1343],
    "Административный суд Баткенской области": [70.9499, 40.0553],
  },
  "Жалал-Абадская область": {
    "Жалал-Абадский областной суд": [72.9873, 41.1056],
    "Жалал-Абадский городской суд": [73.0023, 40.9333],
    "Кара-Кульский городской суд": [72.8667, 41.6167],
    "Майлуу-Сууский городской суд": [72.4667, 41.3],
    "Таш-Кумырский городской суд": [72.2167, 41.3467],
    "Базар-Коргонский районный суд": [72.75, 41.0333],
    "Ноокенский районный суд": [72.6167, 41.1833],
    "Сузакский районный суд": [73.0167, 40.8833],
    "Токтогульский районный суд": [72.9423, 41.8744],
    "Тогуз-Тороуский районный суд": [74.3167, 41.7833],
    "Чаткальский районный суд": [71.8, 41.7667],
    "Аксыйский районный суд": [71.8667, 41.4333],
    "Ала-Букинский районный суд": [71.4, 41.4],
    "Административный суд Жалал-Абадской области": [73.13, 41.1156],
  },
  "Иссык-Кульская область": {
    "Иссык-Кульский областной суд": [77.0667, 42.65],
    "Балыкчинский городской суд": [76.1833, 42.45],
    "Каракольский городской суд": [78.3833, 42.4833],
    "Ак-Суйский районный суд": [78.5333, 42.5],
    "Жети-Огузский районный суд": [78.0289, 42.0833],
    "Иссык-Кульский районный суд": [77.2067, 42.6167],
    "Тонский районный суд": [77.9167, 42.1333],
    "Тюпский районный суд": [78.3667, 42.7278],
    "Административный суд Иссык-Кульской области": [77.0867, 42.64],
  },
  "Нарынская область": {
    "Нарынский областной суд": [75.9311, 41.4473],
    "Нарынский городской суд": [76.0033, 41.5433],
    "Ат-Башинский районный суд": [75.8067, 41.17],
    "Ак-Талинский районный суд": [75.3567, 41.42],
    "Жумгальский районный суд": [74.8333, 41.9333],
    "Кочкорский районный суд": [75.7833, 42.2167],
    "Административный суд Нарынской области": [76.0711, 41.4373],
  },
  "Ошская область": {
    "Ошский областной суд": [72.8825, 40.49],
    "Ошский городской суд": [72.812, 40.5533],
    "Алайский районный суд": [72.9833, 39.65],
    "Араванский районный суд": [72.5107, 40.5067],
    "Кара-Кулжинский районный суд": [73.5, 40.2667],
    "Кара-Сууский районный суд": [72.8667, 40.7],
    "Ноокатский районный суд": [72.6167, 40.2667],
    "Узгенский районный суд": [73.3, 40.7667],
    "Чон-Алайский районный суд": [72.0, 39.5],
    "Административный суд Ошской области": [72.7585, 40.48],
  },
  "Таласская область": {
    "Таласский областной суд": [72.2425, 42.555],
    "Таласский городской суд": [72.203, 42.5167],
    "Бакай-Атинский районный суд": [72.1667, 42.3333],
    "Кара-Бууринский районный суд": [71.13, 42.5],
    "Манасский районный суд": [72.5, 42.5333],
    "Административный суд Таласской области": [72.2545, 42.515],
  },
  "Чуйская область": {
    "Чуйский областной суд": [74.59, 42.9046],
    "Токмокский городской суд": [75.3, 42.8333],
    "Аламудунский районный суд": [74.6833, 42.87],
    "Жайылский районный суд": [73.6167, 42.8667],
    "Кеминский районный суд": [75.7, 42.7833],
    "Московский районный суд": [73.9333, 42.8833],
    "Панфиловский районный суд": [73.65, 42.8333],
    "Сокулукский районный суд": [74.0833, 42.8667],
    "Ысык-Атинский районный суд": [74.9833, 42.8833],
    "Административный суд Чуйской области": [74.5, 42.8646],
  },
  "Город Бишкек": {
    "Свердловский районный суд": [74.52, 42.8646],
    "Октябрьский районный суд": [74.6, 42.9246],
    "Ленинский районный суд": [74.575, 42.8446],
    "Верховный суд": [74.6012, 42.88],
    "Административный суд г. Бишкек": [74.5934, 42.9023],
    "Первомайский районный суд": [74.66, 42.8846],
    "Бишкекский городской суд": [74.5823, 42.8801],
  },
};

type SortField =
  | "overall"
  | "judge"
  | "staff"
  | "process"
  | "office"
  | "building"
  | "count"
  | null;
type SortDirection = "asc" | "desc" | null;

function getEventCoordinates(event: any) {
  if (event.touches && event.touches[0]) {
    return {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    };
  }
  return {
    x: event.clientX,
    y: event.clientY,
  };
}

const districtNamesRu: { [key: string]: string } = {
  Batken: "Баткенский районный суд",
  Kadamjai: "Кадамжайский районный суд",
  Lailak: "Лейлекский районный суд",
  "Ak-Suu": "Ак-Суйский районный суд",
  "Djety-Oguz": "Жети-Огузский районный суд",
  "Ysyk-Köl": "Иссык-Кульский районный суд",
  Balykchy: "Балыкчинский районный суд",
  Ton: "Тонский районный суд",
  Tüp: "Тюпский районный суд",
  "Ak-Talaa": "Ак-Талинский районный суд",
  "At-Bashi": "Ат-Башинский районный суд",
  Jumgal: "Жумгальский районный суд",
  Kochkor: "Кочкорский районный суд",
  Naryn: "Нарынский районный суд",
  Alai: "Алайский районный суд",
  Aravan: "Араванский районный суд",
  "Kara-Suu": "Кара-Суйский районный суд",
  Nookat: "Ноокатский районный суд",
  Uzgen: "Узгенский районный суд",
  "Chong-Alay": "Чон-Алайский районный суд",
  "Bakai-Ata": "Бакай-Атинский районный суд",
  "Kara-Buura": "Кара-Буринский районный суд",
  Manas: "Манасский районный суд",
  Talas: "Таласский районный суд",
  "Ala-Buka": "Ала-Букинский районный суд",
  Aksyi: "Аксыйский районный суд",
  "Bazar-Korgon": "Базар-Коргонский районный суд",
  Chatkal: "Чаткальский районный суд",
  Nooken: "Ноокенский районный суд",
  Suzak: "Сузакский районный суд",
  "Togus-Toro": "Тогуз-Тороуский районный суд",
  Toktogul: "Токтогульский районный суд",
  Alamüdün: "Аламудунский районный суд",
  Jaiyl: "Жайылский районный суд",
  Kemin: "Кеминский районный суд",
  Moskovsky: "Московский районный суд",
  Panfilov: "Панфиловский районный суд",
  Sokuluk: "Сокулукский районный суд",
  Chui: "Чуйский районный суд",
  "Ysyk-Ata": "Ысык-Атинский районный суд",
};

const getDisplayName = (name: string): string => {
  return name
    .replace(" районный суд", " район")
    .replace(" городской суд", " город")
    .replace(" межрайонный суд", " район");
};

const getRegionColor = (rating: number, properties?: any): string => {
  if (properties && isLake(properties)) {
    return "#7CC9F0";
  }
  if (rating === 0) return "#E5E7EB";
  if (rating < 2) return "#FEE2E2";
  if (rating < 2.5) return "#FEE2E2";
  if (rating < 3) return "#FFEDD5";
  if (rating < 3.5) return "#FEF9C3";
  if (rating < 4) return "#DCFCE7";
  return "#BBF7D0";
};

interface RegionDetailsProps {
  regionName: string | null;
  regions: RegionData[];
}

function isLake(properties: any): boolean {
  return (
    properties.NAME_2 === "Ysyk-Köl(lake)" ||
    properties.NAME_2 === "Ysyk-Kol" ||
    properties.NAME_2 === "Issyk-Kul" ||
    properties.NAME_2 === "Song-Kol" ||
    properties.NAME_2 === "Song-Kol(lake)" ||
    properties.NAME_2 === "Song-kol"
  );
}

const RegionDetails: React.FC<RegionDetailsProps> = ({
  regionName,
  regions,
}) => {
  const { language, getTranslation } = useLanguage();
  const {
    selectedRegion,
    setSelectedRegion,
    selectedCourtName,
    setSelectedCourtName,
    selectedCourtId,
    setSelectedCourtId,
  } = useCourt();
  const { setSurveyData, setIsLoading } = useChartData();

  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const router = useRouter();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(
        sortDirection === "asc"
          ? "desc"
          : sortDirection === "desc"
            ? null
            : "asc"
      );
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

  const sortedCourts = useMemo(() => {
    if (!selectedRegion) return [];

    return [...selectedRegion].sort((a, b) => {
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
        case "building":
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
  }, [selectedRegion, sortField, sortDirection]);

  const filteredCourts = useMemo(() => {
    if (!searchQuery.trim()) return sortedCourts;
    return sortedCourts.filter((court) =>
      court.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, sortedCourts]);

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query);
    }, 300),
    [sortedCourts]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    debouncedSearch(value);
    if (!value) {
      setIsSearchOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsSearchOpen(false);
      debouncedSearch("");
      (e.target as HTMLInputElement).value = "";
    }
  };

  const handleCourtClick = (courtId: number, courtName: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("selectedCourtId", courtId.toString());
      localStorage.setItem("selectedCourtName", courtName);
    }

    router.push(`/Home/second-instance/${courtId}/ratings`);
  };

  const handleCourtBackClick = () => {
    setSelectedCourtId(null);
    setSelectedCourtName(null);
    setSurveyData(null);
  };

  const handleRegionBackClick = () => {
    setSelectedRegion(null);
    setSelectedCourtId(null);
    setSelectedCourtName(null);
    setSurveyData(null);
  };

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (selectedCourtId) {
        setSelectedCourtId(null);
        setSelectedCourtName(null);
        setSurveyData(null);
      } else if (selectedRegion) {
        setSelectedRegion(null);
        setSelectedCourtId(null);
        setSelectedCourtName(null);
        setSurveyData(null);
      }
      event.preventDefault(); // Предотвращаем стандартное поведение
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [
    selectedCourtId,
    selectedRegion,
    setSelectedCourtId,
    setSelectedCourtName,
    setSelectedRegion,
    setSurveyData,
  ]);

  const renderRegionMap = useCallback(() => {
    if (!regionName || !selectedRegion) return null;

    const isBishkek = regionName === "Город Бишкек";
    const courtPositions = courtPositionsMap[regionName] || {};

    const regionMapping: { [key: string]: string } = {
      "Баткенская область": "Batken",
      "Жалал-Абадская область": "Jalal-Abad",
      "Иссык-Кульская область": "Ysyk-Köl",
      "Нарынская область": "Naryn",
      "Ошская область": "Osh",
      "Таласская область": "Talas",
      "Чуйская область": "Chüy",
      "Город Бишкек": "Biškek",
    };

    const geoJsonData = geoData as GeoJsonData;
    const regionFeature = geoJsonData.features.find(
      (feature) => feature.properties.NAME_1 === regionMapping[regionName]
    );

    if (!regionFeature) return null;

    const districtFeatures = (districtsGeoData as any).features.filter(
      (feature: any) => feature.properties.NAME_1 === regionMapping[regionName]
    );

    return (
      <div className="w-full h-[400px] relative mb-6 bg-white rounded-xl shadow-sm border border-gray-300  p-4 RegionDetailsMap">
        <style>
          {`
            #tooltip {
              pointer-events: none;
              transition: all 0.1s ease;
              z-index: 1000;
              position: fixed;
            }
          `}
        </style>
        <div
          id="tooltip"
          className="absolute hidden bg-white px-3 py-2 rounded shadow-lg border border-gray-200 z-50"
        />
        <svg
          ref={(node) => {
            if (node) {
              const width = node.clientWidth;
              const height = node.clientHeight;
              const svg = d3.select(node);
              svg.selectAll("*").remove();

              const margin = { top: 20, right: 20, bottom: 20, left: 20 };
              const innerWidth = width - margin.left - margin.right;
              const innerHeight = height - margin.top - margin.bottom;

              const g = svg
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

              const projection = d3
                .geoMercator()
                .fitSize(
                  [innerWidth, innerHeight],
                  regionFeature as unknown as GeoPermissibleObjects
                );

              const path = d3.geoPath().projection(projection);

              g.append("path")
                .datum(regionFeature as unknown as GeoPermissibleObjects)
                .attr("d", path)
                .attr("fill", () => {
                  const regionData = regions.find(
                    (r: RegionData) => r.name === regionName
                  );
                  return getRegionColor(regionData?.overall || 0);
                })
                .attr("stroke", "#4B5563")
                .attr("stroke-width", 0.8)
                .attr("stroke-opacity", 0.5);

              svg.on("mouseleave", function () {
                d3.select("#tooltip").style("display", "none");
              });

              if (!isBishkek) {
                g.selectAll("path.district-border")
                  .data(districtFeatures)
                  .enter()
                  .append("path")
                  .attr("class", "district-border")
                  .attr("d", path as any)
                  .attr("fill", (d: any) => {
                    if (isLake(d.properties)) return "#7CC9F0";
                    const courtName = districtNamesRu[d.properties.NAME_2];
                    const court = selectedRegion?.find(
                      (c) => c.name === courtName
                    );
                    return getRegionColor(court?.overall || 0);
                  })
                  .attr("stroke", "#4B5563")
                  .attr("stroke-width", 1)
                  .attr("pointer-events", "all")
                  .on("mouseover", function (event, d: any) {
                    if (isLake(d.properties)) return;
                    d3.select(this).attr("stroke-width", "1.5");
                    const tooltip = d3.select("#tooltip");
                    const coordinates = getEventCoordinates(event);
                    const districtName = d.properties.NAME_2;
                    const russianName = districtNamesRu[districtName] || districtName;
                    const displayName = getDisplayName(russianName);
                    const court = selectedRegion?.find((c) => c.name === russianName);
                    const rating = court?.overall || 0;

                    tooltip
                      .style("display", "block")
                      .style("left", `${coordinates.x + 10}px`)
                      .style("top", `${coordinates.y + 10}px`).html(`
                        <div class="font-medium">${displayName}</div>
                        <div class="text-sm text-gray-600">Общая оценка: 
                          <span class="inline-flex items-center">
                            <span class="text-yellow-400 mr-1">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="12" height="12" fill="currentColor">
                                <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/>
                              </svg>
                            </span>
                            ${rating ? rating.toFixed(1) : "0.0"} / 5
                          </span>
                        </div>
                      `);
                  })
                  .on("mousemove", function (event) {
                    const coordinates = getEventCoordinates(event);
                    d3.select("#tooltip")
                      .style("left", `${coordinates.x}px`)
                      .style("top", `${coordinates.y}px`);
                  })
                  .on("mouseout", function () {
                    d3.select(this).attr("fill-opacity", 1);
                    d3.select("#tooltip").style("display", "none");
                  });

                const textGroup = g.append("g").attr("class", "rating-labels");

                textGroup
                  .selectAll("text")
                  .data(districtFeatures)
                  .join("text")
                  .attr("x", (d: any) => path.centroid(d)[0])
                  .attr("y", (d: any) => path.centroid(d)[1])
                  .attr("text-anchor", "middle")
                  .style("pointer-events", "none")
                  .attr("font-weight", "bold")
                  .attr("font-size", "10px")
                  .text((d: any) => {
                    if (isLake(d.properties)) return "";
                    const courtName = districtNamesRu[d.properties.NAME_2];
                    const court = selectedRegion?.find(
                      (c) => c.name === courtName
                    );
                    return court?.overall ? court.overall.toFixed(1) : "0.0";
                  });
              }

              selectedRegion.forEach(
                (court: RegionData & { coordinates?: [number, number] }) => {
                  const position = courtPositions[court.name];
                  if (position) {
                    const [lon, lat] = position;
                    const [x, y] = projection([lon, lat]) || [0, 0];
                    g.append("circle")
                      .attr("cx", x)
                      .attr("cy", y)
                      .attr("r", 6)
                      .attr("fill", getRegionColor(court.overall))
                      .attr("stroke", "#4B5563")
                      .attr("stroke-width", 1.5)
                      .attr(
                        "class",
                        "cursor-pointer transition-all duration-200"
                      )
                      .attr("filter", "drop-shadow(0 1px 1px rgb(0 0 0 / 0.1))")
                      .on("mouseover", (event) => {
                        const coordinates = getEventCoordinates(event);
                        const tooltip = d3.select("#tooltip");
                        tooltip
                          .style("display", "block")
                          .style("left", `${coordinates.x}px`)
                          .style("top", `${coordinates.y}px`).html(`
                        <div class="bg-white rounded-lg shadow-lg border border-gray-100 p-3 max-w-[240px]">
                          <div class="font-semibold text-base mb-2 text-gray-800 border-b pb-1.5" style="border-color: #4B5563">
                            ${court.name}
                          </div>
                          <div class="space-y-1.5">
                            <div class="flex items-center justify-between border-l-2 pl-2" style="border-color: #4B5563">
                              <span class="text-gray-700 text-sm">Общая оценка</span>
                              <span class="font-medium text-gray-900 px-1.5 py-0.5 rounded ${getRatingBgColor(
                            court.overall
                          )}">
                                <span class="inline-flex items-center">
                                  <span class="text-yellow-400 mr-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="12" height="12" fill="currentColor">
                                      <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/>
                                    </svg>
                                  </span>
                                  ${court.overall.toFixed(1)}
                                </span>
                              </span>
                            </div>
                            <div class="flex items-center justify-between border-l-2 pl-2" style="border-color: #4B5563">
                              <span class="text-gray-700 text-sm">Здание</span>
                              <span class="font-medium text-gray-900 px-1.5 py-0.5 rounded ${getRatingBgColor(
                            court.ratings[4]
                          )}">
                                ${court.ratings[4].toFixed(1)}
                              </span>
                            </div>
                            <div class="flex items-center justify-between border-l-2 pl-2" style="border-color: #4B5563">
                              <span class="text-gray-700 text-sm">Канцелярия</span>
                              <span class="font-medium text-gray-900 px-1.5 py-0.5 rounded ${getRatingBgColor(
                            court.ratings[3]
                          )}">
                                ${court.ratings[3].toFixed(1)}
                              </span>
                            </div>
                            <div class="flex items-center justify-between border-l-2 pl-2" style="border-color: #4B5563">
                              <span class="text-gray-700 text-sm">Процесс</span>
                              <span class="font-medium text-gray-900 px-1.5 py-0.5 rounded ${getRatingBgColor(
                            court.ratings[2]
                          )}">
                                ${court.ratings[2].toFixed(1)}
                              </span>
                            </div>
                            <div class="flex items-center justify-between border-l-2 pl-2" style="border-color: #4B5563">
                              <span class="text-gray-700 text-sm">Сотрудники</span>
                              <span class="font-medium text-gray-900 px-1.5 py-0.5 rounded ${getRatingBgColor(
                            court.ratings[1]
                          )}">
                                ${court.ratings[1].toFixed(1)}
                              </span>
                            </div>
                            <div class="flex items-center justify-between border-l-2 pl-2" style="border-color: #4B5563">
                              <span class="text-gray-700 text-sm">Судья</span>
                              <span class="font-medium text-gray-900 px-1.5 py-0.5 rounded ${getRatingBgColor(
                            court.ratings[0]
                          )}">
                                ${court.ratings[0].toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      `);
                      })
                      .on("mousemove", (event) => {
                        const coordinates = getEventCoordinates(event);
                        d3.select("#tooltip")
                          .style("left", `${coordinates.x}px`)
                          .style("top", `${coordinates.y}px`);
                      })
                      .on("mouseout", () => {
                        d3.select("#tooltip").style("display", "none");
                      })
                      .on("click", () => {
                        handleCourtClick(court.id, court.name);
                      });
                  }
                }
              );
            }
          }}
          className="w-full h-full"
        />
      </div>
    );
  }, [selectedRegion, regionName, handleCourtClick]);

  function getRatingBgColor(rating: number): string {
    if (rating === 0) return "bg-gray-100";
    if (rating < 2) return "bg-red-100";
    if (rating < 2.5) return "bg-red-100";
    if (rating < 3) return "bg-orange-100";
    if (rating < 3.5) return "bg-yellow-100";
    if (rating < 4) return "bg-emerald-100";
    return "bg-green-100";
  }

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (regionName === "Город Бишкек") {
      d3.selectAll(".tooltip").remove();
      return;
    }

    d3.selectAll(".tooltip").remove();

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("display", "none")
      .style("pointer-events", "none")
      .style("background", "white")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)")
      .style("border", "1px solid #e5e7eb")
      .style("z-index", "1000");

    return () => {
      d3.selectAll(".tooltip").remove();
    };
  }, [selectedRegion, regionName]);

  return (
    <>
      <div className="w-full min-h-screen bg-transparent from-gray-50 to-gray-100">
        <div className="max-w-[1250px] mx-auto px-0 py-3.5">
          <div className="flex flex-col">
            <Breadcrumb
              regionName={regionName}
              onRegionBackClick={handleRegionBackClick}
            />
            <h2 className="text-xl font-medium mt-2 my-4">
              {regionName ? regionName : "Выберите регион"}
            </h2>
            {renderRegionMap()}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="overflow-x-auto">
                {/* Таблица для десктопа (≥ 640px) */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase bg-gray-50 border-r border-gray-200">
                          №
                        </th>
                        <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase bg-gray-50 border-r border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="truncate mr-2">НАИМЕНОВАНИЕ СУДОВ</span>
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
                        <th
                          className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase bg-gray-50 border-r border-gray-200 cursor-pointer"
                          onClick={() => handleSort("overall")}
                        >
                          <div className="flex items-center justify-between px-2">
                            <span className="whitespace-nowrap">{getTranslation("Regional_Courts_Table_Overall", language)}</span>
                            <div className="flex-shrink-0">
                              {getSortIcon("overall")}
                            </div>
                          </div>
                        </th>
                        <th
                          className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase bg-gray-50 border-r border-gray-200 cursor-pointer"
                          onClick={() => handleSort("building")}
                        >
                          <div className="flex items-center justify-between px-2">
                            <span>{getTranslation("Regional_Courts_Table_Build", language)}</span>
                            {getSortIcon("building")}
                          </div>
                        </th>
                        <th
                          className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase bg-gray-50 border-r border-gray-200 cursor-pointer"
                          onClick={() => handleSort("office")}
                        >
                          <div className="flex items-center justify-between px-2">
                            <span>{getTranslation("Regional_Courts_Table_Chancellery", language)}</span>
                            {getSortIcon("office")}
                          </div>
                        </th>
                        <th
                          className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase bg-gray-50 border-r border-gray-200 cursor-pointer"
                          onClick={() => handleSort("process")}
                        >
                          <div className="flex items-center justify-between px-2">
                            <span>{getTranslation("Regional_Courts_Table_Procces", language)}</span>
                            {getSortIcon("process")}
                          </div>
                        </th>
                        <th
                          className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase bg-gray-50 border-r border-gray-200 cursor-pointer"
                          onClick={() => handleSort("staff")}
                        >
                          <div className="flex items-center justify-between px-2">
                            <span>{getTranslation("Regional_Courts_Table_Staff", language)}</span>
                            {getSortIcon("staff")}
                          </div>
                        </th>
                        <th
                          className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase bg-gray-50 border-r border-gray-200 cursor-pointer"
                          onClick={() => handleSort("judge")}
                        >
                          <div className="flex items-center justify-between px-2">
                            <span>{getTranslation("Regional_Courts_Table_Judge", language)}</span>
                            {getSortIcon("judge")}
                          </div>
                        </th>
                        <th
                          className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase bg-gray-50 border-r border-gray-200 cursor-pointer"
                          onClick={() => handleSort("count")}
                        >
                          <div className="flex items-center justify-between px-2">
                            <span>{getTranslation("Regional_Courts_Table_Number of reviews", language)}</span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="min-h-[300px]">
                      {filteredCourts.map((court, index) => (
                        <tr
                          key={court.name}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="border border-gray-300 px-4 py-2 text-center text-sm text-gray-600">
                            {index + 1}
                          </td>
                          <td
                            className="px-3 py-2.5 text-left text-xs text-gray-600 cursor-pointer hover:text-blue-500"
                            onClick={() =>
                              handleCourtClick(court.id, court.name)
                            }
                          >
                            {court.name}
                          </td>
                          <td
                            className={`border border-gray-300 px-4 py-2 text-center text-sm text-gray-900 ${getRatingColor(
                              court.overall
                            )}`}
                          >
                            {court.overall.toFixed(1)}
                          </td>
                          {court.ratings.map(
                            (rating: number, idx: number) => (
                              <td
                                key={idx}
                                className={`border border-gray-300 px-4 py-2 text-center text-sm text-gray-900 ${getRatingColor(
                                  rating
                                )}`}
                              >
                                {rating.toFixed(1)}
                              </td>
                            )
                          )}
                          <td className="border border-gray-300 px-4 py-2 text-center text-sm text-gray-600">
                            {court.totalAssessments}
                          </td>
                        </tr>
                      ))}
                      {filteredCourts.length === 0 && (
                        <tr>
                          <td
                            colSpan={9}
                            className="px-6 py-4 text-center text-gray-500 h-[300px]"
                          >
                            {searchQuery ? "Ничего не найдено" : "Нет данных"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Карточки для мобильных (< 640px) */}
                <div className="block sm:hidden p-3">
                  {filteredCourts.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      {searchQuery ? "Ничего не найдено" : "Нет данных"}
                    </div>
                  ) : (
                    filteredCourts.map((court, index) => (
                      <div
                        key={court.name}
                        className="mb-3 p-3 border border-gray-100 rounded-lg bg-white hover:shadow-md transition-shadow duration-200 cursor-pointer"
                        onClick={() => handleCourtClick(court.id, court.name)}
                      >
                        {/* Заголовок карточки */}
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-sm font-semibold text-gray-800 hover:text-blue-600 truncate">
                            {index + 1}. {court.name}
                          </div>
                          <div className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="ml-1 inline-block w-6 h-6 text-yellow-500" viewBox="0 0 24 24" stroke="none">
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" strokeLinejoin="round" strokeLinecap="round" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">
                              {court.overall.toFixed(1)}
                            </span>
                          </div>
                        </div>

                        {/* Данные в виде компактного списка */}
                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Здание:</span>
                            <span className="text-gray-600">
                              {court.ratings[0].toFixed(1)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Канцелярия:</span>
                            <span className="text-gray-600">
                              {court.ratings[1].toFixed(1)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Процесс:</span>
                            <span className="text-gray-600">
                              {court.ratings[2].toFixed(1)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Сотрудники:</span>
                            <span className="text-gray-600">
                              {court.ratings[3].toFixed(1)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Судья:</span>
                            <span className="text-gray-600">
                              {court.ratings[4].toFixed(1)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Отзывы:</span>
                            <span className="text-gray-600">
                              {court.totalAssessments}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegionDetails;