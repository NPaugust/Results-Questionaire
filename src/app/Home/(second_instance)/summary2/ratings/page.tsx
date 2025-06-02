"use client";

import React from "react";
import Dates from "@/components/Dates/Dates";
import Evaluations from "@/components/Evaluations/page";
import SummaryAPI2 from "@/lib/api/SummaryAPI2";

export default function SecondInstanceSummaryPage() {
  
  return (
    <div className="max-w-[1250px] mx-auto px-4 py-4">
      <Dates />
      <SummaryAPI2 />
      <Evaluations />
    </div>
  );
}