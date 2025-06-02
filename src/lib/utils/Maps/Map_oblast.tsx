"use client";

import React, { useRef, useEffect, useMemo, useState, useCallback } from "react";
import * as d3 from "d3";
import { Minus, Plus, RefreshCw, Info, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface OblastData {
  id: number;
  name: string;
  ratings: number[];
  overall: number;
  totalAssessments: number;
}

interface GeoDataFeature {
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

interface GeoData {
  features: GeoDataFeature[];
}

type OblastMapping = { [key: string]: string };

const BASE_PATH = "/results";

export default function Map_oblast({ oblastData }: { oblastData: OblastData[] }) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [geoData, setGeoData] = useState<GeoData | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 480 });
  const [showInfo, setShowInfo] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const initialTransformRef = useRef(d3.zoomIdentity);
  const { getTranslation, language } = useLanguage();

  const zoom = useMemo(
    () =>
      d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([1, 8])
        .touchable(true)
        .wheelDelta((event) => -event.deltaY * 0.001)
        .filter((event) => {
          if (!svgRef.current) return false;
          const transform = d3.zoomTransform(svgRef.current);
          return (
            event.type === "wheel" ||
            event.type === "dblclick" ||
            (event.type === "mousedown" && transform.k > 1)
          );
        })
        .on("zoom", (event) => {
          d3.select(svgRef.current)
            .select(".regions")
            .attr("transform", event.transform);
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
    if (!rating) return "#cccccc";
    if (rating >= 4.5) return "#66C266";
    if (rating >= 4.0) return "#B4D330";
    if (rating >= 3.5) return "#FFC04D";
    if (rating >= 3.0) return "#F4A460";
    if (rating >= 2.0) return "#ff8300";
    if (rating >= 1.5) return "#ff620d";
    if (rating >= 1.0) return "#fa5d5d";
    if (rating >= 0.5) return "#640202";
    return "#cccccc";
  }, []);

  const colorScale = useMemo(
    () => [
      { range: "4.5 - 5.0", color: "#66C266" },
      { range: "4.0 - 4.4", color: "#B4D330" },
      { range: "3.5 - 3.9", color: "#FFC04D" },
      { range: "3.0 - 3.4", color: "#F4A460" },
      { range: "2.0 - 2.9", color: "#ff8300" },
      { range: "1.5 - 1.9", color: "#ff620d" },
      { range: "1.0 - 1.4", color: "#fa5d5d" },
      { range: "0.5 - 0.9", color: "#640202" },
      { range: "Нет данных", color: "#cccccc" },
    ],
    []
  );

  useEffect(() => {
    fetch(`${BASE_PATH}/gadm41_KGZ_1.json`)
      .then((response) => {
        if (!response.ok) throw new Error("Не удалось загрузить GeoJSON");
        return response.json();
      })
      .then((data: GeoData) => {
        setGeoData(data);
      })
      .catch((error) => console.error("Ошибка загрузки геоданных:", error));
  }, []);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !geoData) return;

    const container = d3.select(containerRef.current);
    const width = container.node()?.getBoundingClientRect().width || 800;
    const height = width * 0.6;

    setDimensions({ width, height });

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg
      .attr("width", "100%")
      .attr("height", height)
      .attr("viewBox", `0 0 1200 600`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const projection = d3
      .geoMercator()
      .center([74.7, 41.3])
      .scale(6000)
      .translate([1200 / 2, 600 / 2]);

    const path = d3.geoPath().projection(projection);

    if (typeof document !== "undefined") {
      const style = document.createElement("style");
      style.textContent = `
        .region-path {
          transition: all 0.2s ease-in-out;
        }
        .region-path:hover {
          transform: scale(1.02);
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
          cursor: pointer;
        }
      `;
      document.head.appendChild(style);
    }

    const baseGroup = svg.append("g").attr("class", "base-group");
    const regionsGroup = baseGroup.append("g").attr("class", "regions");

    const hasData = oblastData && oblastData.length > 0;

    regionsGroup
      .selectAll("path")
      .data(geoData.features)
      .join("path")
      .attr("d", path as any)
      .attr("class", "region-path")
      .attr("fill", (d: GeoDataFeature) =>
        hasData ? getColor(getOblastRating(d.properties.NAME_1)) : "#999999"
      )
      .attr("stroke", "#fff")
      .attr("stroke-width", "1")
      .style("cursor", hasData ? "pointer" : "default")
      .on("mouseover", function (event: any, d: GeoDataFeature) {
        if (!hasData) return;
        d3.select(this).attr("stroke-width", "2");

        const coordinates = getEventCoordinates(event);
        const tooltip = d3.select(tooltipRef.current);
        const mappedName = oblastMapping[d.properties.NAME_1] || d.properties.NAME_1;
        const rating = getOblastRating(d.properties.NAME_1);
        const ratingColor = getColor(rating);

        tooltip
          .style("display", "block")
          .style("position", "fixed")
          .style("left", `${coordinates.x + 10}px`)
          .style("top", `${coordinates.y + 10}px`)
          .html(`
            <div class="p-2">
              <div class="font-medium mb-1">${mappedName}</div>
              <div class="flex items-center justify-between">
                <span class="text-gray-700">Общая оценка:</span>
                <span class="ml-2 px-2 py-0.5 rounded text-gray-900 font-medium" style="background-color: ${rating > 0 ? ratingColor + '40' : '#E5E7EB'}">
                  ${rating > 0 ? `<span class="text-yellow-600 mr-1">★</span>${rating.toFixed(1)} / 5` : "Нет данных"}
                </span>
              </div>
            </div>
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
      });

    if (hasData) {
      regionsGroup
        .selectAll("text")
        .data(geoData.features)
        .join("text")
        .attr("x", (d: any) => path.centroid(d)[0])
        .attr("y", (d: any) => path.centroid(d)[1])
        .attr("text-anchor", "middle")
        .attr("class", "region-label")
        .attr("font-weight", "bold")
        .attr("font-size", width < 640 ? "10px" : "11px")
        .style("pointer-events", "none")
        .text((d: GeoDataFeature) => {
          const rating = getOblastRating(d.properties.NAME_1);
          return rating ? rating.toFixed(1) : "";
        });
    }

    const legend = svg.append("g").attr("class", "legend").style("display", "none");

    const legendX = 20;
    const legendY = 60;
    const boxWidth = 15;
    const boxHeight = 15;
    const textOffset = 25; 

    legend
      .selectAll("rect")
      .data(colorScale)
      .enter()
      .append("rect")
      .attr("x", legendX)
      .attr("y", (d, i) => legendY + i * (boxHeight + 3))
      .attr("width", boxWidth)
      .attr("height", boxHeight)
      .attr("fill", (d) => d.color)
      .attr("stroke", "#000")
      .attr("stroke-width", "0.5");

    legend
      .selectAll("text")
      .data(colorScale)
      .enter()
      .append("text")
      .attr("x", legendX + textOffset)
      .attr("y", (d, i) => legendY + i * (boxHeight + 3) + boxHeight / 2)
      .attr("dy", "0.35em")
      .attr("font-size", "10px")
      .attr("fill", "#000")
      .text((d) => d.range);

    svg.call(zoom);
    zoom.translateExtent([[0, 0], [width, height]]);

    initialTransformRef.current = d3.zoomIdentity;

    return () => {
      if (typeof document !== "undefined") {
        const style = document.querySelector("style");
        if (style) document.head.removeChild(style);
      }
    };
  }, [geoData, oblastData, getOblastRating, getColor, zoom]);

  useEffect(() => {
    if (!svgRef.current) return;

    const legend = d3.select(svgRef.current).select(".legend");

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
  }, [showLegend]);

  return (
    <div ref={containerRef} className="relative w-full">
      <svg ref={svgRef} className="w-full h-auto"></svg>

      {/* Кнопка информации */}
      <button
  onClick={() => {
    if (showLegend) {
      setShowLegend(false);
    } else {
      setShowInfo(!showInfo);
    }
  }}
  className="hidden sm:flex absolute top-4 left-4 z-[70] bg-white p-2 rounded-full shadow-md hover:bg-gray-100 text-gray-600 items-center gap-2 border border-gray-300"
>
  {showLegend ? (
    <>
      <X className="w-5 h-5" />
      <span className="text-sm">{getTranslation("MapOblast_HideScale", language)}</span>
    </>
  ) : (
    <>
      <Info className="w-5 h-5" />
      <span className="text-sm">{getTranslation("MapOblast_Information", language)}</span>
    </>
  )}
</button>


      {/* Информационное окно */}
      {showInfo && !showLegend && (
        <div
          className="absolute top-16 left-4 z-[40] bg-white p-4 rounded-lg shadow-lg border border-gray-200"
          style={{ maxWidth: "320px" }}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-gray-800">{getTranslation("MapOblast_Title", language)}</h3>
            <button
              onClick={() => setShowInfo(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 táj h-5" />
            </button>
          </div>
          <div className="border-t border-gray-200 pt-2 mb-4">
            <p className="text-sm text-gray-600 mb-2">
              {getTranslation("MapOblast_Description", language)}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              {getTranslation("MapOblast_ColorDescription", language)}
            </p>
            <p className="text-sm text-gray-600">
              {getTranslation("MapOblast_ZoomDescription", language)}
            </p>
          </div>

          <button
            onClick={() => {
              setShowLegend(true);
              setShowInfo(false);
            }}
            className="w-full py-2 px-3 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 flex items-center justify-center gap-2"
          >
            <Info className="w-4 h-4" />
            <span className="text-sm">{getTranslation("MapOblast_ShowScale", language)}</span>
          </button>
        </div>
      )}

      {/* Кнопки управления зумом */}
      <div className="absolute bottom-4 right-4 z-[60] flex flex-col gap-2">
        <button
          onClick={() => {
            svgRef.current && d3.select(svgRef.current).call(zoom.scaleBy, 1.2);
          }}
          className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 text-gray-600"
        >
          <Plus className="w-7 h-7" />
        </button>
        <button
          onClick={() => {
            svgRef.current && d3.select(svgRef.current).call(zoom.scaleBy, 0.8);
          }}
          className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 text-gray-600"
        >
          <Minus className="w-7 h-7" />
        </button>
        <button
          onClick={() => {
            if (svgRef.current) {
              d3.select(svgRef.current)
                .transition()
                .duration(300)
                .call(zoom.transform, initialTransformRef.current);
            }
          }}
          className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 text-gray-600"
        >
          <RefreshCw className="w-7 h-7" />
        </button>
      </div>

      {/* Тултип */}
      <div
        ref={tooltipRef}
        className="hidden absolute bg-white shadow-lg rounded-md p-2 z-[50] pointer-events-none"
        style={{ minWidth: "150px" }}
      ></div>
    </div>
  );
}

function getEventCoordinates(event: any) {
  if (event.touches && event.touches[0]) {
    return { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }
  if (event.changedTouches && event.changedTouches[0]) {
    return { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
  }
  return { x: event.clientX, y: event.clientY };
}

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