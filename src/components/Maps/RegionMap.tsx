"use client";

import React, {  useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import geoData from "../../../public/gadm41_KGZ_1.json";
import districtsGeoData from "../../../public/gadm41_KGZ_2.json";

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

const isLake = (properties: any): boolean => {
  return (
    properties.NAME_2 === "Ysyk-Köl(lake)" ||
    properties.NAME_2 === "Ysyk-Kol" ||
    properties.NAME_2 === "Issyk-Kul" ||
    properties.NAME_2 === "Song-Kol" ||
    properties.NAME_2 === "Song-Kol(lake)" ||
    properties.NAME_2 === "Song-kol"
  );
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

const getRatingBorderColor = (rating: number) => {
  if (rating === 0) return "#9CA3AF"; // gray-400
  if (rating <= 2) return "#EF4444"; // red-500
  if (rating <= 3.5) return "#F59E0B"; // yellow-500
  return "#22C55E"; // green-500
};

function getRatingBgColor(rating: number): string {
  if (rating === 0) return "bg-gray-100";
  if (rating < 2) return "bg-red-100";
  if (rating < 2.5) return "bg-red-100";
  if (rating < 3) return "bg-orange-100";
  if (rating < 3.5) return "bg-yellow-100";
  if (rating < 4) return "bg-emerald-100";
  return "bg-green-100";
}

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

export interface RegionData {
  id: number;
  name: string;
  ratings: number[];
  overall: number;
  totalAssessments: number;
  coordinates?: [number, number];
}

interface RegionMapProps {
  regionName: string;
  selectedRegion: RegionData[];
  onCourtClick: (courtId: number, courtName: string) => void;
}

interface CourtPositions {
  [key: string]: { [key: string]: [number, number] };
}

const courtPositionsMap: CourtPositions = {
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

interface DistrictNames {
  [key: string]: string;
}

const districtNamesRu: DistrictNames = {
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

const RegionMap: React.FC<RegionMapProps> = ({ regionName, selectedRegion, onCourtClick }) => {
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
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    d3.selectAll(".tooltip").remove();
    d3.selectAll("#tooltip").remove();
    
    d3.select("body")
      .append("div")
      .attr("id", "tooltip")
      .attr("class", "absolute hidden bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200")
      .style("pointer-events", "none")
      .style("transition", "opacity 0.2s ease, transform 0.1s ease")
      .style("z-index", "9999")
      .style("position", "fixed")
      .style("background-color", "white")
      .style("box-shadow", "0 4px 15px -3px rgba(0, 0, 0, 0.12), 0 2px 8px -2px rgba(0, 0, 0, 0.1)")
      .style("opacity", "0")
      .style("transform", "translateY(5px)");

    return () => {
      d3.selectAll(".tooltip").remove();
      d3.selectAll("#tooltip").remove();
    };
  }, []);

  useEffect(() => {
    if (!regionName || !selectedRegion || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = dimensions.width || 800;
    const height = dimensions.height || 400;
    const isBishkek = regionName === "Город Бишкек";
    const courtPositions = courtPositionsMap[regionName] || {};

    const geoJsonData = geoData as any;
    const regionFeature = geoJsonData.features.find(
      (feature: any) => feature.properties.NAME_1 === regionMapping[regionName]
    );

    if (!regionFeature && !isBishkek) return;

    const districtFeatures = (districtsGeoData as any).features.filter(
      (feature: any) => feature.properties.NAME_1 === regionMapping[regionName]
    );

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
        regionFeature as unknown as any
      );

    const path = d3.geoPath().projection(projection);

    const bishkekOverall = isBishkek 
      ? selectedRegion.reduce((sum, court) => sum + court.overall, 0) / (selectedRegion.length || 1)
      : 0;

    g.append("path")
      .datum(regionFeature)
      .attr("d", path as any)
      .attr("fill", () => {
        if (isBishkek) {
          return getRegionColor(bishkekOverall);
        }
        const regionData = selectedRegion?.find(
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
            (c: any) => c.name === courtName
          );
          return getRegionColor(court?.overall || 0, d.properties);
        })
        .attr("stroke", "#4B5563")
        .attr("stroke-width", 1)
        .attr("pointer-events", "all")
        .on("mouseover", function (event: any, d: any) {
          if (isLake(d.properties)) return;
          
          d3.select(this).attr("stroke-width", "1.5");
          const tooltip = d3.select("#tooltip");
          const coordinates = getEventCoordinates(event);
          const districtName = d.properties.NAME_2;
          const russianName = districtNamesRu[districtName] || districtName;
          const displayName = getDisplayName(russianName);
          const court = selectedRegion?.find(
            (c: any) => c.name === russianName
          );
          const rating = court?.overall || 0;
          const ratingBgColor = getRatingBgColor(rating);

          tooltip
            .style("display", "block")
            .style("left", `${coordinates.x + 15}px`)
            .style("top", `${coordinates.y + 15}px`)
            .style("opacity", "0")
            .style("transform", "translateY(5px)")
            .html(`
              <div class="font-medium text-base mb-1">${displayName}</div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Общая оценка:</span>
                <span class="ml-2 px-2 py-0.5 rounded ${ratingBgColor}">
                  ${rating ? formatRating(rating) : "Нет данных"}
                </span>
              </div>
            `)
            .transition()
            .duration(150)
            .style("opacity", "1")
            .style("transform", "translateY(0)");
        })
        .on("mousemove", function (event: any) {
          const coordinates = getEventCoordinates(event);
          d3.select("#tooltip")
            .style("left", `${coordinates.x}px`)
            .style("top", `${coordinates.y}px`);
        })
        .on("mouseout", function () {
          d3.select(this).attr("stroke-width", "1");
          d3.select("#tooltip")
            .transition()
            .duration(100)
            .style("opacity", "0")
            .style("transform", "translateY(5px)")
            .on("end", function() {
              d3.select(this).style("display", "none");
            });
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
            (c: any) => c.name === courtName
          );
          return court?.overall ? court.overall.toFixed(1) : "0.0";
        });
    }

    selectedRegion.forEach((court: any) => {
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
          .attr("class", "cursor-pointer transition-all duration-200")
          .attr("filter", "drop-shadow(0 1px 1px rgb(0 0 0 / 0.1))")
          .on("mouseover", (event: any) => {
            const coordinates = getEventCoordinates(event);
            const tooltip = d3.select("#tooltip");
            
            tooltip
              .style("display", "block")
              .style("left", `${coordinates.x + 15}px`)
              .style("top", `${coordinates.y + 15}px`)
              .style("opacity", "0")
              .style("transform", "translateY(5px)")
              .html(`
                <div class="bg-white rounded-lg p-3 max-w-[280px]">
                  <div class="font-semibold text-base mb-3 text-gray-800 border-b pb-2" style="border-color: #4B5563">
                    ${court.name}
                  </div>
                  <div class="space-y-2">
                    <div class="flex items-center justify-between border-l-2 pl-2.5" style="border-color: #4B5563">
                      <span class="text-gray-700">Общая оценка</span>
                      <span class="font-medium text-gray-900 px-2 py-0.5 rounded ${getRatingBgColor(court.overall)}">
                        ${court.overall.toFixed(1)}
                      </span>
                    </div>
                    <div class="flex items-center justify-between border-l-2 pl-2.5" style="border-color: #4B5563">
                      <span class="text-gray-700">Здание</span>
                      <span class="font-medium text-gray-900 px-2 py-0.5 rounded ${getRatingBgColor(court.ratings[4])}">
                        ${court.ratings[4].toFixed(1)}
                      </span>
                    </div>
                    <div class="flex items-center justify-between border-l-2 pl-2.5" style="border-color: #4B5563">
                      <span class="text-gray-700">Канцелярия</span>
                      <span class="font-medium text-gray-900 px-2 py-0.5 rounded ${getRatingBgColor(court.ratings[3])}">
                        ${court.ratings[3].toFixed(1)}
                      </span>
                    </div>
                    <div class="flex items-center justify-between border-l-2 pl-2.5" style="border-color: #4B5563">
                      <span class="text-gray-700">Процесс</span>
                      <span class="font-medium text-gray-900 px-2 py-0.5 rounded ${getRatingBgColor(court.ratings[2])}">
                        ${court.ratings[2].toFixed(1)}
                      </span>
                    </div>
                    <div class="flex items-center justify-between border-l-2 pl-2.5" style="border-color: #4B5563">
                      <span class="text-gray-700">Сотрудники</span>
                      <span class="font-medium text-gray-900 px-2 py-0.5 rounded ${getRatingBgColor(court.ratings[1])}">
                        ${court.ratings[1].toFixed(1)}
                      </span>
                    </div>
                    <div class="flex items-center justify-between border-l-2 pl-2.5" style="border-color: #4B5563">
                      <span class="text-gray-700">Судья</span>
                      <span class="font-medium text-gray-900 px-2 py-0.5 rounded ${getRatingBgColor(court.ratings[0])}">
                        ${court.ratings[0].toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              `)
              .transition()
              .duration(150)
              .style("opacity", "1")
              .style("transform", "translateY(0)");
          })
          .on("mousemove", (event: any) => {
            const coordinates = getEventCoordinates(event);
            d3.select("#tooltip")
              .style("left", `${coordinates.x}px`)
              .style("top", `${coordinates.y}px`);
          })
          .on("mouseout", () => {
            d3.select("#tooltip")
              .transition()
              .duration(100)
              .style("opacity", "0")
              .style("transform", "translateY(5px)")
              .on("end", function() {
                d3.select(this).style("display", "none");
              });
          })
          .on("click", () => {
            if (onCourtClick) {
              const courtId = court.id || court.court_id || 0;
              onCourtClick(courtId, court.name);
            }
          });
      }
    });
  }, [regionName, selectedRegion, dimensions.width, dimensions.height, onCourtClick]);

  return (
    <div className="w-full">
      <div 
        ref={containerRef} 
        className="w-full h-[400px] bg-white rounded-lg shadow-sm overflow-hidden"
      >
        <svg ref={svgRef} className="w-full h-full" />
      </div>
      <style jsx>{`
        #tooltip {
          pointer-events: none;
          transition: opacity 0.2s ease, transform 0.1s ease;
          z-index: 9999;
          position: fixed;
          background-color: white;
          box-shadow: 0 4px 15px -3px rgba(0, 0, 0, 0.12), 0 2px 8px -2px rgba(0, 0, 0, 0.1);
          opacity: 0;
          transform: translateY(5px);
        }
        .district-border {
          transition: stroke-width 0.2s ease;
        }
      `}</style>
    </div>
  );
};
function formatRating(rating: number) {
  return `
    <span class="inline-flex items-center">
      <span class="text-yellow-400 mr-1">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="14" height="14" fill="currentColor">
          <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/>
        </svg>
      </span>
      <span class="font-bold">${rating.toFixed(1)}</span>
      <span class="font-bold text-gray-900 ml-1">/</span>
      <span class="font-bold text-gray-900 ml-1">5</span>
    </span>
  `;
}
export default RegionMap; 