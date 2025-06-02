"use client";

import Header from "@/components/layout/Header/Header";
import { SurveyProvider } from "@/context/SurveyProvider";

export default function CourtLayout({ children }: { children: React.ReactNode }) {
  return (
    <SurveyProvider>
      <Header />
      <div>{children}</div>
    </SurveyProvider>
  );
} 