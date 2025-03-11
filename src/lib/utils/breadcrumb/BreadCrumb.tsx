"use client";

import React from "react";
import Link from "next/link"; // Импортируем Link
import { ChevronRight } from "lucide-react";
import { getTranslation, useSurveyData } from "@/context/SurveyContext";

interface BreadcrumbProps {
  regionName?: string | null;
  courtName?: string | null;
  onCourtBackClick?: () => void; // Возврат к списку судов
  onRegionBackClick?: () => void; // Возврат к списку регионов
  showHome?: boolean; // Управление отображением второго "Главная" (HeaderNavThree/HeaderNavFour)
  headerKey?: "HeaderNavThree"   | "HeaderNavFour"; // Новый проп для выбора ключа перевода
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  regionName,
  courtName,
  onCourtBackClick,
  onRegionBackClick,
  showHome = true, // По умолчанию второй "Главная" отображается
  headerKey = "HeaderNavThree", // По умолчанию используем HeaderNavThree
}) => {
  const { language } = useSurveyData();

  // Определяем ключ перевода, если headerKey не передан
  const effectiveHeaderKey =
    headerKey || (regionName ? "HeaderNavThree" : "HeaderNavFour");

  return (
    <nav
      className="flex items-center space-x-2 text-sm text-gray-600 "
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-2 BreadCrumbText">
        {/* Фиксированная "Главная" с href="/" */}
        <li className="flex items-center">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            Главная
          </Link>
          {(showHome || regionName || courtName) && (
            <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
          )}
        </li>

        {/* Вторая "Главная" (HeaderNavThree или HeaderNavFour) - отображается только если showHome === true */}
        {showHome && (
          <li className="flex items-center">
            <button
              onClick={onRegionBackClick}
              className="text-blue-600 hover:text-blue-800 transition-colors duration-200 cursor-pointer disabled:text-gray-400 disabled:cursor-not-allowed"
              disabled={!onRegionBackClick}
            >
              {getTranslation(effectiveHeaderKey, language)}
            </button>
            {(regionName || courtName) && (
              <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
            )}
          </li>
        )}

        {/* Название региона */}
        {regionName && (
          <li className="flex items-center">
            {onCourtBackClick ? (
              <button
                onClick={onCourtBackClick}
                className="text-blue-600 hover:text-blue-800 transition-colors duration-200 cursor-pointer disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {regionName}
              </button>
            ) : (
              <span className="text-gray-800 font-medium">{regionName}</span>
            )}
            {courtName && (
              <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
            )}
          </li>
        )}

        {/* Название суда */}
        {courtName && (
          <li className="flex items-center">
            <span className="text-gray-800 font-medium truncate max-w-[15ch]">
              {courtName}
            </span>
          </li>
        )}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
