import React from 'react';
import { DateRange } from '@/lib/utils/dateUtils';

interface CalendarProps {
  year: number;
  month: number;
  dateRange: DateRange;
  onDateSelect: (isoDate: string) => void;
  onMonthChange: (delta: number) => void;
}

const Calendar: React.FC<CalendarProps> = ({ year, month, dateRange, onDateSelect, onMonthChange }) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekDay = new Date(year, month, 1).getDay() || 7;
  const cells: React.ReactNode[] = [];
  const start = dateRange.startDate ? new Date(dateRange.startDate).getTime() : 0;
  const end = dateRange.endDate ? new Date(dateRange.endDate).getTime() : 0;

  for (let i = 1; i < firstWeekDay; i++) {
    cells.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${(month + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    const time = new Date(iso).getTime();
    const isStart = iso === dateRange.startDate;
    const isEnd = iso === dateRange.endDate;
    const inRange = dateRange.startDate && dateRange.endDate && time >= start && time <= end && !isStart && !isEnd;
    cells.push(
      <button
        key={iso}
        onClick={() => onDateSelect(iso)}
        className={`h-8 w-8 rounded flex items-center justify-center text-sm transition-all duration-200
          ${isStart || isEnd ? 'bg-blue-700 text-white' : inRange ? 'bg-blue-200' : 'hover:bg-blue-50 text-gray-700'}`}
      >
        {d}
      </button>
    );
  }

  return (
    <div className="p-3 bg-white rounded-md shadow-lg border border-gray-200 w-64">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => onMonthChange(-1)} className="p-1 rounded hover:bg-blue-50">‹</button>
        <span className="font-medium text-blue-800">{year} - {month + 1}</span>
        <button onClick={() => onMonthChange(1)} className="p-1 rounded hover:bg-blue-50">›</button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2 text-xs text-blue-500 font-medium">
        {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(day => (<div key={day} className="h-8 w-8 flex items-center justify-center">{day}</div>))}
      </div>
      <div className="grid grid-cols-7 gap-1">{cells}</div>
    </div>
  );
};
export default Calendar;