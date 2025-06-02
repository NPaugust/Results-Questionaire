"use client";

import { useEffect, useState, useCallback } from "react";
import { getCookie } from "@/lib/api/login";
import {
  getCircleCourtData,
  getRadarCourtData,
  getBarCourtData,
  getProgressCourtData,
  getColumnCourtData,
  getGenderAgeCourtData,
} from "@/lib/api/charts/charts";
import { useChartData } from "@/context/ChartDataContext";
import { useDateParams } from "@/context/DateParamsContext";

interface CourtApiProps {
  courtId?: string;
}

export default function CourtApi({ courtId }: CourtApiProps) {
  const [error, setError] = useState<string | null>(null);
  const {
    setCircleData,
    setRadarData,
    setBarData,
    setProgressData,
    setColumnData,
    setIsLoading,
    setSurveyResponsesCount,
    setGenderAgeData,
  } = useChartData();

  const { dateParams } = useDateParams();
  const effectiveCourtId = courtId || "65";

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      const token = getCookie("access_token");
      if (!token) throw new Error("Token is null");

      const [circleData, radarData, barData, progressData, columnData, genderAgeData] = await Promise.all([
        getCircleCourtData(effectiveCourtId, dateParams),
        getRadarCourtData(effectiveCourtId, dateParams),
        getBarCourtData(effectiveCourtId, dateParams),
        getProgressCourtData(effectiveCourtId, dateParams),
        getColumnCourtData(effectiveCourtId, dateParams),
        getGenderAgeCourtData(effectiveCourtId, dateParams), 
      ]);

      setCircleData(circleData || null);
      setRadarData(radarData || null);
      setBarData(barData || null);
      setProgressData(progressData || null);
      setColumnData(columnData || null);
      setGenderAgeData(genderAgeData || null); 
      setSurveyResponsesCount(radarData?.survey_responses_count || 0);

      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Произошла ошибка";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [
    effectiveCourtId,
    dateParams,
    setCircleData,
    setRadarData,
    setBarData,
    setProgressData,
    setColumnData,
    setIsLoading,
    setSurveyResponsesCount,
    setGenderAgeData,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (error) {
    return <div className="text-red-500">Ошибка: {error}</div>;
  }

  return null;
}