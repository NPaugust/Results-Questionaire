'use client';
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import rayonData from '../../../../../public/gadm41_KGZ_2.json';
import { courts } from '../District-Courts/page'; // Импортируем данные из page.tsx

// Обновленный маппинг районов к судам
const rayonToCourtMapping: { [key: string]: string } = {
  // Бишкек
  'Biskek': 'Бишкекский межрайонный суд',
  // Баткенская область
  'Batken': 'Баткенский районный суд',
  'Lailak': 'Лейлекский районный суд',
  'Kadamjai': 'Кадамжайский районный суд',

  // Чуйская область
  'Alamüdün': 'Аламудунский районный суд',
  'Sokuluk': 'Сокулукский районный суд',
  'Moskovsky': 'Московский районный суд',
  'Jaiyl': 'Жайылский районный суд',
  'Panfilov': 'Панфиловский районный суд',
  'Kemin': 'Кеминский районный суд',
  'Ysyk-Ata': 'Ысык-Атинский районный суд',
  'Chui': 'Чуйский районный суд',

  // Иссык-Кульская область
  'Ak-Suu': 'Ак-Суйский районный суд',
  'Djety-Oguz': 'Джети-Огузский районный суд',
  'Ton': 'Тонский районный суд',
  'Tüp': 'Тюпский районный суд',
  'Ysyk-Köl': 'Иссык-Кульский районный суд',

  // Нарынская область
  'Ak-Talaa': 'Ак-Талинский районный суд',
  'At-Bashi': 'Ат-Башинский районный суд',
  'Jumgal': 'Жумгальский районный суд',
  'Kochkor': 'Кочкорский районный суд',
  'Naryn': 'Нарынский районный суд',

  // Таласская область
  'Talas': 'Таласский районный суд',
  'Bakai-Ata': 'Бакай-Атинский районный суд',
  'Kara-Buura': 'Кара-Буринский районный суд',
  'Manas': 'Манасский районный суд',

  // Ошская область
  'Alai': 'Алайский районный суд',
  'Aravan': 'Араванский районный суд',
  'Kara-Kuldja': 'Кара-Кулджинский районный суд',
  'Kara-Suu': 'Кара-Сууский районный суд',
  'Nookat': 'Ноокатский районный суд',
  'Uzgen': 'Узгенский районный суд',
  'Chong-Alay': 'Чон-Алайский районный суд',

  // Джалал-Абадская область
  'Aksyi': 'Аксыйский районный суд',
  'Ala-Buka': 'Ала-Букинский районный суд',
  'Bazar-Korgon': 'Базар-Коргонский районный суд',
  'Chatkal': 'Чаткальский районный суд',
  'Nooken': 'Ноокенский районный суд',
  'Suzak': 'Сузакский районный суд',
  'Togus-Toro': 'Тогуз-Тороуский районный суд',
  'Toktogul': 'Токтогульский районный суд'
};



// В функции getRayonRating добавим проверку на существование маппинга
const getRayonRating = (rayonName: string): number => {
  const courtName = rayonToCourtMapping[rayonName];
  if (!courtName) {
    console.log(`Нет маппинга для района: ${rayonName}`);
    return 0;
  }
  const court = courts.find(c => c.name === courtName);
  return court ? court.ratings[0] : 0;
};

interface MapProps {
  selectedRayon: string | null;
  onSelectRayon?: (courtName: string) => void;
}

