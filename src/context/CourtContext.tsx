"use client";
import React, { createContext, useContext, useState, useMemo, ReactNode } from "react";
import { CourtContextType } from "../types/contextTypes";
import { RegionData, CourtData } from "../types/surveyTypes";

const CourtContext = createContext<CourtContextType | undefined>(undefined);

export function CourtProvider({ children }: { children: ReactNode }) {
  const [userCourt, setUserCourt] = useState<string | null>(null);
  const [courtName, setCourtName] = useState<string | null>(null);
  const [courtNameId, setCourtNameId] = useState<string | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<CourtData | null>(null);
  const [selectedCourtName, setSelectedCourtName] = useState<string | null>(null);
  const [selectedCourtId, setSelectedCourtId] = useState<number | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<RegionData[] | null>(null);
  const [regionName, setRegionName] = useState<string | null>(null);

  const value = useMemo(
    () => ({
      userCourt,
      setUserCourt,
      courtName,
      setCourtName,
      courtNameId,
      setCourtNameId,
      selectedCourt,
      setSelectedCourt,
      selectedCourtName,
      setSelectedCourtName,
      selectedCourtId,
      setSelectedCourtId,
      selectedRegion,
      setSelectedRegion,
      regionName,
      setRegionName,
    }),
    [
      userCourt,
      courtName,
      courtNameId,
      selectedCourt,
      selectedCourtName,
      selectedCourtId,
      selectedRegion,
      regionName,
    ]
  );

  return <CourtContext.Provider value={value}>{children}</CourtContext.Provider>;
}

export function useCourt() {
  const context = useContext(CourtContext);
  if (!context) throw new Error("useCourt must be used within a CourtProvider");
  return context;
}