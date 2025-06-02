export interface SelectedOption {
    id: number;
    text_ru: string;
    text_kg: string;
    value?: number;
  }
  
  export interface QuestionResponse {
    id: number;
    selected_option: SelectedOption | null;
    multiple_selected_options?: SelectedOption[];
    text_response?: string;
    created_at: string;
    question: number;
    custom_answer: string | null;
    gender: string;
  }
  
  export interface Question {
    id: number;
    text: string;
    question_text: string;
    question_type: string;
    question_responses: QuestionResponse[];
    options?: string[];
  }
  
  export type Language = "ky" | "ru";
  
  export interface RegionData {
    id: number;
    name: string;
    overall: number;
    ratings: number[];
    totalAssessments: number;
  }
  
  export interface Assessment {
    aspect: string;
    court_avg: number;
    assessment_count: string;
  }
  
  export interface CourtData {
    court_id: number;
    court: string;
    instantiation: string;
    overall_assessment: number;
    assessment: Assessment[];
    assessment_count: string;
    total_survey_responses: number;
  }