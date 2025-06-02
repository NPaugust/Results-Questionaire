"use client";
import React, { createContext, useContext, useState, useMemo, ReactNode } from "react";

interface DateParams {
  startDate?: string;
  endDate?: string;
}

interface DateParamsContextType {
  dateParams: DateParams;
  setDateParams: (params: DateParams) => void;
}

const DateParamsContext = createContext<DateParamsContextType | undefined>(undefined);

export function DateParamsProvider({ children }: { children: ReactNode }) {
  const [dateParams, setDateParams] = useState<DateParams>({ startDate: "2025-01-01", endDate: "2025-12-31" });

  const value = useMemo(() => ({ dateParams, setDateParams }), [dateParams]);

  return <DateParamsContext.Provider value={value}>{children}</DateParamsContext.Provider>;
}

export function useDateParams() {
  const context = useContext(DateParamsContext);
  if (!context) throw new Error("useDateParams must be used within a DateParamsProvider");
  return context;
}