"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getCircleRegionData,
  getRadarRegionData,
  getBarRegionData,
  getProgressRegionData,
  getColumnRegionData,
  getGenderAgeRegionData,
} from "@/lib/api/charts/charts";
import { useChartData } from "@/context/ChartDataContext";
import { useDateParams } from "@/context/DateParamsContext";

export default function SummaryAPI2() {
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

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      const circlePromise = getCircleRegionData(dateParams).then((data) => {
        setCircleData(data);
      });
      const radarPromise = getRadarRegionData(dateParams).then((data) => {
        setRadarData(data);
        setSurveyResponsesCount(data.survey_responses_count || 0);
      });
      const barPromise = getBarRegionData(dateParams).then((data) => {
        setBarData(data);
      });
      const progressPromise = getProgressRegionData(dateParams).then((data) => {
        setProgressData(data);
      });
      const columnPromise = getColumnRegionData(dateParams).then((data) => {
        setColumnData(data);
      });
      const genderAgePromise = getGenderAgeRegionData(dateParams).then((data) => {
        setGenderAgeData(data);
      });

      await Promise.all([
        circlePromise,
        radarPromise,
        barPromise,
        progressPromise,
        columnPromise,
        genderAgePromise,
      ]);

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка");
      console.error("Ошибка при получении данных:", err);
    } finally {
      setIsLoading(false);
    }
  }, [
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
    return null;
  }

  return null;
}