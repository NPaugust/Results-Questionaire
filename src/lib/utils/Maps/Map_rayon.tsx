"use client";

import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import rayonData from "../../../../public/gadm41_KGZ_2.json";
import { Minus, Plus, RefreshCw } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const rayonToCourtMapping: { [key: string]: { name: string, id: number } } = {
  Biskek: { name: "Административный суд г. Бишкек", id: 81 },
  Osh: { name: "Ошский городской суд", id: 72 },
  Batken: { name: "Баткенский районный суд", id: 3 },
  Lailak: { name: "Лейлекский районный суд", id: 5 },
  Kadamjai: { name: "Кадамжайский районный суд", id: 4 },
  Alamüdün: { name: "Аламудунский районный суд", id: 57 },
  Sokuluk: { name: "Сокулукский районный суд", id: 59 },
  Moskovsky: { name: "Московский районный суд", id: 63 },
  Jaiyl: { name: "Жайылский районный суд", id: 61 },
  Panfilov: { name: "Панфиловcкий районный суд", id: 64 },
  Kemin: { name: "Кеминский районный суд", id: 62 },
  Chui: { name: "Чуйский районный суд", id: 56 },
  "Ak-Suu": { name: "Ак-Суйский районный суд", id: 50 },
  "Djety-Oguz": { name: "Жети-Огузский районный суд", id: 51 },
  Ton: { name: "Тонский районный суд", id: 79 },
  Tüp: { name: "Тюпский районный суд", id: 52 },
  "Ysyk-Köl": { name: "Иссык-Кульский районный суд", id: 48 },
  "Ak-Talaa": { name: "Ак-Талинский районный суд", id: 20 },
  "At-Bashi": { name: "Ат-Башинский районный суд", id: 19 },
  Jumgal: { name: "Жумгальский районный суд", id: 22 },
  Kochkor: { name: "Кочкорский районный суд", id: 21 },
  Naryn: { name: "Нарынский районный суд", id: 18 },
  Talas: { name: "Таласский районный суд", id: 10 },
  "Bakai-Ata": { name: "Бакай-Атинский районный суд", id: 12 },
  "Kara-Buura": { name: "Кара-Бууринский районный суд", id: 13 },
  Manas: { name: "Манасский районный суд", id: 14 },
  Alai: { name: "Алайский районный суд", id: 44 },
  Aravan: { name: "Араванский районный суд", id: 42 },
  "Kara-Kuldja": { name: "Кара-Кульджинский районный суд", id: 45 },
  "Kara-Suu": { name: "Кара-Суйский районный суд", id: 40 },
  Nookat: { name: "Ноокатский районный суд", id: 80 },
  Uzgen: { name: "Узгенский районный суд", id: 41 },
  "Chong-Alay": { name: "Чон-Алайский районный суд", id: 43 },
  "Ala-Buka": { name: "Ала-Букинский районный суд", id: 33 },
  Aksyi: { name: "Аксыйский районный суд", id: 30 },
  "Bazar-Korgon": { name: "Базар-Коргонский районный суд", id: 34 },
  Chatkal: { name: "Чаткальский районный суд", id: 32 },
  Nooken: { name: "Ноокенский районный суд", id: 36 },
  Suzak: { name: "Сузакский районный суд", id: 29 },
  "Togus-Toro": { name: "Тогуз-Тороузский районный суд", id: 31 },
  Toktogul: { name: "Токтогульский районный суд", id: 35 }
};

const districtNamesRu: { [key: string]: string } = {
  Bishkek: "Бишкекский городской суд",
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
  "Togus-Toro": "Тогуз-Тороузский районный суд",
  Toktogul: "Токтогульский районный суд",
  Alamüdün: "Аламудунский районный суд",
  Jaiyl: "Жайылский районный суд",
  Kemin: "Кеминский районный суд",
  Moskovsky: "Московский районный суд",
  Panfilov: "Панфиловский районный суд",
  Sokuluk: "Сокулукский районный суд",
  Chui: "Чуйский районный суд",
  "Ysyk-Ata": "Ысык-Атинский районный суд",
  Osh: "Город Ош",
};

interface Court {
  id: number;
  name: string;
  instance: string;
  overall_assessment: number;
  assessment: {
    judge: number;
    process: number;
    staff: number;
    office: number;
    building: number;
  };
  total_survey_responses: number;
}

interface MapProps {
  selectedRayon: string | null;
  onSelectRayon?: (court: Court) => void;
  courts: Court[];
}

