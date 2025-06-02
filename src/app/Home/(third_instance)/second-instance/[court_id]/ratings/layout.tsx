"use client";
import { SurveyProvider } from "@/context/SurveyProvider";

export default function RegionalCourtsLayout({ children }: { children: React.ReactNode }) {
  return (
    <SurveyProvider>
      <div>{children}</div>
    </SurveyProvider> 
  );
}
