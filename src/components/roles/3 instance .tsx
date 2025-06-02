import React from "react";
import Dates from "@/components/Dates/Dates";
import DataFetcher from "../../lib/api/SummaryAPI";
import Evaluations  from '@/components/Evaluations/page';

const ThirdInstance = () => {
  return (
    <div className="mt-4">
      <Dates />
      <DataFetcher />
      <Evaluations />
    </div>
  );
};

export default ThirdInstance;