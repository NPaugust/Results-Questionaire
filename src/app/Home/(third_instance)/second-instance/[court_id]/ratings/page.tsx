"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Breadcrumb from "@/lib/utils/breadcrumb/BreadCrumb";
import Dates from "@/components/Dates/Dates";
import Evaluations from "@/components/Evaluations/page";
import CourtDataFetcher from "@/lib/api/CourtAPI";
import { useCourt } from "@/context/CourtContext";
import { useChartData } from "@/context/ChartDataContext";

const CourtRatingPage = () => {
  const params = useParams();
  const router = useRouter();
  const courtId = params?.court_id as string;

  const {
    selectedCourtId,
    selectedCourtName,
    setSelectedCourtId,
    setSelectedCourtName,
    regionName,
    setRegionName,
  } = useCourt();
  const {setSurveyData, isLoading} = useChartData()

  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    const loadCourtData = async () => {
      const storedRegionName = typeof window !== 'undefined' ? localStorage.getItem("regionName") : null;
      if (storedRegionName && !regionName) {
        setRegionName(storedRegionName);
      }

      if (!courtId) {
        setIsDataLoading(false);
        return;
      }

      const storedCourtId = typeof window !== 'undefined' ? localStorage.getItem("selectedCourtId") : null;
      const storedCourtName = typeof window !== 'undefined' ? localStorage.getItem("selectedCourtName") : null;

      if (courtId === storedCourtId && storedCourtName && selectedCourtId) {
        setIsDataLoading(false);
        return;
      }

      setSelectedCourtId(Number(courtId));
      setSelectedCourtName(storedCourtName || "Неизвестный суд");
      
      if (typeof window !== 'undefined') {
        localStorage.setItem("selectedCourtId", courtId);
        localStorage.setItem("selectedCourtName", storedCourtName || "Неизвестный суд");
      }

      setIsDataLoading(false);
    };

    loadCourtData();
  }, [courtId, regionName, setRegionName, setSelectedCourtId, setSelectedCourtName]);

  if (isDataLoading) {
    return <div>Loadi..</div>;
  }

  const breadcrumbSource = typeof window !== 'undefined' ? localStorage.getItem("breadcrumbSource") : null;
  const headerKey = breadcrumbSource === "courts" ? "BreadCrumb_CourtName" : "BreadCrumb_RegionName";

  return (
    <div className="mt-8 max-w-[1250px] mx-auto px-4 py-4">
      <Breadcrumb
        regionName={regionName}
        courtName={selectedCourtName}
        onCourtBackClick={() => {
          setSelectedCourtId(null);
          setSelectedCourtName(null);
          setSurveyData(null);
          router.push(`/results/Home/second-instance/regions`);
        }}
        onRegionBackClick={() => {
          setSelectedCourtId(null);
          setSelectedCourtName(null);
          setSurveyData(null);
          router.push("/results/Home/second-instance/regions");
        }}
        headerKey={headerKey}
      />
      <h2 className="text-3xl font-bold mb-4 mt-4">{selectedCourtName}</h2>
      <div className="space-y-6">
        <Dates />
        <CourtDataFetcher courtId={courtId} /> {/* Передаем динамический courtId */}
        {isLoading ? <div>Loading data...</div> : <Evaluations selectedCourtId={selectedCourtId} />}
      </div>
    </div>
  );
};

export default CourtRatingPage;