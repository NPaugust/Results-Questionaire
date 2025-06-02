import { Dispatch, SetStateAction } from "react";
import { Language, RegionData, CourtData } from "./surveyTypes";

export interface ChartDataContextType {
  circleData: any | null;
  setCircleData: Dispatch<SetStateAction<any | null>>;
  radarData: any | null;
  setRadarData: Dispatch<SetStateAction<any | null>>;
  barData: any | null;
  setBarData: Dispatch<SetStateAction<any | null>>;
  progressData: any | null;
  setProgressData: Dispatch<SetStateAction<any | null>>;
  columnData: any | null;
  setColumnData: Dispatch<SetStateAction<any | null>>;
  totalResponses: number;
  setTotalResponses: Dispatch<SetStateAction<number>>;
  surveyResponsesCount: number;
  setSurveyResponsesCount: Dispatch<SetStateAction<number>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

export interface CourtContextType {
  userCourt: string | null;
  setUserCourt: Dispatch<SetStateAction<string | null>>;
  courtName: string | null;
  setCourtName: Dispatch<SetStateAction<string | null>>;
  courtNameId: string | null;
  setCourtNameId: Dispatch<SetStateAction<string | null>>;
  selectedCourt: CourtData | null;
  setSelectedCourt: Dispatch<SetStateAction<CourtData | null>>;
  selectedCourtName: string | null;
  setSelectedCourtName: Dispatch<SetStateAction<string | null>>;
  selectedCourtId: number | null;
  setSelectedCourtId: Dispatch<SetStateAction<number | null>>;
  selectedRegion: RegionData[] | null;
  setSelectedRegion: Dispatch<SetStateAction<RegionData[] | null>>;
  regionName: string | null;
  setRegionName: Dispatch<SetStateAction<string | null>>;
}

export interface LanguageContextType {
  language: Language;
  setLanguage: Dispatch<SetStateAction<Language>>;
  toggleLanguage: () => void;
}

export interface DateParamsContextType {
  dateParams: { year?: string; quarter?: number; month?: number };
  setDateParams: Dispatch<SetStateAction<{ year?: string; quarter?: number; month?: number }>>;
}