const courtCoordinates: { [key: string]: [number, number] } = {
  "Административный суд Баткенской области": [69.8597, 40.0563],
  "Административный суд Джалал-Абадской области": [72.9814, 41.0373],
  "Административный суд Иссык-Кульской области": [76.7826, 42.1387],
  "Административный суд Нарынской области": [75.9911, 41.5369],
  "Административный суд Ошской области": [72.8085, 40.624],
  "Административный суд Таласской области": [72.2427, 42.538],
  "Административный суд Чуйской области": [74.5698, 42.98],
  "Административный суд г. Бишкек": [74.6, 42.87],
  "Ленинский районный суд": [74.5005, 42.785],
  "Октябрьский районный суд": [74.460, 42.880],
  "Первомайский районный суд": [74.7428, 42.8906],
  "Свердловский районный суд": [74.685, 42.8],
  "Балыкчинский городской суд": [76.1055, 42.456],
  "Джалал-Абадский городской суд": [72.9814, 40.9173],
  "Каракольский городской суд": [78.4147, 42.507],
  "Нарынский городской суд": [75.9911, 41.4169],
  "Ошский городской суд": [72.7985, 40.504],
  "Таласский городской суд": [72.2827, 42.44],
  "Токмокский городской суд": [75.3015, 42.7821],
  "Кызыл-Кийский городской суд": [72.1077, 40.2566],
  "Майлуу-Сууйский городской суд": [72.4447, 41.1547],
  "Ташкумырский городской суд": [72.2166, 41.3419],
  "Узгенский городской суд": [73.3046, 40.7697],
  "Кара-Кульский городской суд": [73.1502, 41.6502],
  "Сулюктинский городской суд": [69.5772, 39.9405],
};

const getColorByRating = (rating: number): string => {
  if (rating === 0) return "#999999";
  if (rating >= 4.5) return "#66C266";
  if (rating >= 4.0) return "#B4D330";
  if (rating >= 3.5) return "#FFC04D";
  if (rating >= 3.0) return "#F4A460";
  if (rating >= 2.5) return "#E57357";
  if (rating >= 2.0) return "#CD5C5C";
  if (rating >= 1.5) return "#A52A2A";
  return "#8B0000";
};

