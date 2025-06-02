"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Dates from "@/components/Dates/Dates";
import Evaluations from "@/components/Evaluations/page";
import CourtApi from "@/lib/api/CourtAPI";
import courtIdsData from "../../../../../../public/courtIds.json";

const RegionalCourtPage = () => {
  const params = useParams();
  const regionSlug = params?.region as string;
  const router = useRouter();

  const [courtName, setCourtName] = useState<string>("Неизвестный суд");
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null);


  useEffect(() => {
    if (!regionSlug) return;

    const matchedCourt = courtIdsData.courts.find(
      (court: { slug: string }) => court.slug === regionSlug
    );

    if (matchedCourt) {
      setCourtName(matchedCourt.court);
      setSelectedCourtId(matchedCourt.court_id.toString());
      if (typeof window !== 'undefined') {
        localStorage.setItem("matchedCourt", matchedCourt.court);
      }
    } else {
      setCourtName("Неизвестный суд");
      setSelectedCourtId(null);
    }
    
  }, [regionSlug]);

  const handleBackClick = () => {
    router.back();
  };

  return (
    <div className="max-w-[1250px] mx-auto px-4 py-4">
      <h2 className="text-3xl font-bold mb-4 mt-4">{courtName}</h2>
      <Dates />
      {selectedCourtId && <CourtApi courtId={selectedCourtId} />}
      <Evaluations courtNameId={regionSlug} />
    </div>
  );
};

export default RegionalCourtPage;
