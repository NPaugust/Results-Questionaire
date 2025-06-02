"use client";
import React, { ReactNode } from "react";
import { LanguageProvider } from "./LanguageContext";
import { ChartDataProvider } from "./ChartDataContext";
import { CourtProvider } from "./CourtContext";
import { DateParamsProvider } from "./DateParamsContext";

export function SurveyProvider({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <ChartDataProvider>
        <CourtProvider>
          <DateParamsProvider>{children}</DateParamsProvider>
        </CourtProvider>
      </ChartDataProvider>
    </LanguageProvider>
  );
}