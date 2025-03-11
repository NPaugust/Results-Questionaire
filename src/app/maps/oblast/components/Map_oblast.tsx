"use client";

import React, {
  useRef,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import * as d3 from "d3";
import geoData from "../../../../../public/gadm41_KGZ_1.json";
import { FiMinus, FiPlus, FiRefreshCw } from "react-icons/fi";

interface SVGFeature {
  type: string;
  properties: {
    NAME_1: string;
    GID_1: string;
    GID_0: string;
    COUNTRY: string;
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
    coordinates: number[][][][];
  };
}

const oblastCoordinates: { [key: string]: [number, number] } = {
  Бишкек: [74.69, 42.87],
  "Чуйская область": [74.5, 42.8],
  "Таласская область": [72.2, 42.5],
  "Иссык-Кульская область": [77.5, 42.3],
  "Нарынская область": [75.5, 41.3],
  "Жалал-Абадская область": [72.5, 41.5],
  "Баткенская область": [71.5, 40.0],
  "Ошская область": [73.0, 40.5],
};

interface OblastData {
  id: number;
  name: string;
  ratings: number[];
  overall: number;
  totalAssessments: number;
}

interface MapProps {
  oblastData: OblastData[];
}

type OblastMapping = {
  [key: string]: string;
};

export default function Map_oblast({ oblastData }: MapProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 480 });

  // Создаём объект zoom для управления масштабом
  const zoom = useMemo(
    () =>
      d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([1, 8]) // Ограничиваем масштаб от 1x до 8x
        .touchable(true) // Включаем поддержку сенсорных событий
        .wheelDelta((event) => -event.deltaY * 0.002)
        .on("start", () => {
          // Сбрасываем флаг перемещения при начале зума
        })
        .on("zoom", (event) => {
          d3.select(svgRef.current)
            .select(".regions")
            .attr("transform", event.transform);
        })
        .on("end", () => {
          // Ничего не делаем, просто завершаем событие
        }),
    []
  );
  const oblastMapping: OblastMapping = useMemo(
    () => ({
      Biškek: "Город Бишкек",
      Chüy: "Чуйская область",
      Talas: "Таласская область",
      "Ysyk-Köl": "Иссык-Кульская область",
      Naryn: "Нарынская область",
      "Jalal-Abad": "Жалал-Абадская область",
      Batken: "Баткенская область",
      Osh: "Ошская область",
    }),
    []
  );

  const getOblastRating = useCallback(
    (oblastName: string) => {
      const mappedName = oblastMapping[oblastName] || oblastName;
      const oblast = oblastData.find((o) => o.name === mappedName);
      return oblast?.overall || 0;
    },
    [oblastData, oblastMapping]
  );

  const getColor = useCallback((rating: number) => {
    if (rating === 0) return "#999999";
    if (rating >= 5.0) return "#66C266";
    if (rating >= 4.5) return "#66C266";
    if (rating >= 4.0) return "#B4D330";
    if (rating >= 3.5) return "#FFC04D";
    if (rating >= 3.0) return "#F4A460";
    if (rating >= 2.5) return "#E57357";
    if (rating >= 2.0) return "#ff620d";
    if (rating >= 1.5) return "#fa5d5d";
    if (rating >= 1.0) return "#fa5d5d";
    if (rating >= 0.5) return "#640202";
    return "#999999";
  }, []);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = d3.select(containerRef.current);
    const width = container.node()?.getBoundingClientRect().width || 800;
    const height = width * 0.6;

    setDimensions({ width, height });

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    // Центрируем карту
    const projection = d3
      .geoMercator()
      .center([75, 41.5]) // Немного скорректированные координаты центра
      .scale(width * 3.5)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Добавляем статистику
    const stats = svg
      .append("g")
      .attr("class", "stats")
      .attr("transform", `translate(${width - 1200}, 20)`);

    stats
      .append("rect")
      .attr("width", 200)
      .attr("height", 80)
      .attr("fill", "white")
      .attr("rx", 8)
      .attr("opacity", 0.9)
      .attr("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))");

    // Вычисляем среднюю оценку
    const averageRating = oblastData.reduce((acc, curr) => acc + curr.overall, 0) / oblastData.length;

    // Вычисляем общее количество отзывов
    const totalAssessments = oblastData.reduce((acc, curr) => acc + curr.totalAssessments, 0);

    // Добавляем текст статистики
    stats
      .append("text")
      .attr("x", 10)
      .attr("y", 30)
      .attr("fill", "#374151")
      .attr("font-size", "12px")
      .text(`Средняя оценка областей: ${averageRating.toFixed(1)}`);

    stats
      .append("text")
      .attr("x", 10)
      .attr("y", 55)
      .attr("fill", "#374151")
      .attr("font-size", "12px")
      .text(`Общее количество оценок: ${totalAssessments}`);

    // Улучшенная легенда
    const hasData = oblastData && oblastData.length > 0;
    if (hasData) {
      const legend = svg
        .append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - 200}, 20)`);

      legend
        .append("rect")
        .attr("width", 180)
        .attr("height", 220)
        .attr("fill", "white")
        .attr("rx", 8)
        .attr("opacity", 0.9)
        .attr("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))");

      legend
        .append("text")
        .attr("x", 10)
        .attr("y", 25)
        .attr("font-size", "12px")
        .attr("font-weight", "600")
        .attr("fill", "#374151")
        .text("Шкала оценок  по цвету");

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
        .attr("transform", (d, i) => `translate(10, ${i * 22 + 35})`)
        .call((g) => {
          g.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("rx", 3)
            .attr("fill", (d) => d.color);
          g.append("text")
            .attr("x", 25)
            .attr("y", 12)
            .attr("font-size", "12px")
            .attr("fill", "#4B5563")
            .text((d) => d.label);
        });
    }

    // Добавляем CSS для анимации областей
    const style = document.createElement('style');
    style.textContent = `
      .region-path {
        transition: all 0.2s ease-in-out;
      }
      .region-path:hover {
        filter: brightness(0.9);
        transform: scale(1.01);
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);

    // Создаём группу для регионов
    const regionsGroup = svg.append("g").attr("class", "regions");

    // Применяем зум к SVG
    svg.call(zoom);

    // Ограничиваем перемещение карты
    zoom.translateExtent([
      [0, 0], // Минимальные координаты (верхний левый угол)
      [width, height], // Максимальные координаты (нижний правый угол)
    ]);

    // Рисуем области
    regionsGroup
      .selectAll("path")
      .data(geoData.features as SVGFeature[])
      .join("path")
      .attr("d", path as any)
      .attr("class", "region-path")
      .attr("fill", (d: SVGFeature) =>
        hasData ? getColor(getOblastRating(d.properties.NAME_1)) : "#999999"
      )
      .attr("stroke", "#fff")
      .attr("stroke-width", "1")
      .style("cursor", hasData ? "pointer" : "default")
      .on("mouseover", function (event: any, d: SVGFeature) {
        if (!hasData) return;
        d3.select(this).attr("stroke-width", "2");

        const coordinates = getEventCoordinates(event);
        const tooltip = d3.select(tooltipRef.current);
        tooltip
          .style("display", "block")
          .style("position", "fixed")
          .style("left", `${coordinates.x + 10}px`)
          .style("top", `${coordinates.y + 10}px`);

        const mappedName =
          oblastMapping[d.properties.NAME_1] || d.properties.NAME_1;
        const rating = getOblastRating(d.properties.NAME_1);
        tooltip.html(`
          <div class="font-medium">${mappedName}</div>
          <div>Общая оценка: ${rating.toFixed(1)}</div>
        `);
      })
      .on("mousemove", function (event: any) {
        if (!hasData) return;
        const coordinates = getEventCoordinates(event);
        const tooltip = d3.select(tooltipRef.current);
        tooltip
          .style("left", `${coordinates.x + 10}px`)
          .style("top", `${coordinates.y + 10}px`);
      })
      .on("mouseout", function () {
        if (!hasData) return;
        d3.select(this).attr("stroke-width", "1");
        d3.select(tooltipRef.current).style("display", "none");
      })
      .on("touchstart", function (event: any, d: SVGFeature) {
        if (!hasData) return;
        event.preventDefault();
        d3.select(this).attr("stroke-width", "2");

        const coordinates = getEventCoordinates(event);
        const tooltip = d3.select(tooltipRef.current);
        tooltip
          .style("display", "block")
          .style("position", "fixed")
          .style("left", `${coordinates.x + 10}px`)
          .style("top", `${coordinates.y + 10}px`);

        const mappedName =
          oblastMapping[d.properties.NAME_1] || d.properties.NAME_1;
        const rating = getOblastRating(d.properties.NAME_1);
        tooltip.html(`
          <div class="font-medium">${mappedName}</div>
          <div>Общая оценка: ${rating.toFixed(1)}</div>
        `);
      })
      .on("touchmove", function (event: any) {
        if (!hasData) return;
        event.preventDefault();
        const coordinates = getEventCoordinates(event);
        const tooltip = d3.select(tooltipRef.current);
        tooltip
          .style("left", `${coordinates.x + 10}px`)
          .style("top", `${coordinates.y + 10}px`);
      })
      .on("touchend", function () {
        if (!hasData) return;
        d3.select(this).attr("stroke-width", "1");
        d3.select(tooltipRef.current).style("display", "none");
      });

    // Добавляем текст с оценками только если данные есть
    if (hasData) {
      regionsGroup
        .selectAll("text")
        .data(geoData.features as SVGFeature[])
        .join("text")
        .attr("x", (d: any) => path.centroid(d)[0])
        .attr("y", (d: any) => path.centroid(d)[1])
        .attr("text-anchor", "middle")
        .attr("class", "region-label")
        .attr("font-weight", "bold")
        .attr("font-size", width < 640 ? "10px" : "11px") // Адаптивный размер текста
        .style("pointer-events", "none")
        .text((d: SVGFeature) => {
          const rating = getOblastRating(d.properties.NAME_1);
          return rating ? rating.toFixed(1) : "";
        });
    }

    return () => {
      svg.call(zoom.transform, d3.zoomIdentity);
      style.remove(); // Удаляем стили при размонтировании
    };
  }, [oblastData, getOblastRating, getColor, zoom]);

  return (
    <div ref={containerRef} className="relative w-full">
      <svg ref={svgRef} className="w-full h-auto"></svg>
      
      {/* Кнопки зума */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-5 z-30 ContainerZoomButtons">
        <button
          onClick={() => {
            svgRef.current && d3.select(svgRef.current).call(zoom.scaleBy, 1.2);
          }}
          className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 text-gray-600"
        >
          <FiPlus className="w-7 h-7 ZoomButtons" />
        </button>
        <button
          onClick={() => {
            svgRef.current && d3.select(svgRef.current).call(zoom.scaleBy, 0.8);
          }}
          className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 text-gray-600"
        >
          <FiMinus className="w-7 h-7 ZoomButtons" />
        </button>
        <button
          onClick={() => {
            svgRef.current &&
              d3.select(svgRef.current).call(zoom.transform, d3.zoomIdentity);
          }}
          className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 text-gray-600"
        >
          <FiRefreshCw className="w-7 h-7 ZoomButtons" />
        </button>
      </div>
      <div
        ref={tooltipRef}
        className="hidden absolute bg-white border border-gray-200 rounded-md shadow-lg p-2 z-50"
        style={{ pointerEvents: "none" }}
      ></div>
    </div>
  );
}

function getEventCoordinates(event: any) {
  if (event.touches && event.touches[0]) {
    return {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    };
  }
  if (event.changedTouches && event.changedTouches[0]) {
    return {
      x: event.changedTouches[0].clientX,
      y: event.changedTouches[0].clientY,
    };
  }
  return {
    x: event.clientX,
    y: event.clientY,
  };
}
