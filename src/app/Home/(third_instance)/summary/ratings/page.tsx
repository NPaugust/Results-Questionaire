"use client";
import React from "react";
import Dates from "@/components/Dates/Dates";
import Evaluations from "@/components/Evaluations/page";
import DataFetcher from "@/lib/api/SummaryAPI";
import { withAuth } from "@/lib/withAuth";

function Home() {
  return (
    <div className="mt-4">
          <Dates />
          <DataFetcher />
          <Evaluations />
    </div>
  );
}

export default withAuth(Home);
