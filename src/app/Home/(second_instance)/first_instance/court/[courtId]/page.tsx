"use client";

import { useParams, useRouter } from "next/navigation";
import Breadcrumb from "@/lib/utils/breadcrumb/BreadCrumb";
import Dates from "@/components/Dates/Dates";
import Evaluations from "@/components/Evaluations/page";
import CourtApi from "@/lib/api/CourtAPI";

const CourtDetailsPage = () => {
  const params = useParams();
  const courtId = params?.courtId as string; 
  const router = useRouter();
  const courtName2 = typeof window !== 'undefined' ? localStorage.getItem("courtName2") : null;
  const handleBackClick = () => {
    router.back();
  };
  return (
    <div className="max-w-[1250px] mx-auto px-4 py-4">
      <Breadcrumb
        regionName="Оценки по области"
        courtName=""
        onCourtBackClick={handleBackClick}
        showHome={true}
      />
      <h2 className="text-3xl font-bold mb-4 mt-4">{courtName2}</h2>
      <Dates />
      {courtId && <CourtApi courtId={courtId} />}
      <Evaluations courtNameId={courtId} />
    </div>
  );
};

export default CourtDetailsPage;