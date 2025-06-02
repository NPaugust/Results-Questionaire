"use client";

import { useEffect, useCallback } from "react";
import {
  getCircleRepublicData,
  getRadarRepublicData,
  getBarRepublicData,
  getProgressRepublicData,
  getColumnRepublicData,
  getGenderAgeRepublicData,
} from "@/lib/api/charts/charts";
import { useChartData } from "@/context/ChartDataContext";
import { useDateParams } from "@/context/DateParamsContext";

export default function SummaryAPI() {
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
    setIsLoading(true);

    try {
      const circlePromise = getCircleRepublicData(dateParams).then((data) => {
        setCircleData(data);
      });
      const radarPromise = getRadarRepublicData(dateParams).then((data) => {
        setRadarData(data);
        setSurveyResponsesCount(data.survey_responses_count || 0);
      });
      const barPromise = getBarRepublicData(dateParams).then((data) => {
        setBarData(data);
      });
      const progressPromise = getProgressRepublicData(dateParams).then((data) => {
        setProgressData(data);
      });
      const columnPromise = getColumnRepublicData(dateParams).then((data) => {
        setColumnData(data);
      });
      const genderAgePromise = getGenderAgeRepublicData(dateParams).then((data) => {
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
    } catch (err) {
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

  return null;
}