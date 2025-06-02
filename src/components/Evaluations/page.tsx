"use client";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import SkeletonDashboard from "@/lib/utils/SkeletonLoader/SkeletonLoader";
import useEvaluationData from "@/hooks/useEvaluationsData";
import NoData from "../NoData/NoData";

interface RegionSummaryData {
  overall_rating: number;
  total_responses: number;
  courts_count: number;
  ratings_by_category: { [key: string]: number };
}

const RadarChart = React.lazy(() => import("../Charts/RadarChart"));
const CommentsSection = React.lazy(() => import("../Charts/CommentsSection"));
const CategoryPieChart = React.lazy(() => import("../Charts/CategoryPieChart"));
const DemographicsChart = React.lazy(() => import("../Charts/DemographicsChart"));
const CategoryJudgeChart = React.lazy(() => import("../Charts/CategoryJudgeChart"));
const TrafficSourceChart = React.lazy(() => import("../Charts/TrafficSourceChart"));
const RatingChart = React.lazy(() => import("../Charts/RatingChart"));
const ReusablePieChart = React.lazy(() => import("../Charts/ReusablePieChart"));
const DisrespectChart = React.lazy(() => import("../Charts/DisrespectChart"));
//courtNameId
export default function Evaluations({
  selectedCourtId,
  courtNameId,
  summaryData,
}: {
  selectedCourtId?: number | null;
  courtNameId?: string | null;
  summaryData?: RegionSummaryData | null;
}) {
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const pathname = usePathname();
  const [demographicsView, setDemographicsView] = useState("пол");

  let remarksPath = "/Home/summary/feedbacks";
  if (pathname.includes("/Home/supreme-court/rating")) {
    remarksPath = "/Home/supreme-court/feedbacks";
  } else if (pathname.startsWith("/Home/second-instance/")) {
    remarksPath = `/Home/second-instance${selectedCourtId ? `/${selectedCourtId}` : ""}/feedbacks`;
  } else if (pathname.startsWith("/Home/first_instance/court/")) {
    remarksPath = `/Home/first_instance/feedbacks/${courtNameId}`;
  } else if (pathname.startsWith("/Home/first-instance/") && pathname.endsWith("/rating")) {
    remarksPath = `/Home/first-instance/feedbacks/${courtNameId}`;
  } else if (pathname.startsWith("/Home/") && pathname.endsWith("/ratings2")) {
    const parts = pathname.split("/");
    const slug = parts[2];
    remarksPath = `/Home/${slug}/feedbacks2`;
  } else if (courtNameId) {
    remarksPath += `/${courtNameId}`;
  }

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const {
    categoryData,
    genderData,
    trafficSourceData,
    caseTypesData,
    audioVideoData,
    judgeRatings,
    staffRatings,
    processRatings,
    accessibilityRatings,
    officeRatings,
    startTimeData,
    radarData,
    totalResponses,
    totalResponsesAnswer,
    disrespectData,
    ageData,
    ageGenderData,
    comments,
    isLoading,
    disrespectPercentages
  } = useEvaluationData();

  if (isLoading) {
    return <SkeletonDashboard />;
  }
  
  if (!isLoading && totalResponses === 0) {
    return <NoData />;
  }

  return (
    <div className="min-h-screen mb-4">
      <div className="max-w-[1250px] mx-auto">
        <div className="grid grid-cols-2 gap-4 EvalutionCols">
          {radarData && radarData.datasets.length > 0 && (
            <RadarChart radarData={radarData} windowWidth={windowWidth} totalResponses={totalResponses} />
          )}
          <CommentsSection totalResponsesAnswer={totalResponsesAnswer} remarksPath={remarksPath} comments={comments} />
          {categoryData && categoryData.datasets[0].data.length > 0 && (
            <CategoryPieChart categoryData={categoryData} windowWidth={windowWidth} />
          )}
            <DemographicsChart
              genderData={genderData}
              ageGenderData={ageGenderData}
              ageData={ageData}
              demographicsView={demographicsView}
              setDemographicsView={setDemographicsView}
              windowWidth={windowWidth}
            />
            <TrafficSourceChart trafficSourceData={trafficSourceData} windowWidth={windowWidth} />
          {caseTypesData && caseTypesData.datasets[0].data.length > 0 && (
            <CategoryJudgeChart caseTypesData={caseTypesData} windowWidth={windowWidth} />
          )}
          {judgeRatings && Object.keys(judgeRatings).length > 0 && (
            <RatingChart ratings={judgeRatings} translationKey="DiagrammSeven" />
          )}
          {disrespectData && disrespectData.datasets[0].data.length > 0 && (
          <DisrespectChart
          disrespectData={disrespectData}
          windowWidth={windowWidth}
          percentages={disrespectPercentages}
        />
          )}
          {staffRatings && Object.keys(staffRatings).length > 0 && (
            <RatingChart ratings={staffRatings} translationKey="DiagrammNine" />
          )}
          {processRatings && Object.keys(processRatings).length > 0 && (
            <RatingChart ratings={processRatings} translationKey="DiagrammTen" />
          )}
          {audioVideoData && audioVideoData.datasets[0].data.length > 0 && (
            <ReusablePieChart
              data={audioVideoData}
              translationKey="DiagrammEleven"
              windowWidth={windowWidth}
              className="EvaluationsAudio"
            />
          )}
          {startTimeData && startTimeData.datasets[0].data.length > 0 && (
            <ReusablePieChart
              data={startTimeData}
              translationKey="DiagrammTwelve"
              windowWidth={windowWidth}
              className="EvaluationsTime"
            />
          )}
          {officeRatings && Object.keys(officeRatings).length > 0 && (
            <RatingChart ratings={officeRatings} translationKey="DiagrammThirteen" />
          )}
          {accessibilityRatings && Object.keys(accessibilityRatings).length > 0 && (
            <RatingChart ratings={accessibilityRatings} translationKey="DiagrammFourteen" />
          )}
        </div>
      </div>
    </div>
  );
}