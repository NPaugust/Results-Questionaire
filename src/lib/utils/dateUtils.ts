export interface DateRange {
  startDate: string;
  endDate: string;
  year: string;
}
export interface Period {
  id: number;
  type: string
  label: string;
}

export const formatDisplayDate = (iso: string): string => {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y.slice(2)}`;
};

export const formatISODate = (display: string): string => {
  const [d, m, yy] = display.split(".");
  const y = yy.length === 2 ? `20${yy}` : yy;
  return `${y}-${m}-${d}`;
};

export const getQuarterDates = (
  year: string,
  quarterId: number
): [string, string] => {
  switch (quarterId) {
    case 0:
      return [`${year}-01-01`, `${year}-03-31`];
    case 1:
      return [`${year}-04-01`, `${year}-06-30`];
    case 2:
      return [`${year}-07-01`, `${year}-09-30`];
    case 3:
      return [`${year}-10-01`, `${year}-12-31`];
    default:
      return ["", ""];
  }
};

export const getMonthDates = (
  year: string,
  monthIndex: number
): [string, string] => {
  const m = (monthIndex + 1).toString().padStart(2, "0");
  const lastDay = new Date(Number(year), monthIndex + 1, 0).getDate();
  return [`${year}-${m}-01`, `${year}-${m}-${lastDay}`];
};
