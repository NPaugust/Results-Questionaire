import { getCookie } from "@/lib/api/login";

export const getRegionAssessmentData = async () => {
  const token = getCookie("access_token");
  if (!token) throw new Error("Token is null");

  const response = await fetch("https://opros.sot.kg/api/v1/assessment/regions/", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
  const data = await response.json();

  return data.regions.map((region: any) => ({
    id: region.region_id,
    name: region.region_name,
    overall: region.overall_region_assessment,
    totalAssessments: region.total_assessments,
    coordinates: [0, 0],
    courtId: region.region_id,
    ratings: [
      region.average_scores["Судья"] || 0,
      region.average_scores["Сотрудники"] || 0,
      region.average_scores["Процесс"] || 0,
      region.average_scores["Канцелярия"] || 0,
      region.average_scores["Здание"] || 0,
    ],
  }));
};

export const getCourtDetails = async (regionId: number) => {
  const token = getCookie("access_token");
  if (!token) throw new Error("Token is null");

  const response = await fetch(`https://opros.sot.kg/api/v1/assessment/region/${regionId}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
  const data = await response.json();

  return data.map((courtData: any) => ({
    id: courtData.court_id,
    name: courtData.court,
    overall: courtData.overall_assessment,
    ratings: courtData.assessment.map((item: any) => item.court_avg),
    totalAssessments: courtData.total_survey_responses,
    coordinates: [courtData.latitude, courtData.longitude],
    instantiation: courtData.instantiation,
  }));
};