export default function Map_rayon({
  selectedRayon,
  onSelectRayon,
  courts,
}: MapProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 600 });
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [showLegend, setShowLegend] = useState(false);
  const { language, getTranslation } = useLanguage();

  const getRayonRating = (rayonName: string) => {
    const courtInfo = rayonToCourtMapping[rayonName];
    if (!courtInfo) return 0;
    
    const courtData = courts.find((court) => court.id === courtInfo.id);
    return courtData?.overall_assessment || 0;
  };

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !Array.isArray(courts))
      return;

    const container = d3.select(containerRef.current);
    const containerWidth =
      container.node()?.getBoundingClientRect().width || 1200;
    const aspectRatio = 1200 / 600;
    const width = containerWidth;
    const height = width / aspectRatio;

    setDimensions({ width, height });

    const svg = d3.select<SVGSVGElement, unknown>(svgRef.current!);
    svg.selectAll("*").remove();

    svg
      .attr("width", "100%")
      .attr("height", height)
      .attr("viewBox", `0 0 1200 600`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const g = svg.append("g");

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .translateExtent([
        [0, 0],
        [1200, 600],
      ])
      .extent([
        [0, 0],
        [1200, 600],
      ])
      .on("zoom", (event) => {
        const transform = event.transform;
        const scale = transform.k;
        const tx = Math.min(0, Math.max(transform.x, 1200 * (1 - scale)));
        const ty = Math.min(0, Math.max(transform.y, 600 * (1 - scale)));
        g.attr("transform", `translate(${tx},${ty}) scale(${scale})`);
      });

    zoomRef.current = zoom;
    svg.call(zoom);

    const projection = d3
      .geoMercator()
      .center([74.7, 41.3])
      .scale(6000)
      .translate([1200 / 2, 600 / 2]);

    const path = d3.geoPath().projection(projection);

    const tooltip = d3.select(tooltipRef.current);

    const getColor = (
      rating: number,
      isSelected: boolean,
      properties: any
    ): string => {
      if (
        properties.NAME_2 === "Ysyk-Köl(lake)" ||
        properties.NAME_2 === "Ysyk-Kol" ||
        properties.NAME_2 === "Issyk-Kul" ||
        properties.NAME_2 === "Song-Kol" ||
        properties.NAME_2 === "Song-Kol(lake)" ||
        properties.NAME_2 === "Song-kol"
      ) {
        return "#7CC9F0";
      }
      if (!isSelected && selectedRayon) return "#E5E7EB";
      if (rating === 0) return "#999999";
      if (rating >= 4.5) return "#66C266";
      if (rating >= 4.0) return "#B4D330";
      if (rating >= 3.5) return "#FFC04D";
      if (rating >= 3.0) return "#F4A460";
      if (rating >= 2.5) return "#E57357";
      if (rating >= 2.0) return "#CD5C5C";
      if (rating >= 1.5) return "#A52A2A";
      return "#8B0000";
    };

    g.selectAll("path")
      .data((rayonData as any).features)
      .join("path")
      .attr("d", path as any)
      .attr("fill", (d: any) => {
        const rating = getRayonRating(d.properties.NAME_2);
        const isSelected =
          selectedRayon === null ||
          rayonToCourtMapping[d.properties.NAME_2].name === selectedRayon;
        return getColor(rating, isSelected, d.properties);
      })
      .attr("stroke", "white")
      .attr("stroke-width", "0.5")
      .style("cursor", "pointer")
      .on("mouseover", function (event: any, d: any) {
        if (isLake(d.properties)) return;
        d3.select(this).attr("fill-opacity", 0.7);
        const coordinates = getEventCoordinates(event);
        const districtName = d.properties.NAME_2;
        const russianName = districtNamesRu[districtName] || districtName;
        const rating = getRayonRating(districtName);
        const ratingColor = getColorByRating(rating);

        tooltip
          .style("display", "block")
          .style("position", "fixed")
          .style("left", `${coordinates.x + 15}px`)
          .style("top", `${coordinates.y - 28}px`)
          .html(`
            <div class="p-2">
              <div class="font-medium mb-1">${russianName}</div>
              <div class="flex items-center justify-between">
                <breaks><span class="text-gray-700">${getTranslation("MapRayon_OverallRating", language)}:</span>
                <span class="ml-2 px-2 py-0.5 rounded text-gray-900 font-medium" style="background-color: ${rating > 0 ? ratingColor + '40' : '#E5E7EB'}">
                  ${rating > 0 ? `<span class="text-yellow-600 mr-1">★</span>${rating.toFixed(1)} / 5` : "Нет данных"}
                </span>
              </div>
            </div>
          `);
      })
      .on("mousemove", function (event: any) {
        const coordinates = getEventCoordinates(event);
        tooltip
          .style("left", `${coordinates.x + 10}px`)
          .style("top", `${coordinates.y + 10}px`);
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill-opacity", 1);
        tooltip.style("display", "none");
      })
      .on("touchstart", function (event: any, d: any) {
        event.preventDefault();
        if (isLake(d.properties)) return;
        const coordinates = getEventCoordinates(event);
        const districtName = d.properties.NAME_2;
        const russianName = districtNamesRu[districtName] || districtName;
        const rating = getRayonRating(districtName);
        const ratingColor = getColorByRating(rating);

        tooltip
          .style("display", "block")
          .style("position", "fixed")
          .style("left", `${coordinates.x + 10}px`)
          .style("top", `${coordinates.y + 10}px`)
          .html(`
            <div class="p-2">
              <div class="font-medium mb-1">${russianName}</div>
              <div class="flex items-center justify-between">
                <span class="text-gray-700">${getTranslation("MapRayon_OverallRating", language)}:</span>
                <span class="ml-2 px-2 py-0.5 rounded text-gray-900 font-medium" style="background-color: ${rating > 0 ? ratingColor + '40' : '#E5E7EB'}">
                  ${rating > 0 ? `<span class="text-yellow-500 mr-1">★</span>${rating.toFixed(1)} / 5` : "Нет данных"}
                </span>
              </div>
            </div>
          `);
      })
      .on("touchend", function () {
        tooltip.style("display", "none");
      })
      .on("touchmove", function (event: any) {
        const coordinates = getEventCoordinates(event);
        tooltip
          .style("left", `${coordinates.x + 10}px`)
          .style("top", `${coordinates.y + 10}px`);
      })
      .on("click", function (event: any, d: any) {
        const districtName = d.properties.NAME_2;
        if (isLake(d.properties)) return;
        
        const courtInfo = rayonToCourtMapping[districtName];
        if (courtInfo) {
          // Находим данные суда по ID
          const courtData = courts.find(court => court.id === courtInfo.id);
          
          if (courtData) {
            const transformedCourt: Court = {
              id: courtData.id,
              name: courtData.name,
              instance: courtData.instance,
              overall_assessment: courtData.overall_assessment,
              assessment: {
                judge: getAspectValue(courtData.assessment, "Судья"),
                staff: getAspectValue(courtData.assessment, "Сотрудники"),
                process: getAspectValue(courtData.assessment, "Процесс"),
                office: getAspectValue(courtData.assessment, "Канцелярия"),
                building: getAspectValue(courtData.assessment, "Здание")
              },
              total_survey_responses: courtData.total_survey_responses
            };
            
            if (onSelectRayon) onSelectRayon(transformedCourt);
          }
        }
      });

    const textGroup = g.append("g").attr("class", "rating-labels");

    textGroup
      .selectAll("text")
      .data((rayonData as any).features)
      .join("text")
      .attr("x", (d: any) => path.centroid(d)[0])
      .attr("y", (d: any) => path.centroid(d)[1])
      .attr("text-anchor", "middle")
      .style("pointer-events", "none")
      .attr("font-weight", "bold")
      .attr("font-size", "14px")
      .text((d: any) => {
        if (isLake(d.properties)) return "";
        const rating = getRayonRating(d.properties.NAME_2);
        return rating ? rating.toFixed(1) : "";
      });

    g.selectAll("circle")
      .data(Object.entries(courtCoordinates))
      .join("circle")
      .attr("cx", (d) => projection(d[1])?.[0] || 0)
      .attr("cy", (d) => projection(d[1])?.[1] || 0)
      .attr("r", 6)
      .attr("fill", (d) => {
        const court = courts.find((c) => c.name === d[0]);
        return getColorByRating(court ? court.overall_assessment : 0);
      })
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .attr("opacity", 0.8)
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("opacity", 1).attr("r", 8);
        const court = courts.find((c) => c.name === d[0]);
        const rating = court ? court.overall_assessment : 0;
        const ratingColor = getColorByRating(rating);

        tooltip
          .style("display", "block")
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY + 10}px`)
          .html(`
            <div class="p-2">
              <div class="font-medium mb-1">${d[0]}</div>
              <div class="flex items-center justify-between">
                <span class="text-gray-700">${getTranslation("MapRayon_OverallRating", language)}:</span>
                <span class="ml-2 px-2 py-0.5 rounded text-gray-900 font-medium" style="background-color: ${rating > 0 ? ratingColor + '40' : '#E5E7EB'}">
                  ${rating > 0 ? `<span class="text-yellow-500 mr-1">★</span>${rating.toFixed(1)} / 5` : "Нет данных"}
                </span>
              </div>
            </div>
          `);
      })
      .on("mouseout", function () {
        d3.select(this).attr("opacity", 0.8).attr("r", 6);
        tooltip.style("display", "none");
      })
      .on("touchstart", function (event: any, d) {
        event.preventDefault();
        const court = courts.find((c) => c.name === d[0]);
        const rating = court ? court.overall_assessment : 0;
        const ratingColor = getColorByRating(rating);
        const coordinates = getEventCoordinates(event);

        tooltip
          .style("display", "block")
          .style("position", "fixed")
          .style("left", `${coordinates.x + 10}px`)
          .style("top", `${coordinates.y + 10}px`)
          .html(`
            <div class="p-2">
              <div class="font-medium mb-1">${d[0]}</div>
              <div class="flex items-center justify-between">
                <span class="text-gray-700">${getTranslation("MapRayon_OverallRating", language)}:</span>
                <span class="ml-2 px-2 py-0.5 rounded text-gray-900 font-medium" style="background-color: ${rating > 0 ? ratingColor + '40' : '#E5E7EB'}">
                  ${rating > 0 ? `<span class="text-yellow-500 mr-1">★</span>${rating.toFixed(1)} / 5` : "Нет данных"}
                </span>
              </div>
            </div>
          `);
      })
      .on("touchend", function () {
        tooltip.style("display", "none");
      })
      .on("touchmove", function (event: any) {
        const coordinates = getEventCoordinates(event);
        tooltip
          .style("left", `${coordinates.x + 10}px`)
          .style("top", `${coordinates.y + 10}px`);
      })
      .on("click", function (event: any, d) {
        if (!onSelectRayon) return;
        const court = courts.find((c) => c.name === d[0]);
        if (court) {
          onSelectRayon(court);
        }
      });

    svg.on("click", function (event: any) {
      if (event.target.tagName === "svg") {
        tooltip.style("display", "none");
      }
    });

    svg.on("touchmove", function (event: any) {
      const coordinates = getEventCoordinates(event);
      tooltip
        .style("left", `${coordinates.x + 10}px`)
        .style("top", `${coordinates.y + 10}px`);
    });

    svg.append("defs")
      .append("filter")
      .attr("id", "shadow")
      .append("feDropShadow")
      .attr("dx", "0")
      .attr("dy", "2")
      .attr("stdDeviation", "3")
      .attr("flood-opacity", "0.3");

    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(20, 60)`)
      .style("opacity", 0)
      .style("display", "none");

    legend
      .append("rect")
      .attr("width", 190)
      .attr("height", 240)
      .attr("fill", "white")
      .attr("rx", 10)
      .attr("stroke", "#e5e7eb")
      .attr("stroke-width", 1)
      .attr("filter", "url(#shadow)")
      .attr("opacity", 0.95);

    legend
      .append("text")
      .attr("x", 95)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("font-weight", "700")
      .attr("fill", "#1f2937")
      .text(getTranslation("MapRayon_ScaleTitle", language));

    legend
      .append("line")
      .attr("x1", 15)
      .attr("y1", 35)
      .attr("x2", 175)
      .attr("y2", 35)
      .attr("stroke", "#e5e7eb")
      .attr("stroke-width", 1);

    const legendData = [
      { color: "#66C266", label: "4.5 - 5.0" },
      { color: "#B4D330", label: "4.0 - 4.4" },
      { color: "#FFC04D", label: "3.5 - 3.9" },
      { color: "#F4A460", label: "3.0 - 3.4" },
      { color: "#ff8300", label: "2.0 - 2.9" },
      { color: "#ff620d", label: "1.5 - 2.0" },
      { color: "#fa5d5d", label: "1.0 - 1.5" },
      { color: "#640202", label: "0.5 - 1.0" },
    ];

    legend
      .selectAll(".legend-item")
      .data(legendData)
      .join("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(15, ${i * 24 + 45})`)
      .call((g) => {
        g.append("rect")
          .attr("width", 18)
          .attr("height", 18)
          .attr("rx", 4)
          .attr("fill", (d) => d.color)
          .attr("stroke", "#e5e7eb")
          .attr("stroke-width", 0.5);

        g.append("text")
          .attr("x", 28)
          .attr("y", 13)
          .attr("font-size", "13px")
          .attr("fill", "#4B5563")
          .text((d) => d.label);
      });

    if (showLegend) {
      legend
        .style("display", "block")
        .transition()
        .duration(300)
        .style("opacity", 1);
    } else {
      legend
        .transition()
        .duration(300)
        .style("opacity", 0)
        .on("end", () => {
          legend.style("display", "none");
        });
    }
  }, [selectedRayon, onSelectRayon, courts, showLegend, language]);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <svg ref={svgRef} className="w-full h-auto"></svg>

      {/* Кнопки зума */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-30 ContainerZoomButtons">
        <button
          onClick={() => {
            svgRef.current &&
              d3.select(svgRef.current).call(zoomRef.current!.scaleBy, 1.2);
          }}
          className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 text-gray-600 border border-gray-300"
        >
          <Plus className="w-7 h-7 ZoomButtons" />
        </button>
        <button
          onClick={() => {
            svgRef.current &&
              d3.select(svgRef.current).call(zoomRef.current!.scaleBy, 0.8);
          }}
          className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 text-gray-600 border border-gray-300"
        >
          <Minus className="w-7 h-7 ZoomButtons" />
        </button>
        <button
          onClick={() => {
            svgRef.current &&
              d3
                .select(svgRef.current)
                .call(zoomRef.current!.transform, d3.zoomIdentity);
          }}
          className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 text-gray-600 border border-gray-300"
        >
          <RefreshCw className="w-7 h-7 ZoomButtons" />
        </button>
      </div>

      <div
        ref={tooltipRef}
        className="absolute hidden bg-white p-2 rounded shadow-lg border border-gray-200"
        style={{ minWidth: "150px" }}
      ></div>
    </div>
  );
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