export default function Map_rayon({ selectedRayon, onSelectRayon }: MapProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 400;
    
    svg.attr('width', width)
       .attr('height', height)
       .attr('viewBox', `0 0 ${width} ${height}`)
       .attr('preserveAspectRatio', 'xMidYMid meet');

    const g = svg.append('g');

    // Создаем функцию зума с ограничениями
    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .translateExtent([[0, 0], [width, height]]) // Ограничиваем область перемещения
      .extent([[0, 0], [width, height]])
      .on('zoom', (event) => {
        // Получаем текущую трансформацию
        const transform = event.transform;
        
        // Ограничиваем перемещение в зависимости от масштаба
        const scale = transform.k;
        const tx = Math.min(0, Math.max(transform.x, width * (1 - scale)));
        const ty = Math.min(0, Math.max(transform.y, height * (1 - scale)));
        
        // Применяем ограниченную трансформацию
        g.attr('transform', `translate(${tx},${ty}) scale(${scale})`);
      });

    // Применяем зум к SVG
    svg.call(zoom as any);

    const projection = d3.geoMercator()
      .center([74.5, 41.5])
      .scale(3200)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    const tooltip = d3.select(tooltipRef.current);

    const getColor = (rating: number, isSelected: boolean, properties: any): string => {
      // Сначала проверяем озера
      if (properties.NAME_2 === 'Ysyk-Köl(lake)' || 
          properties.NAME_2 === 'Ysyk-Kol' || 
          properties.NAME_2 === 'Issyk-Kul' ||
          properties.NAME_2 === 'Song-Kol' || 
          properties.NAME_2 === 'Song-Kol(lake)' || 
          properties.NAME_2 === 'Song-kol') {
        return '#7CC9F0';
      }

      // Затем обычная логика цветов
      if (!isSelected && selectedRayon) return '#E5E7EB';
      if (rating === 0) return '#999999';
      if (rating >= 4.5) return '#66C266';
      if (rating >= 4.0) return '#B4D330';
      if (rating >= 3.5) return '#FFC04D';
      if (rating >= 3.0) return '#F4A460';
      if (rating >= 2.5) return '#E57357';
      if (rating >= 2.0) return '#CD5C5C';
      if (rating >= 1.5) return '#A52A2A';
      if (rating >= 1.0) return '#8B0000';
      return '#999999';
    };

    
    // Обновляем отрисовку районов
    g.selectAll('path')
      .data((rayonData as any).features)
      .join('path')
      .attr('d', path as any)
      .attr('fill', (d: any) => {
        const rating = getRayonRating(d.properties.NAME_2);
        const isSelected = !selectedRayon || rayonToCourtMapping[d.properties.NAME_2] === selectedRayon;
        return getColor(rating, isSelected, d.properties);
      })
      .attr('stroke', 'white')
      .attr('stroke-width', '0.5')
      .style('cursor', 'pointer')
      .on('click', (event: any, d: any) => {
        const courtName = rayonToCourtMapping[d.properties.NAME_2];
        if (courtName) {
          onSelectRayon?.(courtName);
        }
      })
      .on('mouseover', function(event, d: any) {
        // Пропускаем тултип для озера
        if (d.properties.NAME_2 === 'Ysyk-Köl(lake)' || 
            d.properties.NAME_2 === 'Ysyk-Kol' || 
            d.properties.NAME_2 === 'Issyk-Kul' ||
            d.properties.NAME_2 === 'Song-Kol' || 
            d.properties.NAME_2 === 'Song-Kol(lake)' || 
            d.properties.NAME_2 === 'Song-kol') {
          return;
        }

        d3.select(this)
          .attr('fill-opacity', 0.7);

        const [mouseX, mouseY] = d3.pointer(event);
        const containerRect = containerRef.current?.getBoundingClientRect();
        const tooltipNode = tooltipRef.current;

        if (containerRect && tooltipNode) {
          let tooltipX = mouseX;
          let tooltipY = mouseY;

          tooltip
            .style('display', 'block')
            .style('left', `${tooltipX + 10}px`)
            .style('top', `${tooltipY + 10}px`)
            .html(() => {
              const rating = getRayonRating(d.properties.NAME_2);
              return `
                <div class="font-medium">${d.properties.NAME_2}</div>
                <div class="text-sm text-gray-600">Общая оценка: ${rating ? rating.toFixed(1) : 'Нет данных'}</div>
              `;
            });
        }
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('fill-opacity', 1);
        tooltip.style('display', 'none');
      });



    // Добавляем текст оценок поверх карты
    const textGroup = g.append('g')
      .attr('class', 'rating-labels');

    textGroup.selectAll('text')
      .data((rayonData as any).features)
      .join('text')
      .attr('x', (d: any) => path.centroid(d)[0])
      .attr('y', (d: any) => path.centroid(d)[1])
      .attr('text-anchor', 'middle')
      .style('pointer-events', 'none') // Отключаем события мыши для текста
      .attr('font-weight', 'bold')
      .attr('font-size', '10px')
      .text((d: any) => {
        if (d.properties.NAME_2 === 'Ysyk-Köl(lake)' || 
            d.properties.NAME_2 === 'Ysyk-Kol' || 
            d.properties.NAME_2 === 'Issyk-Kul' ||
            d.properties.NAME_2 === 'Song-Kol' || 
            d.properties.NAME_2 === 'Song-Kol(lake)' || 
            d.properties.NAME_2 === 'Song-kol') {
          return '';
        }
        const rating = getRayonRating(d.properties.NAME_2);
        return rating ? rating.toFixed(1) : '';
      });

  }, [selectedRayon, onSelectRayon]);

  return (
    <div ref={containerRef} className="relative w-full flex justify-center items-center overflow-hidden">
      <div className="w-full max-w-[1200px]">
        <svg 
          ref={svgRef} 
          className="w-full h-auto"
          style={{ cursor: 'grab' }}
        ></svg>
        <div
          ref={tooltipRef}
          className="absolute hidden bg-white px-2 py-1 rounded-md shadow-lg border border-gray-200 z-10"
          style={{ pointerEvents: 'none' }}
        ></div>
      </div>
    </div>
  );
}