import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from "react";

interface GenderAgeOption {
  text_ru: string;
  text_kg: string;
  "18–29": string; 
  "30–44": string;
  "45–59": string;
  "60 +": string;
}

interface GenderAgeData {
  Женский?: GenderAgeOption;
  Мужской?: GenderAgeOption;
}

interface SurveyData {
  radar?: { court?: string };
}

interface ChartDataType {
  circleData: any[] | null;
  radarData: { survey_responses_count?: number; data?: any[] } | null; 
  barData: any[] | null;
  progressData: any[] | null;
  columnData: any[] | null;
  genderAgeData: GenderAgeData[] | null; 
}

interface ChartDataContextType {
  circleData: ChartDataType["circleData"];
  setCircleData: Dispatch<SetStateAction<ChartDataType["circleData"]>>;
  radarData: ChartDataType["radarData"];
  setRadarData: Dispatch<SetStateAction<ChartDataType["radarData"]>>;
  barData: ChartDataType["barData"];
  setBarData: Dispatch<SetStateAction<ChartDataType["barData"]>>;
  progressData: ChartDataType["progressData"];
  setProgressData: Dispatch<SetStateAction<ChartDataType["progressData"]>>;
  columnData: ChartDataType["columnData"];
  setColumnData: Dispatch<SetStateAction<ChartDataType["columnData"]>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  surveyResponsesCount: number;
  setSurveyResponsesCount: Dispatch<SetStateAction<number>>;
  surveyData: SurveyData | null;
  setSurveyData: Dispatch<SetStateAction<SurveyData | null>>;
  genderAgeData: ChartDataType["genderAgeData"];
  setGenderAgeData: Dispatch<SetStateAction<ChartDataType["genderAgeData"]>>;
}

const ChartDataContext = createContext<ChartDataContextType | undefined>(undefined);

export const ChartDataProvider = ({ children }: { children: ReactNode }) => {
  const [circleData, setCircleData] = useState<ChartDataType["circleData"]>(null);
  const [radarData, setRadarData] = useState<ChartDataType["radarData"]>(null);
  const [barData, setBarData] = useState<ChartDataType["barData"]>(null);
  const [progressData, setProgressData] = useState<ChartDataType["progressData"]>(null);
  const [columnData, setColumnData] = useState<ChartDataType["columnData"]>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [surveyResponsesCount, setSurveyResponsesCount] = useState<number>(0);
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);
  const [genderAgeData, setGenderAgeData] = useState<ChartDataType["genderAgeData"]>(null);

  return (
    <ChartDataContext.Provider
      value={{
        circleData,
        setCircleData,
        radarData,
        setRadarData,
        barData,
        setBarData,
        progressData,
        setProgressData,
        columnData,
        setColumnData,
        isLoading,
        setIsLoading,
        surveyResponsesCount,
        setSurveyResponsesCount,
        surveyData,
        setSurveyData,
        genderAgeData,
        setGenderAgeData,
      }}
    >
      {children}
    </ChartDataContext.Provider>
  );
};

export const useChartData = () => {
  const context = useContext(ChartDataContext);
  if (!context) {
    throw new Error("useChartData must be used within a ChartDataProvider");
  }
  return context;
};