function getEventCoordinates(event: any) {
  if (event.touches && event.touches[0]) {
    return { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }
  if (event.changedTouches && event.changedTouches[0]) {
    return {
      x: event.changedTouches[0].clientX,
      y: event.changedTouches[0].clientY,
    };
  }
  return { x: event.clientX, y: event.clientY };
}

// Добавьте функцию для получения ID судов
function getCourtIdByName(name: string): number {
  const courtIds: {[key: string]: number} = {
    // Суды 2-й инстанции (из вашего API)
    "Бишкекский городской суд": 66,
    "Баткенский областной суд": 2,
    "Таласский областной суд": 11,
    "Нарынский областной суд": 16,
    "Жалал-Абадский областной суд": 24,
    "Ошский областной суд": 38,
    "Иссык-кульский областной суд": 47,
    "Чуйский областной суд": 55,
    
    // Суды 1-й инстанции (из предыдущих данных API)
    "Панфиловcкий районный суд": 64, // Обратите внимание на латинскую 'c'
    "Панфиловский районный суд": 64,
    "Кеминский районный суд": 62,
    "Баткенский районный суд": 3,    // Было 21, исправляем на 3
    "Лейлекский районный суд": 5,    // Было 22, исправляем на 5
    "Кадамжайский районный суд": 4,   // Было 23, исправляем на 4
    "Аламудунский районный суд": 57,  // Было 64, исправляем на 57
    "Сокулукский районный суд": 59,   // Было 65, исправляем на 59
    "Московский районный суд": 63,    // Было 66, исправляем на 63
    "Жайылский районный суд": 61,     // Было 67, исправляем на 61
    "Чуйский районный суд": 56,       // Было 68, исправляем на 56
    "Ысык-Атинский районный суд": 58,  // Было 69, исправляем на 58
    "Ак-Суйский районный суд": 50,     // Было 42, исправляем на 50
    "Жети-Огузский районный суд": 51,  // Было 43, исправляем на 51
    "Тонский районный суд": 79,
    "Тюпский районный суд": 52,
    "Иссык-Кульский районный суд": 48,
    "Ак-Талинский районный суд": 20,   // Было 47, исправляем на 20
    "Ат-Башинский районный суд": 19,   // Было 48, исправляем на 19
    "Жумгальский районный суд": 22,    // Было 49, исправляем на 22
    "Кочкорский районный суд": 21,     // Было 50, исправляем на 21
    "Нарынский районный суд": 18,      // Было 51, исправляем на 18
    "Таласский районный суд": 10,      // Было 52, исправляем на 10
    "Бакай-Атинский районный суд": 12, // Было 53, исправляем на 12
    "Кара-Бууринский районный суд": 13, // Было 54, исправляем на 13
    "Манасский районный суд": 14,      // Было 55, исправляем на 14
    "Алайский районный суд": 44,       // Было 1, исправляем на 44
    "Араванский районный суд": 42,     // Было 2, исправляем на 42
    "Кара-Кулджинский районный суд": 45, // Было 3, исправляем на 45
    "Кара-Суйский районный суд": 40,    // Было 4, исправляем на 40
    "Ноокатский районный суд": 80,     // Было 5, исправляем на 80
    "Узгенский районный суд": 41,      // Было 6, исправляем на 41
    "Чон-Алайский районный суд": 43,   // Было 7, исправляем на 43
    "Аксыйский районный суд": 30,      // Было 11, исправляем на 30
    "Ала-Букинский районный суд": 33,  // Было 12, исправляем на 33
    "Базар-Коргонский районный суд": 35, // Было 13, исправляем на 35
    "Чаткальский районный суд": 32,    // Было 14, исправляем на 32
    "Ноокенский районный суд": 34,     // Было 15, исправляем на 34
    "Сузакский районный суд": 29,      // Было 16, исправляем на 29
    "Тогуз-Тороузский районный суд": 31, // Было 17, исправляем на 31
    "Токтогульский районный суд": 36,  // Было 18, исправляем на 36

    // Городские суды
    "Административный суд г. Бишкек": 81,
    "Ленинский районный суд": 67,
    "Октябрьский районный суд": 68,
    "Первомайский районный суд": 69,
    "Свердловский районный суд": 70,
    "Балыкчинский городской суд": 49,  // Было 40, исправляем на 49
    "Ошский городской суд": 39,        // Было 8, исправляем на 39
  };
  
  return courtIds[name] || 0;
}

// Обновляем типизацию функции getAspectValue
const getAspectValue = (assessment: any, aspectName: string): number => {
  if (Array.isArray(assessment)) {
    const aspect = assessment.find(item => item.aspect === aspectName);
    return aspect ? aspect.court_avg : 0;
  } else {
    return assessment?.[aspectName] || 0;
  }
};
